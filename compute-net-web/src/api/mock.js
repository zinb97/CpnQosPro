// mock.js - Mock 数据服务

// 模拟延迟
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// ============ 集群数据 ============
export const clusters = [
  {
    id: 'bj',
    name: '北京',
    location: [116.4, 39.9],
    status: 'healthy',
    totalFlops: 1000,
    usedFlops: 650,
    nodes: 128,
    onlineNodes: 120,
    bandwidth: 100,
    bandwidthUsage: 65
  },
  {
    id: 'xa',
    name: '西安',
    location: [108.9, 34.2],
    status: 'warning',
    totalFlops: 600,
    usedFlops: 480,
    nodes: 80,
    onlineNodes: 75,
    bandwidth: 100,
    bandwidthUsage: 78
  },
  {
    id: 'cs',
    name: '长沙',
    location: [112.9, 28.2],
    status: 'healthy',
    totalFlops: 800,
    usedFlops: 400,
    nodes: 96,
    onlineNodes: 96,
    bandwidth: 100,
    bandwidthUsage: 52
  }
];

// ============ 节点数据 ============
export const nodes = [
  { id: 'node-001', name: '计算节点-01', cluster: 'bj', status: 'online', cpu: 45, memory: 62, disk: 38, gpu: 78, type: 'gpu', taskCount: 12 },
  { id: 'node-002', name: '计算节点-02', cluster: 'bj', status: 'online', cpu: 52, memory: 71, disk: 45, gpu: 85, type: 'gpu', taskCount: 15 },
  { id: 'node-003', name: '计算节点-03', cluster: 'bj', status: 'warning', cpu: 88, memory: 82, disk: 67, gpu: 92, type: 'gpu', taskCount: 8 },
  { id: 'node-004', name: '通用节点-01', cluster: 'bj', status: 'online', cpu: 35, memory: 55, disk: 42, gpu: 0, type: 'cpu', taskCount: 6 },
  { id: 'node-005', name: '通用节点-02', cluster: 'bj', status: 'online', cpu: 28, memory: 48, disk: 35, gpu: 0, type: 'cpu', taskCount: 4 },
  { id: 'node-006', name: '计算节点-04', cluster: 'hz', status: 'online', cpu: 62, memory: 75, disk: 55, gpu: 88, type: 'gpu', taskCount: 18 },
  { id: 'node-007', name: '计算节点-05', cluster: 'hz', status: 'warning', cpu: 91, memory: 89, disk: 78, gpu: 95, type: 'gpu', taskCount: 22 },
  { id: 'node-008', name: '计算节点-06', cluster: 'hz', status: 'critical', cpu: 97, memory: 94, disk: 85, gpu: 99, type: 'gpu', taskCount: 25 },
  { id: 'node-009', name: 'FPGA节点-01', cluster: 'hz', status: 'online', cpu: 42, memory: 58, disk: 40, gpu: 0, type: 'fpga', taskCount: 5 },
  { id: 'node-010', name: '通用节点-03', cluster: 'hz', status: 'online', cpu: 38, memory: 52, disk: 38, gpu: 0, type: 'cpu', taskCount: 3 },
  { id: 'node-011', name: '计算节点-07', cluster: 'gz', status: 'online', cpu: 32, memory: 45, disk: 30, gpu: 55, type: 'gpu', taskCount: 8 },
  { id: 'node-012', name: '计算节点-08', cluster: 'gz', status: 'online', cpu: 28, memory: 40, disk: 28, gpu: 48, type: 'gpu', taskCount: 6 },
  { id: 'node-013', name: '通用节点-04', cluster: 'gz', status: 'online', cpu: 22, memory: 38, disk: 25, gpu: 0, type: 'cpu', taskCount: 2 },
  { id: 'node-014', name: '通用节点-05', cluster: 'gz', status: 'offline', cpu: 0, memory: 0, disk: 0, gpu: 0, type: 'cpu', taskCount: 0 }
];

// ============ 网络链路数据 ============
export const links = [
  { source: 'bj', target: 'xa', latency: 28, packetLoss: 0.1, bandwidth: 100, usage: 65, status: 'healthy' },
  { source: 'xa', target: 'cs', latency: 22, packetLoss: 0.15, bandwidth: 100, usage: 45, status: 'healthy' },
  { source: 'cs', target: 'bj', latency: 35, packetLoss: 0.2, bandwidth: 100, usage: 52, status: 'warning' }
];

// ============ 切片数据 ============
export const slices = [
  { id: 'slice-001', name: '切片-A', status: 'active', cpuQuota: 400, cpuUsed: 280, memoryQuota: 512, memoryUsed: 380, storageQuota: 2000, storageUsed: 1200, networkBandwidth: 50, sla: 'gold' },
  { id: 'slice-002', name: '切片-B', status: 'active', cpuQuota: 300, cpuUsed: 180, memoryQuota: 384, memoryUsed: 256, storageQuota: 1500, storageUsed: 800, networkBandwidth: 30, sla: 'silver' },
  { id: 'slice-003', name: '切片-C', status: 'active', cpuQuota: 200, cpuUsed: 150, memoryQuota: 256, memoryUsed: 200, storageQuota: 1000, storageUsed: 600, networkBandwidth: 20, sla: 'bronze' },
  { id: 'slice-004', name: '切片-D', status: 'active', cpuQuota: 100, cpuUsed: 40, memoryQuota: 128, memoryUsed: 60, storageQuota: 500, storageUsed: 150, networkBandwidth: 10, sla: 'basic' }
];

// ============ 任务数据 ============
export const tasks = [
  { id: 'job-001', name: 'AI推理任务-01', status: 'running', priority: 'high', slice: '切片-A', progress: 65, sla: 'gold', submitTime: '2026-07-27 08:30', startTime: '2026-07-27 08:35', nodes: ['node-001', 'node-002'], networkPath: '北京→西安', qosPolicy: '带宽预留-高优先级', flops: 120, estimatedCompletion: '2026-07-27 14:30' },
  { id: 'job-002', name: '视频渲染任务-01', status: 'running', priority: 'medium', slice: '切片-B', progress: 42, sla: 'silver', submitTime: '2026-07-27 09:00', startTime: '2026-07-27 09:10', nodes: ['node-006'], networkPath: '西安→长沙', qosPolicy: '优先级队列', flops: 80, estimatedCompletion: '2026-07-27 18:00' },
  { id: 'job-003', name: '数据分析任务-01', status: 'running', priority: 'high', slice: '切片-A', progress: 88, sla: 'gold', submitTime: '2026-07-27 06:00', startTime: '2026-07-27 06:05', nodes: ['node-003', 'node-004'], networkPath: '北京内部', qosPolicy: '带宽预留-高优先级', flops: 200, estimatedCompletion: '2026-07-27 12:00' },
  { id: 'job-004', name: '机器学习训练-01', status: 'queued', priority: 'medium', slice: '切片-C', progress: 0, sla: 'bronze', submitTime: '2026-07-27 10:00', startTime: '-', nodes: [], networkPath: '-', qosPolicy: '默认', flops: 150, estimatedCompletion: '-' },
  { id: 'job-005', name: '批量计算任务-01', status: 'queued', priority: 'low', slice: '切片-D', progress: 0, sla: 'basic', submitTime: '2026-07-27 10:30', startTime: '-', nodes: [], networkPath: '-', qosPolicy: '默认', flops: 50, estimatedCompletion: '-' },
  { id: 'job-006', name: '实时推理任务-01', status: 'completed', priority: 'high', slice: '切片-A', progress: 100, sla: 'gold', submitTime: '2026-07-27 04:00', startTime: '2026-07-27 04:05', nodes: ['node-005'], networkPath: '北京内部', qosPolicy: '带宽预留-高优先级', flops: 60, estimatedCompletion: '2026-07-27 08:00' },
  { id: 'job-007', name: '图像处理任务-01', status: 'running', priority: 'low', slice: '切片-C', progress: 25, sla: 'bronze', submitTime: '2026-07-27 09:30', startTime: '2026-07-27 09:45', nodes: ['node-011'], networkPath: '长沙内部', qosPolicy: '默认', flops: 40, estimatedCompletion: '2026-07-27 16:00' },
  { id: 'job-008', name: '科学计算任务-01', status: 'failed', priority: 'high', slice: '切片-B', progress: 45, sla: 'silver', submitTime: '2026-07-27 07:00', startTime: '2026-07-27 07:10', nodes: ['node-007'], networkPath: '西安内部', qosPolicy: '优先级队列', flops: 100, estimatedCompletion: '2026-07-27 10:30' }
];

// ============ QoS 策略数据 ============
export const qosPolicies = [
  { id: 'qos-001', name: '带宽预留-高优先级', type: 'bandwidth', priority: 1, bandwidth: 50, status: 'active', appliedSlices: ['切片-A'] },
  { id: 'qos-002', name: '优先级队列-银级', type: 'priority', priority: 2, bandwidth: 30, status: 'active', appliedSlices: ['切片-B'] },
  { id: 'qos-003', name: '流量整形- Bronze', type: 'shaping', priority: 3, bandwidth: 20, status: 'active', appliedSlices: ['切片-C'] },
  { id: 'qos-004', name: '确定性时隙配置', type: 'timeslot', priority: 1, bandwidth: 10, status: 'active', appliedSlices: ['切片-D'] },
  { id: 'qos-005', name: '默认策略', type: 'default', priority: 5, bandwidth: 5, status: 'active', appliedSlices: [] }
];

// ============ 网络设备数据 ============
export const networkDevices = [
  { id: 'sw-bj-01', name: '交换机-北京-01', type: 'switch', cluster: 'bj', status: 'online', ports: 48, usedPorts: 32, cpu: 25, memory: 40 },
  { id: 'sw-bj-02', name: '交换机-北京-02', type: 'switch', cluster: 'bj', status: 'online', ports: 48, usedPorts: 28, cpu: 22, memory: 38 },
  { id: 'sw-xa-01', name: '交换机-西安-01', type: 'switch', cluster: 'xa', status: 'online', ports: 48, usedPorts: 40, cpu: 35, memory: 52 },
  { id: 'sw-xa-02', name: '交换机-西安-02', type: 'switch', cluster: 'xa', status: 'warning', ports: 48, usedPorts: 45, cpu: 48, memory: 65 },
  { id: 'sw-cs-01', name: '交换机-长沙-01', type: 'switch', cluster: 'cs', status: 'online', ports: 48, usedPorts: 24, cpu: 18, memory: 32 },
  { id: 'sw-cs-02', name: '交换机-长沙-02', type: 'switch', cluster: 'cs', status: 'online', ports: 48, usedPorts: 20, cpu: 15, memory: 28 },
  { id: 'ctrl-01', name: 'RYU控制器-01', type: 'controller', cluster: 'bj', status: 'online', ports: 0, usedPorts: 0, cpu: 30, memory: 45 }
];

// ============ 流表数据 ============
export const flowTables = [
  { id: 'flow-001', tableId: 0, priority: 100, match: { in_port: 1, eth_type: '0x0800', ipv4_dst: '10.0.1.0/24' }, actions: ['OUTPUT:2'], packetCount: 152034, byteCount: 182440800, slice: '切片-A' },
  { id: 'flow-002', tableId: 0, priority: 100, match: { in_port: 2, eth_type: '0x0800', ipv4_dst: '10.0.2.0/24' }, actions: ['OUTPUT:3'], packetCount: 98032, byteCount: 117638400, slice: '切片-B' },
  { id: 'flow-003', tableId: 0, priority: 50, match: { eth_type: '0x0800' }, actions: ['CONTROLLER'], packetCount: 5200348, byteCount: 6240417600, slice: null },
  { id: 'flow-004', tableId: 1, priority: 100, match: { tcp_dst: 8080 }, actions: ['OUTPUT:1', 'MODIFY_DL_SRC:00:00:00:00:00:01'], packetCount: 256000, byteCount: 307200000, slice: '切片-A' },
  { id: 'flow-005', tableId: 1, priority: 80, match: { udp_dst: 53 }, actions: ['OUTPUT:2'], packetCount: 890000, byteCount: 712000000, slice: null }
];

// ============ 遥测数据 ============
export const telemetryData = [
  { linkId: 'bj-xa', source: '北京', target: '西安', oneWayDelay: 25, jitter: 2.5, packetLoss: 0.1, throughput: 65, status: 'healthy' },
  { linkId: 'xa-cs', source: '西安', target: '长沙', oneWayDelay: 30, jitter: 3.2, packetLoss: 0.2, throughput: 45, status: 'healthy' },
  { linkId: 'cs-bj', source: '长沙', target: '北京', oneWayDelay: 35, jitter: 4.1, packetLoss: 0.15, throughput: 55, status: 'warning' }
];

// ============ 队列数据 ============
export const queues = [
  { id: 'queue-001', name: '高优先级队列', priority: 1, quota: 400, used: 280, tasks: 12, status: 'active', slice: '切片-A' },
  { id: 'queue-002', name: '中优先级队列', priority: 2, quota: 300, used: 180, tasks: 8, status: 'active', slice: '切片-B' },
  { id: 'queue-003', name: '低优先级队列', priority: 3, quota: 200, used: 150, tasks: 15, status: 'active', slice: '切片-C' },
  { id: 'queue-004', name: '默认队列', priority: 5, quota: 100, used: 40, tasks: 5, status: 'active', slice: '切片-D' }
];

// ============ 调度策略数据 ============
export const schedulingPolicies = [
  { id: 'sp-001', name: '全局负载均衡', type: 'loadbalance', status: 'active', params: { threshold: 80, algorithm: '加权轮询' }, lastModified: '2026-07-27 06:00' },
  { id: 'sp-002', name: '算力路由优化', type: 'route', status: 'active', params: { optimizationGoal: '时延优先', fallback: '带宽优先' }, lastModified: '2026-07-27 08:00' },
  { id: 'sp-003', name: '反馈式调度', type: 'feedback', status: 'active', params: { kp: 0.3, ki: 0.1, kd: 0.2, targetUtilization: 85 }, lastModified: '2026-07-27 10:00' }
];

// ============ 实时事件流 ============
export const events = [
  { type: 'alert', time: '10:32:15', text: '西安集群 交换机-西安-02 CPU使用率超过80%', level: 'warning' },
  { type: 'task', time: '10:31:42', text: 'AI推理任务-01 完成进度 65%', level: 'info' },
  { type: 'slice', time: '10:30:00', text: '切片-A 算力配额调整 +100 TFLOPS', level: 'info' },
  { type: 'policy', time: '10:28:33', text: 'QoS策略「带宽预留-高优先级」已下发至RYU控制器', level: 'success' },
  { type: 'alert', time: '10:25:18', text: '西安集群 计算节点-06 内存使用率超过85%', level: 'warning' },
  { type: 'task', time: '10:24:05', text: '数据分析任务-01 完成进度 88%', level: 'info' },
  { type: 'alert', time: '10:22:40', text: '长沙至北京链路 时延异常：当前 45ms，超出阈值 35ms', level: 'warning' },
  { type: 'task', time: '10:20:00', text: '视频渲染任务-01 完成进度 42%', level: 'info' },
  { type: 'policy', time: '10:18:22', text: '反馈式调度参数已更新：kp=0.3, ki=0.1', level: 'success' },
  { type: 'slice', time: '10:15:00', text: '新切片「切片-E」创建完成', level: 'info' }
];

// ============ 历史趋势数据 ============
export const generateTrendData = (hours = 24) => {
  const data = [];
  const now = Date.now();
  for (let i = hours; i >= 0; i--) {
    const time = new Date(now - i * 3600000);
    data.push({
      time: time.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }),
      timestamp: time.getTime(),
      flops: 1800 + Math.random() * 400 - 200,
      bandwidth: 55 + Math.random() * 30 - 15,
      latency: 28 + Math.random() * 10 - 5,
      tasks: Math.floor(15 + Math.random() * 10)
    });
  }
  return data;
};

// ============ API 函数 ============
export const api = {
  // 获取集群概览
  async getClusterOverview() {
    await delay(200);
    const totalFlops = clusters.reduce((sum, c) => sum + c.totalFlops, 0);
    const usedFlops = clusters.reduce((sum, c) => sum + c.usedFlops, 0);
    const totalNodes = clusters.reduce((sum, c) => sum + c.nodes, 0);
    const onlineNodes = clusters.reduce((sum, c) => sum + c.onlineNodes, 0);
    return {
      totalFlops,
      usedFlops,
      utilization: (usedFlops / totalFlops * 100).toFixed(1),
      totalNodes,
      onlineNodes,
      gpuRatio: (clusters.filter(c => c.id === 'bj').reduce((sum, c) => sum + c.nodes, 0) / totalNodes * 100).toFixed(1)
    };
  },

  // 获取网络概览
  async getNetworkOverview() {
    await delay(200);
    const totalBandwidth = links.reduce((sum, l) => sum + l.bandwidth, 0);
    const avgLatency = (links.reduce((sum, l) => sum + l.latency, 0) / links.length).toFixed(1);
    const avgPacketLoss = (links.reduce((sum, l) => sum + l.packetLoss, 0) / links.length).toFixed(2);
    const healthyLinks = links.filter(l => l.status === 'healthy').length;
    return {
      totalBandwidth,
      bandwidthUsage: (links.reduce((sum, l) => sum + l.usage, 0) / links.length).toFixed(1),
      avgLatency,
      avgPacketLoss,
      healthyLinks,
      totalLinks: links.length,
      slaRate: (healthyLinks / links.length * 100).toFixed(1)
    };
  },

  // 获取集群数据
  async getClusters() {
    await delay(150);
    return [...clusters];
  },

  // 获取节点数据
  async getNodes(filters = {}) {
    await delay(200);
    let result = [...nodes];
    if (filters.cluster) {
      result = result.filter(n => n.cluster === filters.cluster);
    }
    if (filters.type) {
      result = result.filter(n => n.type === filters.type);
    }
    if (filters.status) {
      result = result.filter(n => n.status === filters.status);
    }
    if (filters.search) {
      const search = filters.search.toLowerCase();
      result = result.filter(n => n.name.toLowerCase().includes(search));
    }
    return result;
  },

  // 获取切片数据
  async getSlices() {
    await delay(150);
    return [...slices];
  },

  // 获取任务数据
  async getTasks(filters = {}) {
    await delay(200);
    let result = [...tasks];
    if (filters.status) {
      result = result.filter(t => t.status === filters.status);
    }
    if (filters.priority) {
      result = result.filter(t => t.priority === filters.priority);
    }
    if (filters.slice) {
      result = result.filter(t => t.slice === filters.slice);
    }
    return result;
  },

  // 获取 QoS 策略
  async getQosPolicies() {
    await delay(150);
    return [...qosPolicies];
  },

  // 获取网络设备
  async getNetworkDevices() {
    await delay(150);
    return [...networkDevices];
  },

  // 获取流表数据
  async getFlowTables(filters = {}) {
    await delay(200);
    let result = [...flowTables];
    if (filters.slice) {
      result = result.filter(f => f.slice === filters.slice);
    }
    return result;
  },

  // 获取遥测数据
  async getTelemetryData() {
    await delay(150);
    return [...telemetryData];
  },

  // 获取队列数据
  async getQueues() {
    await delay(150);
    return [...queues];
  },

  // 获取调度策略
  async getSchedulingPolicies() {
    await delay(150);
    return [...schedulingPolicies];
  },

  // 获取实时事件
  async getEvents() {
    await delay(100);
    return [...events];
  },

  // 获取趋势数据
  async getTrendData(type = 'flops', hours = 24) {
    await delay(300);
    return generateTrendData(hours);
  },

  // 获取 Grafana 指标（在线集群数、在线节点数、CPU总核心数、内存总量）
  async getGrafanaMetrics() {
    const promUrl = 'http://192.168.10.31:9090/api/v1/query';
    const queries = {
      '在线集群数': 'count(count by(cluster) (up{job=~"node-.*"}))',
      '总节点数': 'count(count by(instance) (up{job=~"node-.*"}))',
      '在线节点数': 'count( up{job=~"node-.*"} == 1 )',
      'CPU总核心数': "count(node_cpu_seconds_total{mode='system'})",
      '内存总量': 'sum(node_memory_MemTotal_bytes{})',
      '交换机数': 'qos_switches_count ',
      '网络链路数': 'qos_links_count',
      '网络主机数': 'qos_hosts_count',
      'packet-in事件数': 'SUM(qos_switch_packet_in_total)'
    };

    try {
      const results = {};
      for (const [name, query] of Object.entries(queries)) {
        const resp = await fetch(`${promUrl}?query=${encodeURIComponent(query)}`);
        const data = await resp.json();
        if (data.status === 'success' && data.data.result.length > 0) {
          let value = parseFloat(data.data.result[0].value[1]);
          if (name === '内存总量') {
            value = Math.round(value / (1024 ** 4) * 10) / 10; // 转换为TB，保留1位小数
          } else {
            value = Math.round(value);
          }
          results[name] = { value, unit: name === '内存总量' ? 'TB' : name === 'CPU总核心数' ? '核' : '个' };
        }
      }
      return results;
    } catch (e) {
      console.error('获取Grafana指标失败:', e);
    }
    // 降级返回空数据
    return {
      '在线集群数': { value: 0, unit: '个' },
      '在线节点数': { value: 0, unit: '个' },
      'CPU总核心数': { value: 0, unit: '核' },
      '内存总量': { value: 0, unit: 'GB' }
    };
  }
};

export default api;
