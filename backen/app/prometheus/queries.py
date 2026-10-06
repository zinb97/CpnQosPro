"""PromQL 常量与集群元数据加载。"""
from __future__ import annotations

from pathlib import Path
from typing import Any

import yaml


# ===== Dashboard 9 个指标卡 =====
# 集群数 / 总节点数 / 在线节点数 由 `/api/v1/targets` 推导（PrometheusClient.targets），
# 不再用 PromQL（up{job=~"node-.*"} 系列）。
Q_CPU_CORES = "count(node_cpu_seconds_total{mode='system'})"
Q_MEMORY_TOTAL = "sum(node_memory_MemTotal_bytes{})"
Q_SWITCHES = "qos_switches_count"
Q_LINKS = "qos_links_count"
Q_HOSTS = "qos_hosts_count"
Q_PACKET_IN = "SUM(qos_switch_packet_in_total)"


# ===== 地图数据 =====
# 各集群在线节点数与集群列表均由 /api/v1/targets 推导（PrometheusClient.targets），
# 不再用 PromQL（up{job=~"node-.*"} 系列）。
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


# ===== 资源管控中心页面 PromQL 模板 =====
# collector 暴露的指标命名遵循 Prometheus node_exporter 风格：
#   node_cpu_seconds_total{mode="..."}      CPU 各模式累计秒
#   node_memory_MemTotal_bytes / MemAvailable_bytes / MemFree_bytes
#   node_load1 / node_load5 / node_load15
#   node_filesystem_size_bytes / node_filesystem_avail_bytes
#   node_thermal_zone_temp{zone, type}
#   node_network_receive_bytes_total / node_network_transmit_bytes_total
#   node_uname_info{...} / node_os_info{...} / node_dmi_info{...}
#   node_procs_running / node_procs_blocked / node_boot_time_seconds
#
# scrape 配置会注入 labels.cluster（每个节点归到自己的集群）和 labels.instance。
# 集群聚合用 `by(cluster)`，节点级过滤用 `{instance="..."}` 或 `{cluster="..."}`。


def q_cluster_cpu_usage(cluster_id: str) -> str:
    """集群 CPU 平均使用率（1m 窗口）。
    """
    return (
        f'avg by(cluster) (1 - avg by(instance) (avg by(cpu, instance) (rate(node_cpu_seconds_total{{cluster="{cluster_id}",mode="idle",cpu!=""}}[1m]))))'
    )

def q_cluster_mem_usage(cluster_id: str) -> str:
    """集群内存使用率：1 - MemAvailable / MemTotal。"""
    return (
        f'avg by(cluster) (1 - '
        f'node_memory_MemAvailable_bytes{{cluster="{cluster_id}"}}'
        f'/ node_memory_MemTotal_bytes{{cluster="{cluster_id}"}})'
    )


def q_cluster_load(cluster_id: str) -> str:
    """集群 1 分钟负载均值。"""
    return f'avg by(cluster) (node_load1{{cluster="{cluster_id}"}})'


def q_cluster_cpu_cores(cluster_id: str) -> str:
    """集群 CPU 核心总数（各节点 cores 之和）。"""
    return (
        f'count by(cluster) '
        f'(node_cpu_seconds_total{{cluster="{cluster_id}",mode="system",cpu!=""}})'
    )


def q_cluster_mem_total(cluster_id: str) -> str:
    """集群内存总字节数。"""
    return f'sum by(cluster) (node_memory_MemTotal_bytes{{cluster="{cluster_id}"}})'


def q_cluster_max_temp(cluster_id: str) -> str:
    """集群最高温度（°C）。"""
    return f'max by(cluster) (node_thermal_zone_temp{{cluster="{cluster_id}"}})'


def q_node_cpu_usage(instance: str) -> str:
    """单节点 CPU 使用率（1m 窗口）。"""
    return (
        f'1 - avg by(instance) (sum by(instance,cpu) (rate(node_cpu_seconds_total{{instance="{instance}",mode="idle",cpu!=""}}[1m])))'
    )

def q_node_load1(instance: str) -> str:
    return f'node_load1{{instance="{instance}"}}'


def q_node_mem_total(instance: str) -> str:
    return f'node_memory_MemTotal_bytes{{instance="{instance}"}}'


def q_node_mem_avail(instance: str) -> str:
    return f'node_memory_MemAvailable_bytes{{instance="{instance}"}}'


def q_node_procs_running(instance: str) -> str:
    return f'node_procs_running{{instance="{instance}"}}'


def q_node_boot_time(instance: str) -> str:
    return f'node_boot_time_seconds{{instance="{instance}"}}'


def q_node_max_temp(instance: str) -> str:
    return f'max(node_thermal_zone_temp{{instance="{instance}"}})'


def q_node_disk_total(instance: str) -> str:
    """单节点所有块设备读取+写入速率（bytes/s, 5m 窗口）— 反映磁盘 IO 繁忙程度。"""
    return (
        f'sum(rate(node_disk_read_bytes_total{{instance="{instance}"}}[5m]))'
        f' + sum(rate(node_disk_written_bytes_total{{instance="{instance}"}}[5m]))'
    )


def q_node_network_rx(instance: str) -> str:
    return f'sum(rate(node_network_receive_bytes_total{{instance="{instance}"}}[5m]))'


def q_node_network_tx(instance: str) -> str:
    return f'sum(rate(node_network_transmit_bytes_total{{instance="{instance}"}}[5m]))'


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
