#!/usr/bin/env python3
"""
Linux Host Collector
封装为主机采集器类，所有文件只打开读取一次
"""

import os
import time
import json
import glob
import socket


class HostCollector:
    def __init__(self):
        self._data = {}  # 所有采集的原始数据

    def collect(self, per_cpu=True) -> dict:
        self._collect_all(per_cpu=per_cpu)
        return self._data

    def _collect_all(self, per_cpu=False):
        """一次性采集所有原始数据

        Args:
            per_cpu: 是否读取每个 CPU 核心的详细数据，默认只读总计数据
        """
        self._data = {
            'os_info': self._read_os_info(),
            'dmi': self._read_dmi(),
            'uname': self._read_uname(),
            'cpu_stat': self._read_cpu_stat(per_cpu=per_cpu),
            'loadavg': self._read_loadavg(),
            'meminfo': self._read_meminfo(),
            'snmp': self._read_snmp(),
            'network': self._read_network(),
            'sockstat': self._read_sockstat(),
            'netstat': self._read_netstat(),
            'diskstats': self._read_diskstats(),
            'mounts': self._read_mounts(),
            'thermal': self._read_thermal(),
        }

    def _read_file(self, path: str, default=None):
        """安全读取文件"""
        try:
            with open(path, 'r') as f:
                return f.read().strip()
        except:
            return default

    def _read_lines(self, path: str) -> list:
        """读取文件所有行"""
        try:
            with open(path, 'r') as f:
                return [line.strip() for line in f.read().splitlines() if line.strip()]
        except:
            return []

    def _read_os_info(self) -> dict:
        """读取 /etc/os-release """
        info = {}
        for line in self._read_lines('/etc/os-release'):
            if '=' in line and 'URL' not in line:
                key, value = line.split('=', 1)
                value = value.strip('"')
                info[key] = value
        return info

    def _read_dmi(self) -> dict:
        """读取 DMI 信息"""
        dmi = {}
        for key in ['bios_date', 'bios_vendor', 'bios_version', 'product_name', 'system_vendor']:
            val = self._read_file(f'/sys/class/dmi/id/{key}')
            if val:
                dmi[key] = val
        return dmi

    def _read_uname(self) -> dict:
        """读取 uname 信息"""
        try:
            import platform
            uname = platform.uname()
            return {
                'sysname': uname.system,
                'nodename': uname.node,
                'release': uname.release,
                'version': uname.version,
                'machine': uname.machine,
            }
        except:
            return {}

    def _read_cpu_stat(self, per_cpu=False) -> dict:
        """读取 /proc/stat

        Args:
            per_cpu: 是否读取每个 CPU 核心的详细数据，默认只读总计数据
        """
        stats = {}
        for line in self._read_lines('/proc/stat'):
            fields = line.split()
            if not fields:
                continue

            # 总计行：cpu 或 特定统计行
            if fields[0] == 'ctxt':
                stats['ctxt'] = int(fields[1])
            elif fields[0] == 'btime':
                stats['btime'] = int(fields[1])
            elif fields[0] == 'processes':
                stats['processes'] = int(fields[1])
            elif fields[0] == 'procs_running':
                stats['procs_running'] = int(fields[1])
            elif fields[0] == 'procs_blocked':
                stats['procs_blocked'] = int(fields[1])
            elif fields[0] == 'softirq':
                stats['softirq'] = {
                    'total': int(fields[1]),
                    'hi': int(fields[2]),
                    'timer': int(fields[3]),
                    'net_trans': int(fields[4]),
                    'net_recv': int(fields[5]),
                    ' sched': int(fields[6]),
                    'rcu': int(fields[7]) if len(fields) > 7 else 0,
                }
            elif fields[0].startswith('cpu') and len(fields) >= 8:
                cpu = fields[0]
                if per_cpu or cpu == 'cpu':
                    stats[cpu] = {
                        'user': int(fields[1]) / 100,
                        'nice': int(fields[2]) / 100,
                        'system': int(fields[3]) / 100,
                        'idle': int(fields[4]) / 100,
                        'iowait': int(fields[5]) / 100,
                        'irq': int(fields[6]) / 100,
                        'softirq': int(fields[7]) / 100,
                        'steal': int(fields[8]) / 100 if len(fields) > 8 else 0,
                    }

        # 合并总计数据
        return stats

    def _read_loadavg(self) -> dict:
        """读取 /proc/loadavg """
        lines = self._read_lines('/proc/loadavg')
        if not lines:
            return {}
        fields = lines[0].split()
        run_proc = 0
        total_proc = 0
        if len(fields) >= 4 and '/' in fields[3]:
            run_proc, total_proc = fields[3].split("/")
        return {
            'load1': float(fields[0]) if len(fields) > 0 else 0.0,
            'load5': float(fields[1]) if len(fields) > 1 else 0.0,
            'load15': float(fields[2]) if len(fields) > 2 else 0.0,
            'running_process': int(run_proc) if run_proc.isdigit() else 0,
            'total_process': int(total_proc) if total_proc.isdigit() else 0,
            'last_pid': int(fields[4]) if len(fields) > 4 and fields[4].isdigit() else 0,
        }

    def _read_meminfo(self) -> dict:
        """读取 /proc/meminfo """
        meminfo = {}
        for line in self._read_lines('/proc/meminfo'):
            parts = line.split()
            if len(parts) >= 2 and parts[0].endswith(':'):
                key = parts[0].rstrip(':')
                try:
                    meminfo[key] = int(parts[1]) * 1024
                except:
                    pass
        return meminfo

    def _read_diskstats(self) -> list:
        """读取 /proc/diskstats """
        disks = []
        for line in self._read_lines('/proc/diskstats'):
            fields = line.split()
            if len(fields) >= 14:
                device = fields[2]
                if device.startswith('loop') or device.startswith('ram'):
                    continue
                item = {
                    'major': int(fields[0]),
                    'minor': int(fields[1]),
                    'device': device,
                    'reads_completed': int(fields[3]),
                    'reads_merged': int(fields[4]),
                    'sectors_read': int(fields[5]),
                    'read_time_ms': int(fields[6]),
                    'writes_completed': int(fields[7]),
                    'writes_merged': int(fields[8]),
                    'sectors_written': int(fields[9]),
                    'write_time_ms': int(fields[10]),
                    'in_flight_io': int(fields[11]),
                    'io_time_ms': int(fields[12]),
                    'queue_total_wait_ms': int(fields[13]),
                    'discard_completed': 0,
                    'discard_merged': 0,
                    'discard_sectors': 0,
                    'discard_time_ms': 0,
                    'flush_completed': 0,
                    'flush_time_ms': 0,
                }
                # 如果有20列，覆盖discard/flush字段
                if len(fields) >= 20:
                    item['discard_completed'] = int(fields[14])
                    item['discard_merged'] = int(fields[15])
                    item['discard_sectors'] = int(fields[16])
                    item['discard_time_ms'] = int(fields[17])
                    item['flush_completed'] = int(fields[18])
                    item['flush_time_ms'] = int(fields[19])
                disks.append(item)
        return disks

    def _read_network(self) -> dict:
        """读取 /proc/net/dev """
        net = {}
        for line in self._read_lines('/proc/net/dev')[2:]:
            fields = line.split()
            if len(fields) >= 10:
                iface = fields[0].rstrip(':')
                if iface in ('lo',) or iface.startswith(('br', 'docker', 'veth', 'b.')):
                    continue
                net[iface] = {
                    'rx_bytes': int(fields[1]),
                    'rx_packets': int(fields[2]),
                    'rx_errs': int(fields[3]),
                    'rx_drop': int(fields[4]),
                    'tx_bytes': int(fields[9]),
                    'tx_packets': int(fields[10]),
                    'tx_errs': int(fields[11]),
                    'tx_drop': int(fields[12]),
                }
        return net

    def _read_snmp(self) -> dict:
        """读取 /proc/net/snmp """
        stats = {}
        lines = self._read_lines('/proc/net/snmp')
        for i in range(0, len(lines) - 1, 2):
            header_line = lines[i]
            value_line = lines[i + 1]
            try:
                proto_h, header_fields_str = header_line.split(":", maxsplit=1)
                proto_v, value_fields_str = value_line.split(":", maxsplit=1)
                proto_name = proto_h.strip()
                headers = header_fields_str.strip().split()
                values_raw = value_fields_str.strip().split()
                proto_dict = {}
                for k, v in zip(headers, values_raw):
                    proto_dict[k] = int(v)
                stats[proto_name] = proto_dict
            except:
                pass
        return stats

    def _read_sockstat(self) -> dict:
        """读取 /proc/net/sockstat """
        sockstat = {}
        for line in self._read_lines('/proc/net/sockstat'):
            parts = line.split()
            if len(parts) >= 2:
                proto_name = parts[0].rstrip(":")
                data = {}
                for i in range(1, len(parts) - 1, 2):
                    try:
                        k = parts[i]
                        v = int(parts[i + 1])
                        data[k] = v
                    except:
                        pass
                sockstat[proto_name] = data
        return sockstat

    def _read_netstat(self) -> dict:
        """读取 /proc/net/netstat """
        stats = {}
        lines = self._read_lines('/proc/net/netstat')
        for i in range(0, len(lines) - 1, 2):
            header_line = lines[i]
            value_line = lines[i + 1]
            try:
                proto_h, header_fields_str = header_line.split(":", maxsplit=1)
                proto_v, value_fields_str = value_line.split(":", maxsplit=1)
                proto_name = proto_h.strip()
                headers = header_fields_str.strip().split()
                values_raw = value_fields_str.strip().split()
                proto_dict = {}
                for k, v in zip(headers, values_raw):
                    proto_dict[k] = int(v)
                stats[proto_name] = proto_dict
            except:
                pass
        return stats

    def _read_thermal(self) -> list:
        """读取 thermal zone 信息"""
        zones = []
        for zone_path in glob.glob('/sys/class/thermal/thermal_zone*'):
            try:
                temp_file = os.path.join(zone_path, 'temp')
                type_file = os.path.join(zone_path, 'type')
                type_ = self._read_file(type_file) if os.path.exists(type_file) else None
                val = int(self._read_file(temp_file)) if os.path.exists(temp_file) else None
                if val and type_:
                    zones.append({
                        'zone': zone_path[-1],
                        'type': type_,
                        'temp': val / 1000,
                    })
            except:
                pass
        return zones

    def _read_mounts(self) -> list:
        """读取挂载点信息"""
        mounts = []
        seen_devices = set()
        try:
            for line in self._read_lines('/proc/mounts'):
                fields = line.split()
                device = fields[0]
                if '/dev' not in device or 'loop' in device:
                    continue

                if device not in seen_devices:
                    seen_devices.add(device)
                else:
                    continue

                mountpoint = fields[1]
                try:
                    stat = os.statvfs(mountpoint)
                    total_bytes = stat.f_blocks * stat.f_frsize
                    avail_bytes = stat.f_bavail * stat.f_frsize
                    used_bytes = (stat.f_blocks - stat.f_bfree) * stat.f_frsize
                except OSError:
                    total_bytes = None
                    avail_bytes = None
                    used_bytes = None

                if len(fields) >= 4:
                    mounts.append({
                        'device': device,
                        'mountpoint': mountpoint,
                        'fstype': fields[2],
                        'options': fields[3],
                        'total_bytes': total_bytes,
                        'avail_bytes': avail_bytes,
                        'used_bytes': used_bytes,
                    })
        except:
            pass
        return mounts

    def to_json(self) -> str:
        """输出为 JSON 格式"""
        return json.dumps(self.collect(), indent=4, ensure_ascii=False)

    def to_prometheus(self, per_cpu=True) -> str:
        """输出为 Prometheus 文本格式

        Args:
            per_cpu: 是否包含每个 CPU 核心的详细数据
        """
        data = self.collect(per_cpu=per_cpu)
        lines = []

        # uname info
        uname = data.get('uname', {})
        if uname:
            labels = ','.join(f'{k}="{v}"' for k, v in uname.items())
            lines.append(f'node_uname_info{{{labels}}} 1')

        # OS info
        os_info = data.get('os_info', {})
        if os_info:
            labels = ','.join(f'{k}="{v}"' for k, v in os_info.items())
            lines.append(f'node_os_info{{{labels}}} 1')

        # DMI info
        dmi = data.get('dmi', {})
        if dmi:
            labels = ','.join(f'{k}="{v}"' for k, v in dmi.items())
            lines.append(f'node_dmi_info{{{labels}}} 1')

        # CPU stat
        cpu_stat = data.get('cpu_stat', {})
        for cpu, vals in cpu_stat.items():
            if isinstance(vals, dict) and 'user' in vals:
                if cpu == 'cpu':
                    lines.append(f'node_cpu_seconds_total{{mode="user"}} {vals.get("user", 0)}')
                    lines.append(f'node_cpu_seconds_total{{mode="nice"}} {vals.get("nice", 0)}')
                    lines.append(f'node_cpu_seconds_total{{mode="system"}} {vals.get("system", 0)}')
                    lines.append(f'node_cpu_seconds_total{{mode="idle"}} {vals.get("idle", 0)}')
                    lines.append(f'node_cpu_seconds_total{{mode="iowait"}} {vals.get("iowait", 0)}')
                    lines.append(f'node_cpu_seconds_total{{mode="irq"}} {vals.get("irq", 0)}')
                    lines.append(f'node_cpu_seconds_total{{mode="softirq"}} {vals.get("softirq", 0)}')
                    lines.append(f'node_cpu_seconds_total{{mode="steal"}} {vals.get("steal", 0)}')
                elif per_cpu and cpu.startswith('cpu'):
                    lines.append(f'node_cpu_seconds_total{{cpu="{cpu[3:]}",mode="user"}} {vals.get("user", 0)}')
                    lines.append(f'node_cpu_seconds_total{{cpu="{cpu[3:]}",mode="nice"}} {vals.get("nice", 0)}')
                    lines.append(f'node_cpu_seconds_total{{cpu="{cpu[3:]}",mode="system"}} {vals.get("system", 0)}')
                    lines.append(f'node_cpu_seconds_total{{cpu="{cpu[3:]}",mode="idle"}} {vals.get("idle", 0)}')
                    lines.append(f'node_cpu_seconds_total{{cpu="{cpu[3:]}",mode="iowait"}} {vals.get("iowait", 0)}')
                    lines.append(f'node_cpu_seconds_total{{cpu="{cpu[3:]}",mode="irq"}} {vals.get("irq", 0)}')
                    lines.append(f'node_cpu_seconds_total{{cpu="{cpu[3:]}",mode="softirq"}} {vals.get("softirq", 0)}')
                    lines.append(f'node_cpu_seconds_total{{cpu="{cpu[3:]}",mode="steal"}} {vals.get("steal", 0)}')
            elif isinstance(vals, (int, float)):
                if cpu == 'ctxt':
                    lines.append(f'node_context_switches_total {vals}')
                elif cpu == 'btime':
                    lines.append(f'node_boot_time_seconds {vals}')
                elif cpu == 'processes':
                    lines.append(f'node_forks_total {vals}')
                elif cpu == 'procs_running':
                    lines.append(f'node_procs_running {vals}')
                elif cpu == 'procs_blocked':
                    lines.append(f'node_procs_blocked {vals}')

        # Load average
        loadavg = data.get('loadavg', {})
        if loadavg:
            lines.append(f'node_load1 {loadavg.get("load1", 0)}')
            lines.append(f'node_load5 {loadavg.get("load5", 0)}')
            lines.append(f'node_load15 {loadavg.get("load15", 0)}')
            lines.append(f'node_loadavg_running_process {loadavg.get("running_process", 0)}')
            lines.append(f'node_loadavg_total_process {loadavg.get("total_process", 0)}')

        # Memory
        meminfo = data.get('meminfo', {})
        if meminfo:
            lines.append(f'node_memory_MemFree_bytes {meminfo.get("MemFree", 0)}')
            lines.append(f'node_memory_MemAvailable_bytes {meminfo.get("MemAvailable", 0)}')
            lines.append(f'node_memory_MemTotal_bytes {meminfo.get("MemTotal", 0)}')
            lines.append(f'node_memory_SwapFree_bytes {meminfo.get("SwapFree", 0)}')
            lines.append(f'node_memory_SwapTotal_bytes {meminfo.get("SwapTotal", 0)}')

        # SNMP
        snmp = data.get('snmp', {})
        for proto, vals in snmp.items():
            if isinstance(vals, dict):
                for k, v in vals.items():
                    lines.append(f'node_snmp_{proto}_{k} {v}')

        # Network
        network = data.get('network', {})
        for iface, vals in network.items():
            if isinstance(vals, dict):
                lines.append(f'node_network_receive_bytes_total{{interface="{iface}"}} {vals.get("rx_bytes", 0)}')
                lines.append(f'node_network_transmit_bytes_total{{interface="{iface}"}} {vals.get("tx_bytes", 0)}')
                lines.append(f'node_network_receive_packets_total{{interface="{iface}"}} {vals.get("rx_packets", 0)}')
                lines.append(f'node_network_transmit_packets_total{{interface="{iface}"}} {vals.get("tx_packets", 0)}')

        # Sockstat
        sockstat = data.get('sockstat', {})
        for proto, vals in sockstat.items():
            if isinstance(vals, dict):
                for k, v in vals.items():
                    lines.append(f'node_sockstat_{proto}_{k} {v}')
        lines.append(f'node_netstat_Tcp_CurrEstab {sockstat.get("TCP", {}).get("inuse", 0)}')

        # Netstat
        netstat = data.get('netstat', {})
        for proto, vals in netstat.items():
            if isinstance(vals, dict):
                for k, v in vals.items():
                    lines.append(f'node_netstat_{proto}_{k} {v}')

        # Diskstats
        diskstats = data.get('diskstats', [])
        for disk in diskstats:
            dev = disk.get('device', '')
            lines.append(f'node_disk_reads_completed_total{{device="{dev}"}} {disk.get("reads_completed", 0)}')
            lines.append(f'node_disk_writes_completed_total{{device="{dev}"}} {disk.get("writes_completed", 0)}')
            lines.append(f'node_disk_read_bytes_total{{device="{dev}"}} {disk.get("sectors_read", 0) * 512}')
            lines.append(f'node_disk_written_bytes_total{{device="{dev}"}} {disk.get("sectors_written", 0) * 512}')
            lines.append(f'node_disk_io_time_seconds_total{{device="{dev}"}} {disk.get("io_time_ms", 0) / 1000}')

        # Mounts (filesystem)
        mounts = data.get('mounts', [])
        for mnt in mounts:
            labels = f'mountpoint="{mnt.get("mountpoint", "")}",device="{mnt.get("device", "")}",fstype="{mnt.get("fstype", "")}"'
            if mnt.get('total_bytes'):
                lines.append(f'node_filesystem_size_bytes{{{labels}}} {mnt["total_bytes"]}')
                lines.append(f'node_filesystem_avail_bytes{{{labels}}} {mnt.get("avail_bytes", 0)}')
                lines.append(f'node_filesystem_free_bytes{{{labels}}} {mnt.get("avail_bytes", 0) + mnt.get("used_bytes", 0)}')

        # Thermal
        thermal = data.get('thermal', [])
        for zone in thermal:
            lines.append(f'node_thermal_zone_temp{{zone="{zone.get("zone", "")}", type="{zone.get("type", "")}"}} {zone.get("temp", 0)}')

        # Timestamp
        lines.append(f'node_time_seconds {int(time.time())}')

        return '\n'.join(lines) + '\n'


if __name__ == '__main__':
    pass
    collector = HostCollector()
    # print(collector._read_netstat())
    # print(json.dumps(collector._read_sockstat(), indent=4, ensure_ascii=False))

    # s = collector.to_json()
    # print(collector.to_prometheus())
    # # print(s)
