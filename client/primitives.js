export const size = value => !Number.isFinite(value) ? '未知' : value >= 1048576 ? `${(value / 1048576).toFixed(1)} MB` : value >= 1024 ? `${(value / 1024).toFixed(1)} KB` : `${value.toLocaleString()} B`;
export const time = value => Number.isFinite(value) ? new Date(value).toLocaleTimeString('zh-CN', { hour12: false }) : '未记录';
export function createPrimitives(h) {
  const Button = ({ children, ...props }) => h('button', { type: 'button', className: 'cv-btn', ...props }, children);
  const Card = ({ title, hint, children }) => h('section', { className: 'cv-card' }, h('h3', null, title), hint && h('p', { className: 'cv-small' }, hint), children);
  const Notice = ({ state }) => h('div', { role: state.error ? 'alert' : 'status', className: state.error ? 'cv-notice' : 'cv-small' }, state.busy ? '正在保存…' : state.error ?? state.message ?? '',
    state.error && state.acknowledge && h(Button, { onClick: state.acknowledge }, '已刷新核对，开始新操作'));
  const Field = ({ label, value, change, type = 'text', ...props }) => h('label', { className: 'cv-field' }, h('span', null, label),
    h(type === 'textarea' ? 'textarea' : 'input', { type: type === 'textarea' ? undefined : type, value, onChange: event => change(event.target.value), ...props }));
  const Toggle = ({ label, checked, change, disabled }) => h('label', { className: 'cv-toggle' }, h('input', { type: 'checkbox', checked, disabled, onChange: e => change(e.target.checked) }), label);
  const Details = ({ title = '查看诊断数据', value }) => h('details', null, h('summary', null, title), h('pre', null, JSON.stringify(value, null, 2)));
  return { Button, Card, Notice, Field, Toggle, Details };
}
