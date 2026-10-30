// 只有同一投影内的分类和总量可相加时才绘制比例。
export function windowMeter(meter) {
  const composition = meter?.composition, capacity = meter?.pressure?.window;
  const total = composition?.total;
  if (!Number.isFinite(total) || total < 0 || !Number.isFinite(capacity) || capacity <= 0) return null;
  const definitions = [['system', '宿主指令', 'contract', '#8068ce55'], ['tools', '工具定义', 'tools', '#149b9455'],
    ['user', '用户消息', 'history', '#3c71da55'], ['assistant', '助手消息', 'history', '#6285cc55'],
    ['tool', '工具结果', 'history', '#d5a34255'], ['inject', '插件注入', 'other', '#bd865955'], ['skill', '技能', 'other', '#8c6dac55']];
  const items = definitions.filter(([key]) => Number.isFinite(composition[key]) && composition[key] > 0)
    .map(([id, title, category, color]) => ({ id, title, category, color, bytes: composition[id] }));
  const sum = items.reduce((count, item) => count + item.bytes, 0);
  if (sum > total) return null;
  if (total > sum) items.push({ id: 'unclassified', title: '其他输入', category: 'other', color: '#8793a555', bytes: total - sum });
  return { total, capacity, free: Math.max(0, capacity - total), ratio: Math.min(1, total / capacity), items };
}
