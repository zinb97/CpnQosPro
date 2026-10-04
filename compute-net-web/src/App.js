// App.js - 主应用组件
import { router } from './router/router.js';
import { api } from './api/mock.js';
import { icons, MetricCard, EventStream, TimeSelector } from './components.js';

// 侧边栏菜单配置
const menuItems = [
  {
    id: 'dashboard',
    label: '态势总览大屏',
    icon: 'dashboard',
    path: '/'
  },
  {
    id: 'resource',
    label: '资源管控中心',
    icon: 'server',
    path: '/resource'
  },
  {
    id: 'network',
    label: '网络管控中心',
    icon: 'network',
    path: '/network'
  },
  {
    id: 'task',
    label: '任务调度中心',
    icon: 'task',
    path: '/task'
  },
  {
    id: 'telemetry',
    label: '带内全网遥测',
    icon: 'telemetry',
    path: '/telemetry'
  },
  {
    id: 'compute',
    label: '轻量算力感知',
    icon: 'cpu',
    path: '/compute'
  }
];

let currentPage = '/';
let sidebarCollapsed = false;
let events = [];

// 更新系统时间
function updateTime() {
  const timeEl = document.getElementById('systemTime');
  if (timeEl) {
    timeEl.textContent = new Date().toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  }
}

// 渲染侧边栏
function renderSidebar() {
  const sidebar = document.getElementById('sidebar');
  if (!sidebar) return;

  sidebar.className = `sidebar ${sidebarCollapsed ? 'sidebar--collapsed' : ''}`;

  let html = `
    <button class="sidebar__toggle" id="sidebarToggle">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="20" height="20">
        ${sidebarCollapsed
          ? '<polyline points="9 18 15 12 9 6"/>'
          : '<polyline points="15 18 9 12 15 6"/>'}
      </svg>
    </button>
    <nav class="sidebar__nav">
  `;

  menuItems.forEach(item => {
    const isActive = currentPage.startsWith(item.path);

    html += `
      <div class="sidebar__group">
        <div class="sidebar__item ${isActive ? 'sidebar__item--active' : ''}" data-path="${item.path}">
          <span class="sidebar__icon">${icons[item.icon] || ''}</span>
          <span class="sidebar__label">${item.label}</span>
        </div>
      </div>
    `;
  });

  html += '</nav>';
  sidebar.innerHTML = html;

  // 绑定侧边栏事件
  sidebar.querySelectorAll('.sidebar__item[data-path]').forEach(el => {
    el.addEventListener('click', () => {
      const path = el.dataset.path;
      if (path) router.navigate(path);
    });
  });

  // 绑定折叠按钮事件
  document.getElementById('sidebarToggle').addEventListener('click', () => {
    sidebarCollapsed = !sidebarCollapsed;
    renderSidebar();
  });
}

// 渲染顶部通栏
function renderHeader() {
  const header = document.getElementById('header');
  if (!header) return;

  header.innerHTML = `
    <div class="header__brand">
      <div class="header__logo">算</div>
      <span class="header__title">算力网络服务质量控制原型系统</span>
      <span class="header__tag">试验网环境</span>
    </div>

    <div style="flex:1;"></div>

    <div class="header__user">
      <div class="header__avatar">研</div>
      <div class="header__user-info">
        <span class="header__user-name">研发人员</span>
        <span class="header__user-role">管理员</span>
      </div>
    </div>
  `;
}

// 渲染主内容区
function renderContent() {
  const content = document.getElementById('content');
  if (!content) return;

  // 根据路由加载不同页面
  if (currentPage === '/' || currentPage === '') {
    content.innerHTML = renderDashboardPage();
    initDashboardPage();
  } else if (currentPage.startsWith('/resource')) {
    content.innerHTML = renderResourcePage();
  } else if (currentPage.startsWith('/network')) {
    content.innerHTML = renderNetworkPage();
  } else if (currentPage.startsWith('/task')) {
    content.innerHTML = renderTaskPage();
  } else if (currentPage.startsWith('/telemetry')) {
    content.innerHTML = renderTelemetryPage();
  } else if (currentPage.startsWith('/compute')) {
    content.innerHTML = renderComputePage();
  } else {
    content.innerHTML = `<div class="empty"><p>页面不存在</p></div>`;
  }
}

// ============ Dashboard 页面 ============
function renderDashboardPage() {
  return `
    <div class="dashboard">
      <div class="dashboard__header">
        <h1 class="dashboard__title">算力网络服务质量态势总览</h1>
        <div class="dashboard__header-right">
          <span id="systemTime"></span>
        </div>
      </div>

      <div class="dashboard__body">
        <div class="dashboard__left">
          <div class="panel">
            <div class="panel__title">算力资源态势</div>
            <div class="panel__metrics" id="grafanaMetrics">
              <div class="loading"><div class="loading__spinner"></div></div>
            </div>
            <div class="panel__charts-grid">
              <div class="panel__chart-iframe">
                <iframe src="http://192.168.10.31:3000/d-solo/cluster-overview-dashboard/e68081-e58abf-e680bb-e8a788-e5a4a7-e5b18f?orgId=1&timezone=browser&refresh=10s&theme=light&panelId=panel-14&hideLogo=true" width="278" height="200" frameborder="0"></iframe>
              </div>
              <div class="panel__chart-iframe">
                <iframe src="http://192.168.10.31:3000/d-solo/cluster-overview-dashboard/e68081-e58abf-e680bb-e8a788-e5a4a7-e5b18f?orgId=1&timezone=browser&refresh=10s&theme=light&panelId=panel-18&hideLogo=true" width="278" height="200" frameborder="0"></iframe>
              </div>
            </div>
          </div>
        </div>

        <div class="dashboard__center">
          <div id="geoMap" style="width:100%;height:100%;"></div>
        </div>

        <div class="dashboard__right">
          <div class="panel">
            <div class="panel__title">网络资源态势</div>
            <div class="panel__metrics" id="networkMetrics">
              <div class="loading"><div class="loading__spinner"></div></div>
            </div>
            <div class="panel__charts-grid">
              <div class="panel__chart-iframe">
                <iframe src="http://192.168.10.31:3000/d-solo/cluster-overview-dashboard/e68081-e58abf-e680bb-e8a788-e5a4a7-e5b18f?orgId=1&timezone=browser&refresh=10s&theme=light&panelId=panel-30&hideLogo=true" width="278" height="200" frameborder="0"></iframe>
              </div>
              <div class="panel__chart-iframe">
                <iframe src="http://192.168.10.31:3000/d-solo/cluster-overview-dashboard/e68081-e58abf-e680bb-e8a788-e5a4a7-e5b18f?orgId=1&timezone=browser&refresh=10s&theme=light&panelId=panel-29&hideLogo=true" width="278" height="200" frameborder="0"></iframe>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <style>
      .dashboard {
        display: flex;
        flex-direction: column;
        height: 100%;
        gap: 12px;
      }
      .dashboard__header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 0 8px;
        flex-shrink: 0;
      }
      .dashboard__title {
        font-size: 20px;
        font-weight: 600;
        color: var(--color-text-primary);
      }
      .dashboard__header-right {
        display: flex;
        align-items: center;
        gap: 20px;
        font-size: 13px;
        color: var(--color-text-secondary);
      }
      .dashboard__header-right strong {
        color: var(--color-text-primary);
        font-family: var(--font-mono);
      }
      .health-score {
        color: var(--color-success) !important;
      }
      .dashboard__divider {
        width: 1px;
        height: 16px;
        background: var(--color-border);
      }
      .dashboard__stat {
        color: var(--color-text-secondary);
      }
      .dashboard__body {
        display: flex;
        gap: 12px;
        flex: 1;
        min-height: 0;
        overflow: hidden;
      }
      .dashboard__left, .dashboard__right {
        width: 280px;
        flex-shrink: 0;
        overflow: hidden;
      }
      .dashboard__center {
        flex: 1;
        min-width: 0;
        height: 100%;
        border-radius: var(--radius-lg);
        overflow: hidden;
        background: var(--color-bg-card);
        border: 1px solid var(--color-border);
      }
      .dashboard__left, .dashboard__right {
        overflow: hidden;
      }
      .dashboard__footer {
        display: flex;
        align-items: center;
        gap: 16px;
        padding: 8px 16px;
        background: var(--color-bg-card);
        border-radius: var(--radius-lg);
        border: 1px solid var(--color-border);
        flex-shrink: 0;
        height: 40px;
        overflow: hidden;
      }
      .panel {
        height: 100%;
        display: flex;
        flex-direction: column;
        gap: 12px;
        overflow-y: auto;
      }
      .panel__title {
        font-size: 14px;
        font-weight: 600;
        color: var(--color-text-primary);
        padding-bottom: 8px;
        border-bottom: 1px solid var(--color-border);
      }
      .panel__metrics {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 8px;
      }
      .panel__chart {
        background: var(--color-bg-secondary);
        border-radius: var(--radius-md);
        padding: 8px;
      }
      .panel__chart-title {
        font-size: 11px;
        color: var(--color-text-secondary);
        margin-bottom: 8px;
      }
      .panel__charts-grid {
        display: grid;
        grid-template-columns: 1fr;
        gap: 12px;
      }
      .panel__charts-row {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 12px;
      }
      .panel__chart-iframe {
        background: var(--color-bg-secondary);
        border-radius: var(--radius-md);
        overflow: hidden;
      }
      .panel__chart-iframe iframe {
        display: block;
      }
    </style>
  `;
}

async function initDashboardPage() {
  // 更新系统时间
  setInterval(updateTime, 1000);

  // 加载 Grafana 指标（在线集群数、在线节点数、CPU总核心数、内存总量）
  const grafanaMetrics = await api.getGrafanaMetrics();
  document.getElementById('grafanaMetrics').innerHTML = `
    ${MetricCard({ label: '在线集群数', value: grafanaMetrics['在线集群数'].value, unit: grafanaMetrics['在线集群数'].unit, icon: 'nodes', iconColor: 'blue' })}
    ${MetricCard({ label: '在线节点数', value: grafanaMetrics['在线节点数'].value, unit: grafanaMetrics['在线节点数'].unit, icon: 'server', iconColor: 'green' })}
    ${MetricCard({ label: 'CPU总核心数', value: grafanaMetrics['CPU总核心数'].value, unit: grafanaMetrics['CPU总核心数'].unit, icon: 'cpu', iconColor: 'yellow' })}
    ${MetricCard({ label: '内存总量', value: grafanaMetrics['内存总量'].value, unit: grafanaMetrics['内存总量'].unit, icon: 'memory', iconColor: 'purple' })}
  `;

  // 加载网络资源态势指标
  document.getElementById('networkMetrics').innerHTML = `
    ${MetricCard({ label: '交换机数', value: grafanaMetrics['交换机数'].value, unit: grafanaMetrics['交换机数'].unit, icon: 'switch', iconColor: 'blue' })}
    ${MetricCard({ label: '网络链路数', value: grafanaMetrics['网络链路数'].value, unit: grafanaMetrics['网络链路数'].unit, icon: 'link', iconColor: 'green' })}
    ${MetricCard({ label: '网络主机数', value: grafanaMetrics['网络主机数'].value, unit: grafanaMetrics['网络主机数'].unit, icon: 'host', iconColor: 'yellow' })}
    ${MetricCard({ label: 'packet-in事件数', value: grafanaMetrics['packet-in事件数'].value, unit: grafanaMetrics['packet-in事件数'].unit, icon: 'packet', iconColor: 'purple' })}
  `;

  // 初始化图表
  initDashboardCharts();
}

async function initDashboardCharts() {
  const echarts = window.echarts;

  // 获取趋势数据
  const trendData = await api.getTrendData();

  // 带宽趋势折线图（仅当元素存在时初始化）
  const bandwidthTrendEl = document.getElementById('bandwidthTrend');
  let bandwidthTrend = null;
  if (bandwidthTrendEl) {
    bandwidthTrend = echarts.init(bandwidthTrendEl);
    bandwidthTrend.setOption({
    tooltip: { trigger: 'axis', formatter: '{b}<br/>{c} Gbps' },
    grid: { left: 40, right: 10, top: 10, bottom: 25 },
    xAxis: {
      type: 'category',
      data: trendData.map(d => d.time),
      axisLine: { lineStyle: { color: 'var(--color-border)' } },
      axisLabel: { fontSize: 9, color: 'var(--color-text-muted)', show: false }
    },
    yAxis: {
      type: 'value',
      axisLine: { show: false },
      axisLabel: { fontSize: 9, color: 'var(--color-text-muted)' },
      splitLine: { lineStyle: { color: 'var(--color-border)' } }
    },
    series: [{
      type: 'line',
      smooth: true,
      data: trendData.map(d => d.bandwidth.toFixed(1)),
      areaStyle: {
        color: {
          type: 'linear',
          x: 0, y: 0, x2: 0, y2: 1,
          colorStops: [
            { offset: 0, color: 'rgba(139, 92, 246, 0.3)' },
            { offset: 1, color: 'rgba(139, 92, 246, 0)' }
          ]
        }
      },
      lineStyle: { color: '#8b5cf6', width: 2 },
      itemStyle: { color: '#8b5cf6' }
    }]
    });
  }

  // 地理散点图 - 中国地图
  const geoMap = echarts.init(document.getElementById('geoMap'));

  // 节点数据：北京、长沙
  const nodeData = [
    { name: '北京', location: [116.4, 39.9], status: 'healthy', totalFlops: 1000, usedFlops: 650, onlineNodes: 120, bandwidthUsage: 65 },
    { name: '长沙', location: [112.9, 28.2], status: 'healthy', totalFlops: 800, usedFlops: 400, onlineNodes: 96, bandwidthUsage: 52 }
  ];

  const clusterData = nodeData.map(c => ({
    name: c.name,
    value: [...c.location, c.usedFlops / c.totalFlops * 100],
    status: c.status,
    totalFlops: c.totalFlops,
    usedFlops: c.usedFlops,
    onlineNodes: c.onlineNodes,
    bandwidthUsage: c.bandwidthUsage
  }));

  // 连接线数据
  const linesData = [
    { coords: [[116.4, 39.9], [112.9, 28.2]], status: 'healthy' }
  ];

  // 加载中国地图 GeoJSON
  fetch('/china.json')
    .then(response => response.json())
    .then(chinaJson => {
      echarts.registerMap('china', chinaJson);

      // 确保容器有正确尺寸后再设置option
      geoMap.resize();

      geoMap.setOption({
        tooltip: {
          trigger: 'item',
          formatter: (params) => {
            if (!params.data || !params.data.value) return '';
            const d = params.data;
            return `<div style="font-size:12px;background:#fff;padding:8px;border-radius:4px;box-shadow:0 2px 8px rgba(0,0,0,0.15);">
              <strong style="color:#1e293b;">${d.name}</strong><br/>
              <div style="margin-top:4px;">
                <span style="color:#64748b;">总算力：</span><span style="color:#0ea5e9;font-weight:500;">${d.totalFlops} TFLOPS</span><br/>
                <span style="color:#64748b;">利用率：</span><span style="color:#0ea5e9;font-weight:500;">${d.value[2].toFixed(1)}%</span><br/>
                <span style="color:#64748b;">在线节点：</span><span style="color:#0ea5e9;font-weight:500;">${d.onlineNodes}</span><br/>
                <span style="color:#64748b;">带宽利用率：</span><span style="color:#0ea5e9;font-weight:500;">${d.bandwidthUsage}%</span>
              </div>
            </div>`;
          }
        },
        geo: {
          map: 'china',
          roam: false,
          zoom: 1.2,
          center: [105, 36],
          itemStyle: {
            areaColor: '#e2e8f0',
            borderColor: '#94a3b8',
            borderWidth: 1
          },
          emphasis: {
            itemStyle: {
              areaColor: '#cbd5e1'
            }
          },
          label: {
            show: false
          }
        },
        series: [
          {
            type: 'scatter',
            coordinateSystem: 'geo',
            data: clusterData,
            symbolSize: (val, params) => {
              return 20 + (params.data.value[2] / 100) * 10;
            },
            itemStyle: {
              color: (params) => {
                if (params.data.status === 'healthy') return '#10b981';
                if (params.data.status === 'warning') return '#f59e0b';
                return '#ef4444';
              },
              shadowBlur: 15,
              shadowColor: (params) => {
                if (params.data.status === 'healthy') return 'rgba(16, 185, 129, 0.5)';
                if (params.data.status === 'warning') return 'rgba(245, 158, 11, 0.5)';
                return 'rgba(239, 68, 68, 0.5)';
              }
            },
            emphasis: {
              scale: 1.2
            },
            label: {
              show: true,
              position: 'bottom',
              formatter: '{b}',
              fontSize: 11,
              color: '#1e293b',
              fontWeight: 500
            }
          },
          // 连接线
          {
            type: 'lines',
            coordinateSystem: 'geo',
            data: linesData.map(line => ({
              coords: line.coords,
              lineStyle: {
                color: line.status === 'healthy' ? '#0ea5e9' : '#f59e0b',
                width: 2,
                curveness: 0.2
              }
            })),
            effect: {
              show: true,
              period: 3,
              trailLength: 0.3,
              symbol: 'circle',
              symbolSize: 4,
              color: '#0ea5e9'
            },
            lineStyle: {
              opacity: 0.7
            }
          }
        ]
      });
    })
    .catch(err => {
      console.error('地图加载失败:', err);
      // 降级：使用纯散点图
      geoMap.setOption({
        tooltip: { trigger: 'item' },
        series: [{
          type: 'scatter',
          data: clusterData,
          symbolSize: 40,
          itemStyle: { color: '#0ea5e9' },
          label: { show: true, formatter: '{b}', position: 'bottom' }
        }]
      });
    });

  // 切片环形图
  const slices = await api.getSlices();
  const sliceChart = echarts.init(document.getElementById('sliceChart'));
  sliceChart.setOption({
    tooltip: { trigger: 'item', formatter: '{b}: {c} ({d}%)' },
    series: [{
      type: 'pie',
      radius: ['45%', '70%'],
      center: ['50%', '50%'],
      avoidLabelOverlap: false,
      itemStyle: {
        borderRadius: 4,
        borderColor: '#fff',
        borderWidth: 2
      },
      label: { show: false },
      emphasis: { label: { show: false } },
      data: slices.map((s, i) => ({
        value: s.cpuUsed,
        name: s.name,
        itemStyle: { color: ['#0ea5e9', '#8b5cf6', '#f59e0b', '#10b981'][i] }
      }))
    }]
  });

  // QoS 策略概览
  const qosPolicies = await api.getQosPolicies();
  document.getElementById('qosOverview').innerHTML = qosPolicies.slice(0, 4).map(pol => `
    <div style="display:flex;justify-content:space-between;padding:6px 0;border-bottom:1px solid var(--color-border);">
      <span style="color:var(--color-text-secondary);font-size:11px;">${pol.name}</span>
      <span class="status status--healthy" style="font-size:10px;">${pol.status === 'active' ? '生效' : '未生效'}</span>
    </div>
  `).join('');

  // 加载链路质量列表
  const links = await api.getNetworkDevices().then(() => {
    return [
      { source: '北京', target: '杭州', latency: 25, packetLoss: 0.1, usage: 65, status: 'healthy' },
      { source: '杭州', target: '广州', latency: 30, packetLoss: 0.2, usage: 45, status: 'healthy' },
      { source: '广州', target: '北京', latency: 35, packetLoss: 0.15, usage: 55, status: 'warning' }
    ];
  });

  document.getElementById('linkQuality').innerHTML = links.map(link => `
    <div class="list-item" style="padding:8px 0;border-bottom:1px solid var(--color-border);">
      <div class="list-item__content">
        <span class="list-item__title">${link.source} → ${link.target}</span>
      </div>
      <div class="list-item__value">
        <span class="list-item__primary" style="color:${link.status === 'healthy' ? 'var(--color-success)' : 'var(--color-warning)'};">${link.latency}ms</span>
        <span class="list-item__secondary">丢包${link.packetLoss}%</span>
      </div>
    </div>
  `).join('');

  // 响应式
  window.addEventListener('resize', () => {
    if (bandwidthTrendEl) bandwidthTrend.resize();
    geoMap.resize();
    sliceChart.resize();
  });
}

// ============ Resource 页面 ============
function renderResourcePage() {
  return `
    <iframe
      src="http://192.168.10.31:3000/goto/cg07s2sm4a134a?orgId=default"
      style="width:100%;height:100%;border:none;background:#0a0e17;"
      sandbox="allow-scripts allow-same-origin allow-forms"
    ></iframe>
  `;
}

// ============ Network 页面 ============
function renderNetworkPage() {
  return `
    <iframe
      src="http://192.168.10.31:8080/"
      style="width:100%;height:100%;border:none;background:#0a0e17;"
      sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
    ></iframe>
  `;
}

// ============ Task 页面 ============
function renderTaskPage() {
  return `
    <iframe
      src="http://192.168.10.21:32000/cluster-manage"
      style="width:100%;height:100%;border:none;background:#0a0e17;"
      sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
    ></iframe>
  `;
}

// ============ Telemetry 页面 ============
function renderTelemetryPage() {
  return `
    <iframe
      src="http://192.168.10.17:39280/pages/vis.html"
      style="width:100%;height:100%;border:none;background:#0a0e17;"
      sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
    ></iframe>
  `;
}

// ============ Compute 页面 ============
function renderComputePage() {
  return `
    <iframe
      src="http://192.168.10.17:8765"
      style="width:100%;height:100%;border:none;background:#0a0e17;"
      sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
    ></iframe>
  `;
}

// ============ 路由处理 ============
function handleRoute() {
  currentPage = window.location.hash.slice(1) || '/';
  renderSidebar();
  renderContent();
}

// ============ 初始化 ============
const App = {
  render() {
    return `
      <div class="app-layout">
        <header class="header" id="header"></header>
        <div class="main-wrapper">
          <aside class="sidebar" id="sidebar"></aside>
          <main class="main-content" id="content"></main>
        </div>
      </div>
    `;
  },

  init() {
    // 初始化 header 和 sidebar
    renderHeader();
    renderSidebar();

    // 加载 ECharts
    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/echarts@5.5.0/dist/echarts.min.js';
    script.onload = () => {
      // 设置路由
      router.addRoute('/', () => {
        currentPage = '/';
        renderContent();
        initDashboardPage();
      });
      router.addRoute('/resource', () => {
        currentPage = '/resource';
        renderContent();
      });
      router.addRoute('/network', () => {
        currentPage = '/network';
        renderContent();
      });
      router.addRoute('/task', () => {
        currentPage = '/task';
        renderContent();
      });
      router.addRoute('/telemetry', () => {
        currentPage = '/telemetry';
        renderContent();
      });
      router.addRoute('/compute', () => {
        currentPage = '/compute';
        renderContent();
      });

      // 初始路由
      handleRoute();
      window.addEventListener('hashchange', handleRoute);
    };
    document.head.appendChild(script);

    // 启动时间更新
    setInterval(updateTime, 1000);
  }
};

export default App;
