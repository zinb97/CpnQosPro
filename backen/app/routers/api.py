"""Dashboard 实时数据 API：所有 `/api/metrics/*` 端点。

每个端点：
- 调用 Prometheus HTTP API
- 失败时返回空状态（前端显示 "—" 或空列表），不抛 500
- 设置 `Cache-Control: max-age=N` 与前端轮询周期对齐
"""
from __future__ import annotations

from datetime import datetime, timedelta
from typing import Any

from fastapi import APIRouter, Request
from fastapi.responses import JSONResponse

from app.prometheus.client import PrometheusClient
from app.prometheus.queries import (
    Q_BANDWIDTH_RANGE,
    Q_CLUSTERS_UP,
    Q_CPU_CORES,
    Q_EVENTS,
    Q_HOSTS,
    Q_LINKS,
    Q_LINKS_QUALITY,
    Q_MEMORY_TOTAL,
    Q_ONLINE_CLUSTERS,
    Q_ONLINE_NODES,
    Q_PACKET_IN,
    Q_POLICIES,
    Q_SLICES,
    Q_SWITCHES,
    Q_TOTAL_NODES,
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


# ===== Endpoints =====


@router.get("/overview")
async def overview(request: Request) -> JSONResponse:
    """8 个 Dashboard 指标卡聚合查询。"""
    cli = _client(request)

    # 并发抓 9 条指标（cards 列表包含 packet-in）
    import asyncio
    results = await asyncio.gather(
        cli.query(Q_ONLINE_CLUSTERS),
        cli.query(Q_TOTAL_NODES),
        cli.query(Q_ONLINE_NODES),
        cli.query(Q_CPU_CORES),
        cli.query(Q_MEMORY_TOTAL),
        cli.query(Q_SWITCHES),
        cli.query(Q_LINKS),
        cli.query(Q_HOSTS),
        cli.query(Q_PACKET_IN),
        return_exceptions=True,
    )
    # 任一异常都视为 Prometheus 不可用（取最后一次 health 决定）
    prom_ok = not any(isinstance(r, Exception) for r in results)

    def _scalar_safe(idx: int) -> float | None:
        r = results[idx]
        return _scalar(r) if isinstance(r, list) else None

    payload = {
        "prom_ok": prom_ok,
        "online_clusters": metric_card(_scalar_safe(0), "个"),
        "total_nodes": metric_card(_scalar_safe(1), "个"),
        "online_nodes": metric_card(_scalar_safe(2), "个"),
        "cpu_cores": metric_card(_scalar_safe(3), "核"),
        "memory_total": metric_card(_scalar_safe(4), "TB"),
        "switches": metric_card(_scalar_safe(5), "个"),
        "links": metric_card(_scalar_safe(6), "条"),
        "hosts": metric_card(_scalar_safe(7), "个"),
        "packet_in": metric_card(_scalar_safe(8), "次"),
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
    """地图数据：集群散点 + 集群间链路。"""
    cli = _client(request)
    cluster_meta: dict[str, dict[str, Any]] = request.app.state.cluster_meta

    # 拉取各集群在线节点数
    try:
        up_results = await cli.query(Q_CLUSTERS_UP)
    except Exception:
        up_results = []

    # 聚合 cluster → 在线节点数
    online_by_cluster: dict[str, int] = {}
    for r in up_results:
        labels = r.get("metric", {})
        cluster_id = labels.get("cluster")
        if not cluster_id:
            continue
        try:
            online_by_cluster[cluster_id] = int(float(r["value"][1]))
        except (KeyError, ValueError, TypeError):
            continue

    # 合并元数据（经纬度）→ 前端可直接渲染
    clusters: list[dict[str, Any]] = []
    for cid, meta in cluster_meta.items():
        online = online_by_cluster.get(cid, 0)
        status = "healthy" if online > 0 else "offline"
        clusters.append({
            "id": cid,
            "name": meta.get("name", cid),
            "region": meta.get("region", ""),
            "location": meta.get("location", [0, 0]),
            "online_nodes": online,
            "status": status,
        })

    # 兜底：Prometheus 不可达时仍展示元数据（用于地图基本形状）
    if not online_by_cluster and cluster_meta:
        for c in clusters:
            c["online_nodes"] = 0
            c["status"] = "unknown"

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