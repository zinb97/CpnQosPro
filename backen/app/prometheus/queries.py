"""PromQL 常量与集群元数据加载。"""
from __future__ import annotations

from pathlib import Path
from typing import Any

import yaml


# ===== Dashboard 9 个指标卡 =====
Q_ONLINE_CLUSTERS = "count(count by(cluster) (up{job=~\"node-.*\"}))"
Q_TOTAL_NODES = "count(count by(instance) (up{job=~\"node-.*\"}))"
Q_ONLINE_NODES = "count( up{job=~\"node-.*\"} == 1 )"
Q_CPU_CORES = "count(node_cpu_seconds_total{mode='system'})"
Q_MEMORY_TOTAL = "sum(node_memory_MemTotal_bytes{})"
Q_SWITCHES = "qos_switches_count"
Q_LINKS = "qos_links_count"
Q_HOSTS = "qos_hosts_count"
Q_PACKET_IN = "SUM(qos_switch_packet_in_total)"


# ===== 地图数据 =====
# 各集群当前在线节点数（用于地图散点的 value）
Q_CLUSTERS_UP = "count by(cluster) (up{job=~\"node-.*\"} == 1)"
# 各集群总算力（占位：实际 PromQL 需 collector 暴露 qos_cluster_total_flops 之类指标）
Q_CLUSTERS_FLOPS = "sum by(cluster) (qos_cluster_total_flops)"
Q_CLUSTERS_USED_FLOPS = "sum by(cluster) (qos_cluster_used_flops)"


# ===== 带宽趋势（24h，5m 步进）=====
Q_BANDWIDTH_RANGE = "sum(rate(node_network_transmit_bytes_total[5m]))"
Q_LATENCY_RANGE = "qos_link_latency_ms"


# ===== 兜底 PromQL：UI 已有但 PromQL 不确定 =====
# 切片 / QoS 策略 / 链路 / 事件 — 这些在原 mock 中均为硬编码，
# 新版用空状态展示（dashboard.html 与 dashboard.js 已支持）。
# 待真实 exporter 暴露指标后在此补全 PromQL 即可生效。
Q_SLICES = "sum by(slice) (qos_slice_cpu_used)"
Q_LINKS_QUALITY = "qos_link_quality"
Q_POLICIES = "qos_policy_info"
Q_EVENTS = "ALERTS"


def load_cluster_locations(path: str | Path) -> dict[str, dict[str, Any]]:
    """加载集群元数据 → {cluster_id: {name, region, location, ...}}。

    若文件不存在或解析失败，返回空字典（地图降级为无坐标散点）。
    """
    p = Path(path)
    if not p.exists():
        return {}
    try:
        data = yaml.safe_load(p.read_text(encoding="utf-8")) or {}
    except yaml.YAMLError:
        return {}
    return {c["id"]: c for c in data.get("clusters", []) if "id" in c}