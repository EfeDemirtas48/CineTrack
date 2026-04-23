// ─── Date utilities ───────────────────────────

export function formatDate(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  return d.toLocaleDateString('tr-TR', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });
}

export function timeAgo(timestamp) {
  if (!timestamp) return '';
  const diff = Date.now() - timestamp;
  const min  = Math.floor(diff / 60000);
  const hr   = Math.floor(diff / 3600000);
  const day  = Math.floor(diff / 86400000);
  if (min < 1)  return 'Az önce';
  if (min < 60) return `${min} dakika önce`;
  if (hr  < 24) return `${hr} saat önce`;
  if (day < 30) return `${day} gün önce`;
  return formatDate(new Date(timestamp).toISOString().slice(0, 10));
}
