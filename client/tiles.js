// 二分切块保留面积比例；小块可通过图外列表访问。
export function layoutTiles(items) {
  const rows = items.filter(item => Number.isFinite(item.bytes) && item.bytes > 0)
    .map((item, index) => ({ item, index })).sort((a, b) => b.item.bytes - a.item.bytes || a.index - b.index);
  const result = [];
  function split(group, x, y, width, height) {
    if (!group.length) return;
    if (group.length === 1) { result.push({ ...group[0].item, x, y, width, height }); return; }
    const total = group.reduce((sum, row) => sum + row.item.bytes, 0);
    let cut = 1, sum = group[0].item.bytes;
    while (cut < group.length - 1 && Math.abs(sum + group[cut].item.bytes - total / 2) < Math.abs(sum - total / 2)) sum += group[cut++].item.bytes;
    const ratio = sum / total;
    if (width >= height) {
      split(group.slice(0, cut), x, y, width * ratio, height);
      split(group.slice(cut), x + width * ratio, y, width * (1 - ratio), height);
    } else {
      split(group.slice(0, cut), x, y, width, height * ratio);
      split(group.slice(cut), x, y + height * ratio, width, height * (1 - ratio));
    }
  }
  split(rows, 0, 0, 100, 100);
  return result;
}
