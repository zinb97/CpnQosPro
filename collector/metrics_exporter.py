#!/usr/bin/env python3
"""
Linux Metrics HTTP Exporter
提供 Prometheus 指标抓取端点
"""

import http.server
import socketserver
from urllib.parse import urlparse

from host_collector import HostCollector


class MetricsHandler(http.server.BaseHTTPRequestHandler):
    """Prometheus 指标 HTTP 处理器"""

    collector = None
    per_cpu = False

    @classmethod
    def set_collector(cls, collector, per_cpu=False):
        cls.collector = collector
        cls.per_cpu = per_cpu

    def do_GET(self):
        """处理 GET 请求"""
        parsed_path = urlparse(self.path)
        if parsed_path.path == '/metrics':
            # 返回 Prometheus 格式指标
            self.send_response(200)
            self.send_header('Content-Type', 'text/plain; version=0.0.4; charset=utf-8')
            self.end_headers()
            metrics = self.collector.to_prometheus(per_cpu=self.per_cpu)
            self.wfile.write(metrics.encode('utf-8'))
        elif parsed_path.path == '/health':
            # 健康检查
            self.send_response(200)
            self.send_header('Content-Type', 'text/plain')
            self.end_headers()
            self.wfile.write(b'OK')
        elif parsed_path.path == '/':
            # 首页
            self.send_response(200)
            self.send_header('Content-Type', 'text/html')
            self.end_headers()
            html = '''<!DOCTYPE html>
<html><head><title>Linux Metrics Exporter</title></head>
<body><h1>Linux Metrics Exporter</h1>
<p><a href="/metrics">/metrics</a> - Prometheus 格式指标</p>
<p><a href="/health">/health</a> - 健康检查</p>
</body></html>'''
            self.wfile.write(html.encode('utf-8'))
        else:
            self.send_response(404)
            self.end_headers()

    def log_message(self, format, *args):
        """自定义日志格式"""
        print(f'[{self.log_date_time_string()}] {format % args}')


class MetricsExporter:
    """指标导出器 HTTP 服务器"""

    def __init__(self, port=9100, per_cpu=True):
        self.port = port
        self.per_cpu = per_cpu
        self.collector = HostCollector()
        self.server = None

    def start(self):
        """启动 HTTP 服务器"""
        MetricsHandler.set_collector(self.collector, per_cpu=self.per_cpu)
        self.server = socketserver.TCPServer(("", self.port), MetricsHandler)
        print(f'Metrics exporter started on http://:{self.port}/metrics')
        print(f'Prometheus 抓取地址: http://localhost:{self.port}/metrics')
        self.server.serve_forever()

    def stop(self):
        """停止 HTTP 服务器"""
        if self.server:
            self.server.shutdown()
            print('Metrics exporter stopped')


if __name__ == '__main__':
    import argparse

    parser = argparse.ArgumentParser(description='Linux Metrics Exporter')
    parser.add_argument('--port', type=int, default=9100, help='HTTP 端口 (默认: 9100)')
    args = parser.parse_args()

    exporter = MetricsExporter(port=args.port)
    try:
        exporter.start()
    except KeyboardInterrupt:
        exporter.stop()
