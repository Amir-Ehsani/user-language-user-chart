export function escapeXml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

export function buildCardSvg(stats) {
  const width = 420;
  const rowH = 28;
  const top = 72;
  const langs = stats.languages.slice(0, 6);
  const height = top + langs.length * rowH + 28;
  const barMax = 250;

  const rows = langs
    .map((lang, i) => {
      const y = top + i * rowH;
      const w = Math.max(4, (lang.pct / 100) * barMax);
      const pct = lang.pct >= 10 ? lang.pct.toFixed(1) : lang.pct.toFixed(2);
      return `
      <text x="20" y="${y}" class="name">${escapeXml(lang.name)}</text>
      <rect x="128" y="${y - 11}" width="${barMax}" height="8" rx="4" fill="#21262d"/>
      <rect x="128" y="${y - 11}" width="${w}" height="8" rx="4" fill="${escapeXml(lang.color)}"/>
      <text x="400" y="${y}" class="pct" text-anchor="end">${pct}%</text>`;
    })
    .join("");

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" role="img" aria-label="${escapeXml(stats.user.login)} language chart">
  <style>
    .title { font: 600 15px ui-sans-serif, system-ui, Segoe UI, sans-serif; fill: #f4efe6; }
    .sub { font: 12px ui-sans-serif, system-ui, Segoe UI, sans-serif; fill: #8b8490; }
    .name { font: 12px ui-sans-serif, system-ui, Segoe UI, sans-serif; fill: #d8d0c4; }
    .pct { font: 11px ui-monospace, SFMono-Regular, Menlo, Consolas, monospace; fill: #9a9286; }
  </style>
  <rect width="${width}" height="${height}" rx="12" fill="#111214"/>
  <text x="20" y="32" class="title">${escapeXml(stats.user.login)}</text>
  <text x="20" y="50" class="sub">${stats.languageCount} languages · ${stats.repoCount} public repos</text>
  ${rows}
</svg>`;
}
