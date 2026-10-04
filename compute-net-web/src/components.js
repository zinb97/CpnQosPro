// components.js - 公共组件

// ============ SVG 图标 ============
export const icons = {
  dashboard: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>`,
  server: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="3" width="20" height="6" rx="1"/><rect x="2" y="11" width="20" height="6" rx="1"/><circle cx="6" cy="6" r="1"/><circle cx="6" cy="14" r="1"/></svg>`,
  network: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="5" r="3"/><circle cx="5" cy="19" r="3"/><circle cx="19" cy="19" r="3"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="12" x2="5" y2="16"/><line x1="12" y1="12" x2="19" y2="16"/></svg>`,
  task: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>`,
  search: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>`,
  bell: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>`,
  sun: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>`,
  moon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>`,
  cpu: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="4" y="4" width="16" height="16" rx="2"/><rect x="9" y="9" width="6" height="6"/><line x1="9" y1="1" x2="9" y2="4"/><line x1="15" y1="1" x2="15" y2="4"/><line x1="9" y1="20" x2="9" y2="23"/><line x1="15" y1="20" x2="15" y2="23"/><line x1="20" y1="9" x2="23" y2="9"/><line x1="20" y1="14" x2="23" y2="14"/><line x1="1" y1="9" x2="4" y2="9"/><line x1="1" y1="14" x2="4" y2="14"/></svg>`,
  memory: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="6" width="20" height="12" rx="1"/><line x1="6" y1="10" x2="6" y2="14"/><line x1="10" y1="10" x2="10" y2="14"/><line x1="14" y1="10" x2="14" y2="14"/><line x1="18" y1="10" x2="18" y2="14"/></svg>`,
  disk: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"/><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"/></svg>`,
  gpu: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="6" width="20" height="12" rx="2"/><line x1="6" y1="12" x2="6" y2="12.01"/><line x1="10" y1="12" x2="10" y2="12.01"/><path d="M14 10h2"/><path d="M14 14h2"/></svg>`,
  bandwidth: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>`,
  latency: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>`,
  packetloss: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>`,
  sla: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><polyline points="9 12 11 14 15 10"/></svg>`,
  flops: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>`,
  nodes: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"/><circle cx="19" cy="5" r="2"/><circle cx="5" cy="5" r="2"/><circle cx="5" cy="19" r="2"/><circle cx="19" cy="19" r="2"/><line x1="12" y1="9" x2="12" y2="5"/><line x1="14.5" y1="13.5" x2="18" y2="18"/><line x1="9.5" y1="13.5" x2="6" y2="18"/></svg>`,
  flow: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>`,
  topology: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="5" r="3"/><circle cx="5" cy="19" r="3"/><circle cx="19" cy="19" r="3"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="12" x2="5" y2="16"/><line x1="12" y1="12" x2="19" y2="16"/></svg>`,
  qos: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="4" y1="21" x2="4" y2="14"/><line x1="4" y1="10" x2="4" y2="3"/><line x1="12" y1="21" x2="12" y2="12"/><line x1="12" y1="8" x2="12" y2="3"/><line x1="20" y1="21" x2="20" y2="16"/><line x1="20" y1="12" x2="20" y2="3"/><line x1="1" y1="14" x2="7" y2="14"/><line x1="9" y1="8" x2="15" y2="8"/><line x1="17" y1="16" x2="23" y2="16"/></svg>`,
  telemetry: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>`,
  slice: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 2a10 10 0 0 1 0 20"/><path d="M12 12L12 2"/></svg>`,
  trendUp: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>`,
  trendDown: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="23 18 13.5 8.5 8.5 13.5 1 6"/><polyline points="17 18 23 18 23 12"/></svg>`,
  alert: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>`,
  check: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg>`,
  x: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>`,
  plus: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>`,
  refresh: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/></svg>`,
  download: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>`,
  fullscreen: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="15 3 21 3 21 9"/><polyline points="9 21 3 21 3 15"/><line x1="21" y1="3" x2="14" y2="10"/><line x1="3" y1="21" x2="10" y2="14"/></svg>`,
  user: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>`,
  settings: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>`,
  logout: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>`,
  chevronDown: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 12 15 18 9"/></svg>`,
  chevronRight: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"/></svg>`,
  edit: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>`,
  trash: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>`,
  play: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="5 3 19 12 5 21 5 3"/></svg>`,
  pause: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg>`,
  stop: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/></svg>`,
  clock: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>`,
  calendar: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>`,
  map: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6"/><line x1="8" y1="2" x2="8" y2="18"/><line x1="16" y1="6" x2="16" y2="22"/></svg>`,
  link: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>`,
  switch: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="4" width="20" height="6" rx="1"/><rect x="2" y="14" width="20" height="6" rx="1"/><circle cx="6" cy="7" r="1"/><circle cx="6" cy="17" r="1"/><circle cx="10" cy="7" r="1"/><circle cx="10" cy="17" r="1"/><circle cx="14" cy="7" r="1"/><circle cx="14" cy="17" r="1"/><circle cx="18" cy="7" r="1"/><circle cx="18" cy="17" r="1"/></svg>`,
  host: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="2" width="20" height="8" rx="2"/><rect x="2" y="14" width="20" height="8" rx="2"/><line x1="6" y1="6" x2="6.01" y2="6"/><line x1="6" y1="18" x2="6.01" y2="18"/><line x1="12" y1="6" x2="12.01" y2="6"/><line x1="12" y1="18" x2="12.01" y2="18"/></svg>`,
  packet: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/></svg>`
};

// ============ Icon 组件 ============
export function Icon({ name, size = 16, className = '' }) {
  const iconSvg = icons[name] || icons.alert;
  return `<span class="icon ${className}" style="width:${size}px;height:${size}px;display:inline-flex;align-items:center;justify-content:center;">${iconSvg}</span>`;
}

// ============ MetricCard 组件 ============
export function MetricCard({ label, value, unit, icon, iconColor = 'blue', trend, trendValue, className = '' }) {
  const iconColors = {
    blue: 'metric-card__icon--blue',
    purple: 'metric-card__icon--purple',
    green: 'metric-card__icon--green',
    yellow: 'metric-card__icon--yellow',
    red: 'metric-card__icon--red'
  };

  const trendClass = trend === 'up' ? 'metric-card__trend--up' : 'metric-card__trend--down';
  const trendIcon = trend === 'up' ? icons.trendUp : icons.trendDown;

  return `
    <div class="metric-card ${className}">
      <div class="metric-card__header">
        <span class="metric-card__label">${label}</span>
        ${icon ? `<div class="metric-card__icon ${iconColors[iconColor]}">${icons[icon] || ''}</div>` : ''}
      </div>
      <div class="metric-card__value">
        ${value}<span class="metric-card__unit">${unit || ''}</span>
      </div>
      ${trend ? `
        <div class="metric-card__footer">
          <span class="metric-card__trend ${trendClass}">${trendIcon}<small>${trendValue}</small></span>
          <span class="metric-card__compare">较上一周期</span>
        </div>
      ` : ''}
    </div>
  `;
}

// ============ DataTable 组件 ============
export function DataTable({ columns, data, onRowClick }) {
  return `
    <div class="table-wrapper">
      <table class="table">
        <thead>
          <tr>
            ${columns.map(col => `<th>${col.label}</th>`).join('')}
          </tr>
        </thead>
        <tbody>
          ${data.map(row => `
            <tr ${onRowClick ? `data-id="${row.id || row.name}" style="cursor:pointer;"` : ''}>
              ${columns.map(col => {
                let value = row[col.key];
                if (col.render) {
                  value = col.render(value, row);
                }
                return `<td>${value || '-'}</td>`;
              }).join('')}
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>
  `;
}

// ============ StatusBadge 组件 ============
export function StatusBadge({ status, label }) {
  const statusMap = {
    healthy: { class: 'status--healthy', text: '健康' },
    warning: { class: 'status--warning', text: '警告' },
    critical: { class: 'status--critical', text: '严重' },
    offline: { class: 'status--offline', text: '离线' },
    online: { class: 'status--healthy', text: '在线' },
    active: { class: 'status--healthy', text: '活跃' },
    running: { class: 'status--healthy', text: '运行中' },
    queued: { class: 'status--warning', text: '排队中' },
    completed: { class: 'status--healthy', text: '已完成' },
    failed: { class: 'status--critical', text: '失败' },
    paused: { class: 'status--warning', text: '已暂停' }
  };

  const config = statusMap[status] || { class: 'status--offline', text: label || status };

  return `<span class="status ${config.class}">${config.text}</span>`;
}

// ============ ProgressBar 组件 ============
export function ProgressBar({ value, max = 100, color = 'blue', showLabel = false }) {
  const percentage = Math.min(100, Math.max(0, (value / max) * 100));
  const colorClass = `progress__bar--${color}`;

  let autoColor = 'blue';
  if (percentage > 90) autoColor = 'red';
  else if (percentage > 70) autoColor = 'yellow';

  return `
    <div class="progress-wrapper" style="display:flex;align-items:center;gap:8px;">
      <div class="progress" style="flex:1;">
        <div class="progress__bar ${color === 'auto' ? `progress__bar--${autoColor}` : colorClass}" style="width:${percentage}%;"></div>
      </div>
      ${showLabel ? `<span class="mono" style="font-size:12px;color:var(--color-text-secondary);min-width:40px;text-align:right;">${value.toFixed(1)}%</span>` : ''}
    </div>
  `;
}

// ============ Tab 组件 ============
export function Tabs({ tabs, activeTab, onChange }) {
  return `
    <div class="tabs">
      ${tabs.map(tab => `
        <div class="tab ${activeTab === tab.id ? 'tab--active' : ''}" data-tab="${tab.id}">
          ${tab.label}
        </div>
      `).join('')}
    </div>
  `;
}

// ============ TimeSelector 组件 ============
export function TimeSelector({ value, onChange }) {
  const options = ['1小时', '6小时', '24小时', '7天', '自定义'];
  return `
    <div class="time-selector">
      ${options.map(opt => `
        <button class="time-selector__btn ${value === opt ? 'time-selector__btn--active' : ''}" data-time="${opt}">
          ${opt}
        </button>
      `).join('')}
    </div>
  `;
}

// ============ AlertBadge 组件 ============
export function AlertBadge({ type, text }) {
  return `<span class="alert-badge alert-badge--${type}">${text}</span>`;
}

// ============ DonutChart 组件 ============
export function DonutChart({ value, max, label, size = 120 }) {
  const percentage = (value / max) * 100;
  const strokeWidth = 10;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percentage / 100) * circumference;

  return `
    <div class="donut" style="width:${size}px;height:${size}px;">
      <svg class="donut__chart" width="${size}" height="${size}">
        <circle cx="${size/2}" cy="${size/2}" r="${radius}" fill="none" stroke="var(--color-bg-secondary)" stroke-width="${strokeWidth}"/>
        <circle cx="${size/2}" cy="${size/2}" r="${radius}" fill="none" stroke="var(--color-accent)" stroke-width="${strokeWidth}"
          stroke-dasharray="${circumference}" stroke-dashoffset="${offset}" stroke-linecap="round"/>
      </svg>
      <div class="donut__center">
        <span class="donut__value">${percentage.toFixed(0)}%</span>
        <span class="donut__label">${label}</span>
      </div>
    </div>
  `;
}

// ============ ListItem 组件 ============
export function ListItem({ title, subtitle, primary, secondary, trend }) {
  return `
    <div class="list-item">
      <div class="list-item__content">
        <span class="list-item__title">${title}</span>
        ${subtitle ? `<span class="list-item__subtitle">${subtitle}</span>` : ''}
      </div>
      <div class="list-item__value">
        ${primary ? `<span class="list-item__primary">${primary}</span>` : ''}
        ${secondary ? `<span class="list-item__secondary">${secondary}</span>` : ''}
      </div>
    </div>
  `;
}

// ============ EventStream 组件 ============
export function EventStream({ events }) {
  const eventIcons = {
    alert: `<span style="width:6px;height:6px;border-radius:50%;background:var(--color-danger);"></span>`,
    task: `<span style="width:6px;height:6px;border-radius:50%;background:var(--color-accent);"></span>`,
    slice: `<span style="width:6px;height:6px;border-radius:50%;background:var(--color-accent-2);"></span>`,
    policy: `<span style="width:6px;height:6px;border-radius:50%;background:var(--color-success);"></span>`
  };

  // 复制一份以实现无缝滚动
  const duplicatedEvents = [...events, ...events];

  return `
    <div class="event-stream-wrapper" style="overflow:hidden;width:100%;">
      <div class="event-stream" id="eventStream">
        ${duplicatedEvents.map(evt => `
          <div class="event-item event-item--${evt.type}">
            <span class="event-item__time">${evt.time}</span>
            ${eventIcons[evt.type] || eventIcons.alert}
            <span class="event-item__text">${evt.text}</span>
          </div>
        `).join('')}
      </div>
    </div>
  `;
}

// ============ FilterBar 组件 ============
export function FilterBar({ filters, onFilterChange }) {
  return `
    <div class="filter-bar">
      ${filters.map(filter => {
        if (filter.type === 'select') {
          return `
            <select class="select" data-filter="${filter.key}">
              <option value="">${filter.placeholder || '全部'}</option>
              ${filter.options.map(opt => `
                <option value="${opt.value}">${opt.label}</option>
              `).join('')}
            </select>
          `;
        } else if (filter.type === 'search') {
          return `
            <div class="search-box">
              <span class="search-box__icon">${icons.search}</span>
              <input type="text" class="search-box__input" data-filter="${filter.key}" placeholder="${filter.placeholder || '搜索...'}">
            </div>
          `;
        }
        return '';
      }).join('')}
      <button class="btn btn--secondary btn--icon" title="刷新">${icons.refresh}</button>
      <button class="btn btn--secondary">${icons.download} 导出</button>
    </div>
  `;
}

// ============ EmptyState 组件 ============
export function EmptyState({ icon, text }) {
  return `
    <div class="empty">
      <div class="empty__icon">${icons[icon] || icons.alert}</div>
      <p class="empty__text">${text || '暂无数据'}</p>
    </div>
  `;
}

// ============ Modal 组件 ============
export function Modal({ id, title, content, footer }) {
  return `
    <div class="modal" id="${id}">
      <div class="modal__content">
        <div class="modal__header">
          <h3 class="modal__title">${title}</h3>
          <button class="modal__close" data-close="${id}">${icons.x}</button>
        </div>
        <div class="modal__body">${content}</div>
        ${footer ? `<div class="modal__footer">${footer}</div>` : ''}
      </div>
    </div>
  `;
}

export default {
  Icon,
  MetricCard,
  DataTable,
  StatusBadge,
  ProgressBar,
  Tabs,
  TimeSelector,
  AlertBadge,
  DonutChart,
  ListItem,
  EventStream,
  FilterBar,
  EmptyState,
  Modal,
  icons
};
