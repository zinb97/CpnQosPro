#!/usr/bin/env python3
"""
Linux Metrics Collector
收集 metrics_extracted.csv 中列出的所有指标
"""

import os
import time
import glob
from typing import Optional

import json

try:
    import psutil
except ImportError:
    psutil = None


def read_file(path: str) -> Optional[str]:
    """安全读取文件"""
    try:
        with open(path, 'r') as f:
            return f.read().strip()
    except (IOError, OSError):
        return None


def get_cpu_freq() -> tuple:
    """获取CPU频率"""
    try:
        with open('/sys/devices/system/cpu/cpu0/cpufreq/cpuinfo_max_freq', 'r') as f:
            max_freq = int(f.read().strip()) * 1000  # kHz to Hz
        with open('/sys/devices/system/cpu/cpu0/cpufreq/cpuinfo_min_freq', 'r') as f:
            min_freq = int(f.read().strip()) * 1000
        return max_freq, min_freq
    except:
        return None, None


def get_cpu_stats() -> dict:
    """获取CPU统计信息"""
    try:
        stats = {}
        with open('/proc/stat', 'r') as f:
            for line in f:
                cpu, stat = None, {}
                if line.startswith('cpu'):
                    fields = line.split()
                    cpu = fields[0]
                    stat['user'] = int(fields[1])
                    stat['nice'] = int(fields[2])
                    stat['system'] = int(fields[3])
                    stat['idle'] = int(fields[4])
                    stat['iowait'] = int(fields[5])
                    stat['irq'] = int(fields[6])
                    stat['softirq'] = int(fields[7])
                    stat['steal'] = int(fields[8]) if len(fields) > 8 else 0
                if cpu:
                    stats[cpu] = stat

        return stats
    except:
        return {}


def get_context_switches() -> Optional[int]:
    """获取上下文切换次数"""
    try:
        with open('/proc/stat', 'r') as f:
            for line in f:
                if line.startswith('ctxt '):
                    return int(line.split()[1])
        return None
    except:
        return None


def get_intr() -> Optional[int]:
    """获取中断总数"""
    try:
        with open('/proc/stat', 'r') as f:
            for line in f:
                if line.startswith('intr '):
                    return int(line.split()[1])
        return None
    except:
        return None


def get_meminfo() -> dict:
    """获取内存信息"""
    meminfo = {}
    try:
        with open('/proc/meminfo', 'r') as f:
            for line in f:
                parts = line.split()
                if len(parts) >= 2:
                    key = parts[0].rstrip(':')
                    try:
                        meminfo[key] = int(parts[1]) * 1024  # KB to bytes
                    except ValueError:
                        pass
    except:
        pass
    return meminfo


def get_filesystem_info() -> list:
    """获取文件系统信息"""
    fs_info = []
    try:
        for line in glob.glob('/proc/self/mountinfo') or glob.glob('/proc/mounts'):
            try:
                with open('/proc/mounts', 'r') as f:
                    for line in f:
                        fields = line.split()
                        if len(fields) >= 4:
                            device = fields[0]
                            mountpoint = fields[1]
                            fstype = fields[2]
                            if fstype in ('ext4', 'xfs', 'btrfs', 'overlay'):
                                try:
                                    stat = os.statvfs(mountpoint)
                                    fs_info.append({
                                        'device': device,
                                        'mountpoint': mountpoint,
                                        'fstype': fstype,
                                        'size': stat.f_blocks * stat.f_frsize,
                                        'free': stat.f_bfree * stat.f_frsize,
                                        'avail': stat.f_bavail * stat.f_frsize,
                                    })
                                except:
                                    pass
            except:
                pass
            break
    except:
        pass
    return fs_info


def get_hwmon_info() -> list:
    """获取硬件监控信息"""
    hwmon_info = []
    try:
        for hwmon_path in glob.glob('/sys/class/hwmon/hwmon*'):
            try:
                name = read_file(os.path.join(hwmon_path, 'name')) or 'hwmon'
                # Power
                for pwr_file in ['power_average', 'power_is_battery']:
                    pwr_path = os.path.join(hwmon_path, pwr_file)
                    if os.path.exists(pwr_path):
                        try:
                            val = read_file(pwr_path)
                            if val:
                                hwmon_info.append({
                                    'type': 'power',
                                    'name': name,
                                    'file': pwr_file,
                                    'value': float(val),
                                })
                        except:
                            pass
                # Temp
                for temp_file in glob.glob(os.path.join(hwmon_path, 'temp*_input')):
                    try:
                        val = read_file(temp_file)
                        if val:
                            hwmon_info.append({
                                'type': 'temp',
                                'name': name,
                                'file': os.path.basename(temp_file),
                                'value': float(val) / 1000,  # millidegrees to Celsius
                            })
                    except:
                        pass
            except:
                pass
    except:
        pass
    return hwmon_info


def get_thermal_zones() -> list:
    """获取散热区温度"""
    zones = []
    try:
        for zone_path in glob.glob('/sys/class/thermal/thermal_zone*'):
            try:
                temp_file = os.path.join(zone_path, 'temp')
                if os.path.exists(temp_file):
                    val = read_file(temp_file)
                    if val:
                        zones.append({
                            'zone': os.path.basename(zone_path),
                            'temp': float(val) / 1000,
                        })
            except:
                pass
    except:
        pass
    return zones


def get_disk_stats() -> list:
    """获取磁盘统计"""
    disk_stats = []
    try:
        for disk_path in glob.glob('/sys/block/*/stat'):
            try:
                disk_name = os.path.basename(os.path.dirname(disk_path))
                if disk_name.startswith('loop') or disk_name in ['sr0', 'sr0']:
                    continue
                with open(disk_path, 'r') as f:
                    fields = f.read().split()
                    if len(fields) >= 11:
                        disk_stats.append({
                            'device': disk_name,
                            'reads_completed': int(fields[0]),
                            'reads_merged': int(fields[1]),
                            'sectors_read': int(fields[2]),
                            'read_time': int(fields[3]),
                            'writes_completed': int(fields[4]),
                            'writes_merged': int(fields[5]),
                            'sectors_written': int(fields[6]),
                            'write_time': int(fields[7]),
                            'io_time': int(fields[9]),
                        })
            except:
                pass
    except:
        pass
    return disk_stats


def get_boot_time() -> Optional[int]:
    """获取启动时间"""
    try:
        with open('/proc/stat', 'r') as f:
            for line in f:
                if line.startswith('btime '):
                    return int(line.split()[1])
        return None
    except:
        return None


def get_os_info() -> dict:
    """获取OS信息，解析 /etc/os-release"""
    info = {}
    try:
        with open('/etc/os-release', 'r') as f:
            for line in f:
                line = line.strip()
                if '=' in line and 'URL' not in line:
                    key, value = line.split('=', 1)
                    value = value.strip('"')
                    info[key] = value
    except:
        pass
    return info


def get_network_stats() -> dict:
    """获取网络统计"""
    net_stats = {}
    try:
        with open('/proc/net/dev', 'r') as f:
            f.readline()  # skip header
            f.readline()  # skip header
            for line in f:
                fields = line.split()
                if len(fields) >= 10:
                    iface = fields[0].rstrip(':')
                    # 过滤掉 loopback、bridge、docker、veth
                    if iface in ('lo',) or iface.startswith(('br', 'docker', 'veth', 'b.')):
                        continue
                    net_stats[iface] = {
                        'rx_bytes': int(fields[1]),
                        'rx_packets': int(fields[2]),
                        'tx_bytes': int(fields[9]),
                        'tx_packets': int(fields[10]),
                    }
    except:
        pass
    return net_stats


def get_netstat_tcp_udp() -> dict:
    """获取TCP/UDP netstat统计"""
    stats = {}
    try:
        with open('/proc/net/snmp', 'r') as f:
            f.readline()  # header
            for line in f:
                fields = line.split()
                if len(fields) >= 6:
                    proto = fields[0].lower()
                    if proto in ('tcp', 'udp'):
                        stats[f'{proto}_in_segs'] = int(fields[5])
                        stats[f'{proto}_out_segs'] = int(fields[6])
        # TCP current established
        try:
            with open('/proc/net/netstat', 'r') as f:
                f.readline()
                for line in f:
                    if line.startswith('TcpExt:'):
                        fields = line.split()
                        for i, f in enumerate(fields):
                            if f == 'CurrEstab':
                                stats['tcp_curr_estab'] = int(fields[i])
                                break
                        break
        except:
            pass
    except:
        pass
    return stats


def get_sockstat() -> dict:
    """获取套接字统计"""
    sockstat = {}
    try:
        with open('/proc/net/sockstat', 'r') as f:
            for line in f:
                if line.startswith('sockets: used'):
                    parts = line.split()
                    for i, p in enumerate(parts):
                        if p == 'used':
                            sockstat['sockets_used'] = int(parts[i + 1])
                            break
    except:
        pass
    return sockstat


def get_schedstats() -> dict:
    """获取调度器统计"""
    schedstats = {}
    try:
        # Per-CPU scheduler stats
        for cpu_path in glob.glob('/sys/devices/system/cpu/cpu*/schedstat'):
            try:
                with open(cpu_path, 'r') as f:
                    fields = f.read().split()
                    if len(fields) >= 3:
                        cpu_id = os.path.basename(os.path.dirname(cpu_path))
                        if 'running_seconds' not in schedstats:
                            schedstats['running_seconds'] = 0
                            schedstats['timeslices'] = 0
                            schedstats['waiting_seconds'] = 0
                        schedstats['running_seconds'] += int(fields[0])
                        schedstats['timeslices'] += int(fields[1])
                        schedstats['waiting_seconds'] += int(fields[2])
            except:
                pass
    except:
        pass
    return schedstats


def get_loadavg() -> dict:
    """获取负载信息"""
    try:
        with open('/proc/loadavg', 'r') as f:
            fields = f.read().split()
            return {
                'load1': float(fields[0]),
                'load5': float(fields[1]),
                'load15': float(fields[2]),
            }
    except:
        return {}


def get_process_stats() -> dict:
    """获取进程统计"""
    stats = {}
    try:
        with open('/proc/loadavg', 'r') as f:
            pass  # just check if readable
        # Count processes
        try:
            count_running = 0
            count_blocked = 0
            for pid in os.listdir('/proc'):
                if pid.isdigit():
                    try:
                        with open(f'/proc/{pid}/status', 'r') as sf:
                            for line in sf:
                                if line.startswith('State:'):
                                    state = line.split()[1]
                                    if state == 'R':
                                        count_running += 1
                                    elif state == 'D':
                                        count_blocked += 1
                                    break
                    except:
                        pass
            stats['procs_running'] = count_running
            stats['procs_blocked'] = count_blocked
        except:
            pass
        # Forks
        try:
            with open('/proc/stat', 'r') as f:
                for line in f:
                    if line.startswith('processes '):
                        stats['forks_total'] = int(line.split()[1])
                        break
        except:
            pass
    except:
        pass
    return stats


def get_dmi_info() -> dict:
    """获取DMI信息"""
    dmi = {}
    try:
        for key in ['bios_date', 'bios_vendor', 'bios_version', 'product_name', 'system_vendor']:
            val = read_file(f'/sys/class/dmi/id/{key}')
            if val:
                dmi[key] = val
    except:
        pass
    return dmi


def get_filefd_info() -> dict:
    """获取文件描述符信息"""
    fd_info = {}
    try:
        # Allocated
        allocated = 0
        for fd_path in glob.glob('/proc/*/fd'):
            try:
                allocated += 1
            except:
                pass
        fd_info['allocated'] = allocated
        # Maximum
        try:
            with open('/proc/sys/fs/file-max', 'r') as f:
                fd_info['maximum'] = int(f.read().strip())
        except:
            pass
    except:
        pass
    return fd_info


def collect_metrics() -> dict:
    """收集所有指标"""
    metrics = {}
    timestamp = time.time()

    # # CPU frequency
    # max_freq, min_freq = get_cpu_freq()
    # metrics['node_cpu_frequency_max_hertz'] = max_freq
    # metrics['node_cpu_frequency_min_hertz'] = min_freq

    # # CPU seconds
    # cpu_stats = get_cpu_stats()
    # if cpu_stats:
    #     metrics['node_cpu_seconds_total'] = cpu_stats

    # # Context switches
    # ctx_switches = get_context_switches()
    # if ctx_switches is not None:
    #     metrics['node_context_switches_total'] = ctx_switches

    # # Interrupts
    # intr = get_intr()
    # if intr is not None:
    #     metrics['node_intr_total'] = intr
    #
    # # Memory
    # meminfo = get_meminfo()
    # metrics['node_memory_MemFree_bytes'] = meminfo.get('MemFree')
    # metrics['node_memory_MemAvailable_bytes '] = meminfo.get('MemAvailable')
    # metrics['node_memory_MemTotal_bytes'] = meminfo.get('MemTotal')
    # metrics['node_memory_SwapFree_bytes'] = meminfo.get('SwapFree')
    # metrics['node_memory_SwapTotal_bytes'] = meminfo.get('SwapTotal')
    #
    # # File descriptor
    # fd_info = get_filefd_info()
    # metrics['node_filefd_allocated'] = fd_info.get('allocated')
    # metrics['node_filefd_maximum'] = fd_info.get('maximum')

    # # Filesystem
    # metrics['filesystem'] = get_filesystem_info()

    # # DMI info
    # dmi = get_dmi_info()
    # metrics['node_dmi_info'] = dmi

    # # Hwmon power
    # hwmon_power = {}
    # for hw in get_hwmon_info():
    #     name = hw['name']
    #     if hw['type'] == 'power':
    #         if 'average' in hw['file']:
    #             hwmon_power[name] = hw['value']
    #         elif 'battery' in hw['file']:
    #             hwmon_power[name] = hw['value']
    #         else:
    #             hwmon_power[name] = hw['value']
    # metrics['node_hwmon_power_average_watt'] = hwmon_power
    # metrics['node_hwmon_power_is_battery_watt'] = hwmon_power
    # metrics['node_hwmon_power_average_interval_seconds'] = hwmon_power

    # # Hwmon temp
    # hwmon_temp = {}
    # for hw in get_hwmon_info():
    #     if hw['type'] == 'temp':
    #         hwmon_temp[hw['name']] = hw['value']
    # metrics['node_hwmon_temp_celsius'] = hwmon_temp
    #
    # # Thermal zones
    # thermal = {}
    # for zone in get_thermal_zones():
    #     thermal[zone['zone']] = zone['temp']
    # metrics['node_thermal_zone_temp'] = thermal
    #
    # # Disk stats
    # # print(json.dumps(get_disk_stats(), indent=4, ensure_ascii=False))
    # metrics['disk'] = get_disk_stats()

    # # Boot time
    # boot_time = get_boot_time()
    # metrics['node_boot_time_seconds'] = boot_time
    # metrics['node_time_seconds'] = int(timestamp)

    # # OS info
    # metrics['node_os_info'] = get_os_info()

    # # Network
    # metrics['network'] = get_network_stats()

    # net_stats = {}
    # for iface, stats in get_network_stats().items():
    #     net_stats[iface] = {
    #         'rx_bytes': stats['rx_bytes'],
    #         'tx_bytes': stats['tx_bytes'],
    #     }
    # metrics['node_network_receive_bytes_total'] = net_stats
    # metrics['node_network_transmit_bytes_total'] = net_stats
    #
    # # Netstat
    # netstat = get_netstat_tcp_udp()
    # metrics['node_netstat_Tcp_InSegs'] = netstat.get('tcp_in_segs')
    # metrics['node_netstat_Tcp_OutSegs'] = netstat.get('tcp_out_segs')
    # metrics['node_netstat_Udp_InDatagrams'] = netstat.get('udp_in_segs')
    # metrics['node_netstat_Udp_OutDatagrams'] = netstat.get('udp_out_segs')
    # metrics['node_netstat_Tcp_CurrEstab'] = netstat.get('tcp_curr_estab')
    #
    # # Sockstat
    # sockstat = get_sockstat()
    # metrics['node_sockstat_sockets_used'] = sockstat.get('sockets_used')
    #
    # # Schedstat
    # schedstats = get_schedstats()
    # metrics['node_schedstat_running_seconds_total'] = schedstats.get('running_seconds')
    # metrics['node_schedstat_timeslices_total'] = schedstats.get('timeslices')
    # metrics['node_schedstat_waiting_seconds_total'] = schedstats.get('waiting_seconds')
    #
    # # Load average
    # load = get_loadavg()
    # metrics['node_load1'] = load.get('load1')
    # metrics['node_load5'] = load.get('load5')
    # metrics['node_load15'] = load.get('load15')
    #
    # # Process stats
    # proc_stats = get_process_stats()
    # metrics['node_forks_total'] = proc_stats.get('forks_total')
    # metrics['node_procs_running'] = proc_stats.get('procs_running')
    # metrics['node_procs_blocked'] = proc_stats.get('procs_blocked')

    return metrics


def format_prometheus(metrics: dict) -> str:
    """格式化输出为Prometheus文本格式"""
    lines = []
    for name, value in sorted(metrics.items()):
        if '{' in name:
            # Metric with labels
            lines.append(f'{name} {value}')
        else:
            lines.append(f'{name} {value}')
    return '\n'.join(lines)


if __name__ == '__main__':
    import sys

    if '--prometheus' in sys.argv:
        print(format_prometheus(collect_metrics()))
    else:
        metrics = collect_metrics()
        # for name, value in sorted(metrics.items()):
        #     print(f'{name}: {value}')
        print(json.dumps(metrics, indent=4, ensure_ascii=False))
