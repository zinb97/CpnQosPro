"""Dashboard 实时数据 API：所有 `/api/metrics/*` 端点。

每个端点：
- 调用 Prometheus HTTP API
- 失败时返回空状态（前端显示 "—" 或空列表），不抛 500
- 设置 `Cache-Control: max-age=N` 与前端轮询周期对齐
"""
from __future__ import annotations

from datetime import datetime, timedelta
from typing import Any

from fastapi import APIRouter, HTTPException, Request
from fastapi.responses import JSONResponse

from app.prometheus.client import PrometheusClient
from app.prometheus.queries import (
    Q_BANDWIDTH_RANGE,
    Q_CPU_CORES,
    Q_EVENTS,
    Q_HOSTS,
    Q_LINKS,
    Q_LINKS_QUALITY,
    Q_MEMORY_TOTAL,
    Q_PACKET_IN,
    Q_POLICIES,
    Q_SLICES,
    Q_SWITCHES,
)


router = APIRouter(prefix="/api/metrics")


# ===== Helpers =====

BYTES_PER_TB = 1024 ** 4


def _scalar(result: list[dict[str, Any]]) -> float | None:
    """取第一条结果的数值。空列表或解析失败返回 None。"""
    if not result:
        return None
    try:
        value = result[0].get("value", [None, None])[1]
        return float(value) if value is not None else None
    except (KeyError, TypeError, ValueError):
        return None


def metric_card(value: float | None, unit: str) -> dict[str, Any]:
    """统一指标卡数据形状：{value, unit}，无数据时 value=null。"""
    if value is None:
        return {"value": None, "unit": unit}
    if unit == "TB":
        return {"value": round(value / BYTES_PER_TB, 1), "unit": unit}
    return {"value": int(value), "unit": unit}


def cache_response(content: Any, max_age: int) -> JSONResponse:
    """带 Cache-Control 头的 JSON 响应。"""
    return JSONResponse(
        content=content,
        headers={"Cache-Control": f"public, max-age={max_age}"},
    )


def _client(request: Request) -> PrometheusClient:
    return request.app.state.prom


async def _safe_query(request: Request, promql: str) -> list[dict[str, Any]]:
    """统一的 Prometheus 查询包装：捕获所有异常，返回空列表。"""
    try:
        return await _client(request).query(promql)
    except Exception:
        return []


def _summarize_targets(targets: list[dict[str, Any]]) -> tuple[int, int, int]:
    """从 `/api/v1/targets` 结果推导 (集群数, 总节点数, 在线节点数)。

    只统计 `labels.job` 以 `node-` 开头的目标（节点 exporter 抓取任务）；
    基础设施 job（prometheus、ryu-controller 等）自动排除。
    集群数取 `labels.cluster` 的 distinct 数。
    """
    clusters: set[str] = set()
    total = 0
    online = 0
    for t in targets:
        labels = t.get("labels") or {}
        if not (labels.get("job") or "").startswith("node-"):
            continue
        cluster_id = labels.get("cluster", "")
        if cluster_id:
            clusters.add(cluster_id)
        total += 1
        if t.get("health") == "up":
            online += 1
    return len(clusters), total, online


# ===== Endpoints =====


@router.get("/overview")
async def overview(request: Request) -> JSONResponse:
    """8 个 Dashboard 指标卡聚合查询。

    集群数 / 总节点数 / 在线节点数由 `/api/v1/targets` 推导；
    其余 6 个指标走 PromQL。
    """
    cli = _client(request)

    # 并发：1 个 /targets + 6 条 PromQL
    import asyncio
    results = await asyncio.gather(
        cli.targets(),
        cli.query(Q_CPU_CORES),
        cli.query(Q_MEMORY_TOTAL),
        cli.query(Q_SWITCHES),
        cli.query(Q_LINKS),
        cli.query(Q_HOSTS),
        cli.query(Q_PACKET_IN),
        return_exceptions=True,
    )
    prom_ok = not any(isinstance(r, Exception) for r in results)

    targets_data = results[0]
    if isinstance(targets_data, list):
        online_clusters, total_nodes, online_nodes = _summarize_targets(targets_data)
    else:
        online_clusters = total_nodes = online_nodes = None

    def _scalar_safe(idx: int) -> float | None:
        r = results[idx]
        return _scalar(r) if isinstance(r, list) else None

    payload = {
        "prom_ok": prom_ok,
        "online_clusters": metric_card(online_clusters, "个"),
        "total_nodes": metric_card(total_nodes, "个"),
        "online_nodes": metric_card(online_nodes, "个"),
        "cpu_cores": metric_card(_scalar_safe(1), "核"),
        "memory_total": metric_card(_scalar_safe(2), "TB"),
        "switches": metric_card(_scalar_safe(3), "个"),
        "links": metric_card(_scalar_safe(4), "条"),
        "hosts": metric_card(_scalar_safe(5), "个"),
        "packet_in": metric_card(_scalar_safe(6), "次"),
    }
    return cache_response(payload, max_age=request.app.state.settings.cards_cache_s)


@router.get("/bandwidth")
async def bandwidth(request: Request) -> JSONResponse:
    """24h 带宽趋势（5m 步进）。"""
    end = datetime.now()
    start = end - timedelta(hours=24)
    try:
        results = await _client(request).query_range(
            Q_BANDWIDTH_RANGE, start, end, step="5m",
        )
    except Exception:
        results = []

    series: list[dict[str, float | str]] = []
    if results:
        for ts, v in results[0].get("values", []):
            try:
                series.append({
                    "time": datetime.fromtimestamp(float(ts)).strftime("%H:%M"),
                    "value": round(float(v), 2),
                })
            except (ValueError, TypeError):
                continue

    return cache_response(
        {"series": series, "unit": "Mbps"},
        max_age=request.app.state.settings.charts_cache_s,
    )


@router.get("/map")
async def map_data(request: Request) -> JSONResponse:
    """地图数据：集群散点 + 集群间链路。

    集群列表与在线节点数均从 `/api/v1/targets` 推导：
    - 集群枚举：distinct `labels.cluster`（仅统计 `job` 以 `node-` 开头的目标）
    - 在线节点数：每个集群下 `health == "up"` 的目标数
    - 名称/区域/经纬度：从 `cluster_locations.yaml` 按 `cluster.id` 匹配查表
    """
    cli = _client(request)
    cluster_meta: dict[str, dict[str, Any]] = request.app.state.cluster_meta

    # 1. 从 /api/v1/targets 聚合：cluster → 在线节点数 + 集群集合
    try:
        targets = await cli.targets()
    except Exception:
        targets = []

    online_by_cluster: dict[str, int] = {}
    cluster_ids: set[str] = set()
    for t in targets:
        labels = t.get("labels") or {}
        if not (labels.get("job") or "").startswith("node-"):
            continue
        cid = labels.get("cluster", "")
        if not cid:
            continue
        cluster_ids.add(cid)
        if t.get("health") == "up":
            online_by_cluster[cid] = online_by_cluster.get(cid, 0) + 1

    # 2. 合并 yaml 元数据 → 前端可直接渲染
    clusters: list[dict[str, Any]] = []
    for cid in cluster_ids:
        meta = cluster_meta.get(cid, {})
        online = online_by_cluster.get(cid, 0)
        status = "healthy" if online > 0 else "offline"
        clusters.append({
            "id": cid,
            "name": meta.get("name", cid),
            "region": meta.get("region", ""),
            "province": meta.get("province", ""),
            "location": meta.get("location", [0, 0]),
            "online_nodes": online,
            "status": status,
        })

    # 兜底：targets 不可达时仍展示 yaml 中的元数据（地图基本形状）
    if not cluster_ids and cluster_meta:
        for cid, meta in cluster_meta.items():
            clusters.append({
                "id": cid,
                "name": meta.get("name", cid),
                "region": meta.get("region", ""),
                "province": meta.get("province", ""),
                "location": meta.get("location", [0, 0]),
                "online_nodes": 0,
                "status": "unknown",
            })

    return cache_response(
        {"clusters": clusters, "links": []},
        max_age=request.app.state.settings.charts_cache_s,
    )


@router.get("/slices")
async def slices(request: Request) -> JSONResponse:
    """网络切片占用数据。PromQL 不确定时返回空列表，前端显示空状态。"""
    results = await _safe_query(request, Q_SLICES)
    items: list[dict[str, Any]] = []
    for r in results:
        labels = r.get("metric", {})
        try:
            used = float(r["value"][1])
        except (KeyError, ValueError, TypeError):
            continue
        items.append({
            "name": labels.get("slice", labels.get("name", "unknown")),
            "cpu_used": int(used),
        })
    return cache_response({"items": items}, max_age=request.app.state.settings.charts_cache_s)


@router.get("/links")
async def links_quality(request: Request) -> JSONResponse:
    """链路质量列表（延迟 / 丢包率）。"""
    results = await _safe_query(request, Q_LINKS_QUALITY)
    items: list[dict[str, Any]] = []
    for r in results:
        labels = r.get("metric", {})
        try:
            value = float(r["value"][1])
        except (KeyError, ValueError, TypeError):
            continue
        items.append({
            "source": labels.get("source", ""),
            "target": labels.get("target", ""),
            "latency": value,
        })
    return cache_response({"items": items}, max_age=request.app.state.settings.charts_cache_s)


@router.get("/policies")
async def policies(request: Request) -> JSONResponse:
    """QoS 策略列表。"""
    results = await _safe_query(request, Q_POLICIES)
    items: list[dict[str, Any]] = []
    for r in results:
        labels = r.get("metric", {})
        items.append({
            "name": labels.get("name", "unknown"),
            "type": labels.get("type", ""),
            "priority": labels.get("priority", ""),
            "status": labels.get("status", "active"),
        })
    return cache_response({"items": items}, max_age=request.app.state.settings.charts_cache_s)


@router.get("/events")
async def events(request: Request) -> JSONResponse:
    """实时事件流（Prometheus ALERTS 兜底，Prometheus 非事件型系统）。"""
    results = await _safe_query(request, Q_EVENTS)
    items: list[dict[str, Any]] = []
    for r in results:
        labels = r.get("metric", {})
        items.append({
            "alertname": labels.get("alertname", ""),
            "state": labels.get("alertstate", ""),
            "severity": labels.get("severity", ""),
        })
    return cache_response({"items": items}, max_age=request.app.state.settings.cards_cache_s)


# ===== 资源管控中心页面数据 =====


async def _list_node_targets(request: Request) -> list[dict[str, Any]]:
    """取 /api/v1/targets 中 `job` 以 `node-` 开头的目标列表。"""
    try:
        targets = await _client(request).targets()
    except Exception:
        return []
    return [t for t in targets if (t.get("labels") or {}).get("job", "").startswith("node-")]


@router.get("/clusters")
async def clusters(request: Request) -> JSONResponse:
    """集群列表：按 cluster_id 聚合节点目标，叠加 yaml 元数据。

    每项含：id, name, region, province, location, online_nodes, total_nodes, status。
    Prometheus 不可达时降级为仅展示 yaml 元数据（status='unknown'）。
    """
    cluster_meta: dict[str, dict[str, Any]] = request.app.state.cluster_meta
    node_targets = await _list_node_targets(request)

    online_by_cluster: dict[str, int] = {}
    total_by_cluster: dict[str, int] = {}
    for t in node_targets:
        labels = t.get("labels") or {}
        cid = labels.get("cluster", "")
        if not cid:
            continue
        total_by_cluster[cid] = total_by_cluster.get(cid, 0) + 1
        if t.get("health") == "up":
            online_by_cluster[cid] = online_by_cluster.get(cid, 0) + 1

    items: list[dict[str, Any]] = []
    for cid, meta in cluster_meta.items():
        total = total_by_cluster.get(cid, 0)
        online = online_by_cluster.get(cid, 0)
        if total == 0 and not node_targets:
            status = "unknown"
        elif total == 0:
            status = "offline"
        elif online == total:
            status = "healthy"
        elif online == 0:
            status = "offline"
        else:
            status = "warning"
        items.append({
            "id": cid,
            "name": meta.get("name", cid),
            "region": meta.get("region", ""),
            "province": meta.get("province", ""),
            "location": meta.get("location", [0, 0]),
            "online_nodes": online,
            "total_nodes": total,
            "status": status,
        })

    return cache_response({"items": items}, max_age=request.app.state.settings.cards_cache_s)


@router.get("/clusters/{cluster_id}")
async def cluster_detail(cluster_id: str, request: Request) -> JSONResponse:
    """集群详情：集群元数据 + 节点列表 + 聚合指标。"""
    cluster_meta: dict[str, dict[str, Any]] = request.app.state.cluster_meta
    meta = cluster_meta.get(cluster_id)
    if not meta:
        raise HTTPException(status_code=404, detail=f"cluster '{cluster_id}' not found")

    node_targets = await _list_node_targets(request)
    nodes: list[dict[str, Any]] = []
    online = total = 0
    for t in node_targets:
        labels = t.get("labels") or {}
        if labels.get("cluster") != cluster_id:
            continue
        total += 1
        health = t.get("health")
        if health == "up":
            online += 1
        nodes.append({
            "instance": labels.get("instance", ""),
            "job": labels.get("job", ""),
            "health": health or "unknown",
            "last_scrape": t.get("lastScrape"),
            "last_error": t.get("lastError"),
        })

    if total == 0 and not node_targets:
        status = "unknown"
    elif online == total and total > 0:
        status = "healthy"
    elif online == 0:
        status = "offline"
    else:
        status = "warning"

    payload = {
        **meta,
        "id": cluster_id,
        "status": status,
        "online_nodes": online,
        "total_nodes": total,
        "nodes": nodes,
    }
    return cache_response(payload, max_age=request.app.state.settings.cards_cache_s)


@router.get("/hosts/{instance:path}")
async def host_detail(instance: str, request: Request) -> JSONResponse:
    """主机详情：从 /api/v1/targets 中按 instance 字段定位单条 node-* 目标。"""
    cluster_meta: dict[str, dict[str, Any]] = request.app.state.cluster_meta
    node_targets = await _list_node_targets(request)

    target = next(
        (
            t for t in node_targets
            if (t.get("labels") or {}).get("instance") == instance
        ),
        None,
    )
    if not target:
        raise HTTPException(status_code=404, detail=f"host '{instance}' not found")

    labels = target.get("labels") or {}
    cid = labels.get("cluster", "")
    cluster = cluster_meta.get(cid, {})
    payload = {
        "instance": instance,
        "job": labels.get("job", ""),
        "cluster_id": cid,
        "cluster_name": cluster.get("name", cid),
        "region": cluster.get("region", ""),
        "province": cluster.get("province", ""),
        "health": target.get("health") or "unknown",
        "last_scrape": target.get("lastScrape"),
        "last_error": target.get("lastError"),
    }
    return cache_response(payload, max_age=request.app.state.settings.cards_cache_s)