"use client";

import { useMemo, useState } from "react";

function formatBytes(n) {
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
  if (n < 1024 * 1024 * 1024) return `${(n / (1024 * 1024)).toFixed(1)} MB`;
  return `${(n / (1024 * 1024 * 1024)).toFixed(2)} GB`;
}

const MODES = [
  { id: "donut", label: "donut" },
  { id: "bars", label: "bars" },
  { id: "tree", label: "treemap" },
  { id: "rose", label: "radial" },
  { id: "repos", label: "by repo" },
];

function polar(cx, cy, r, a) {
  return [cx + r * Math.cos(a), cy + r * Math.sin(a)];
}

function slicePath(cx, cy, r0, r1, a0, a1) {
  const sweep = a1 - a0;
  if (sweep <= 0.0001) return "";
  if (sweep >= Math.PI * 2 - 0.0001) {
    const [x1, y1] = polar(cx, cy, r1, 0);
    const [x2, y2] = polar(cx, cy, r1, Math.PI);
    const [x3, y3] = polar(cx, cy, r0, Math.PI);
    const [x4, y4] = polar(cx, cy, r0, 0);
    return [
      `M ${x1} ${y1}`,
      `A ${r1} ${r1} 0 1 1 ${x2} ${y2}`,
      `A ${r1} ${r1} 0 1 1 ${x1} ${y1}`,
      `L ${x4} ${y4}`,
      `A ${r0} ${r0} 0 1 0 ${x3} ${y3}`,
      `A ${r0} ${r0} 0 1 0 ${x4} ${y4}`,
      "Z",
    ].join(" ");
  }
  const large = sweep > Math.PI ? 1 : 0;
  const [x0, y0] = polar(cx, cy, r1, a0);
  const [x1, y1] = polar(cx, cy, r1, a1);
  const [x2, y2] = polar(cx, cy, r0, a1);
  const [x3, y3] = polar(cx, cy, r0, a0);
  return `M ${x0} ${y0} A ${r1} ${r1} 0 ${large} 1 ${x1} ${y1} L ${x2} ${y2} A ${r0} ${r0} 0 ${large} 0 ${x3} ${y3} Z`;
}

function splitTree(items, x, y, w, h) {
  if (!items.length) return [];
  if (items.length === 1) {
    return [{ ...items[0], x, y, w, h }];
  }
  const total = items.reduce((sum, item) => sum + item.bytes, 0);
  let acc = 0;
  let cut = 1;
  for (let i = 0; i < items.length; i++) {
    acc += items[i].bytes;
    cut = i + 1;
    if (acc >= total / 2) break;
  }
  if (cut === items.length) cut = items.length - 1;
  const left = items.slice(0, cut);
  const right = items.slice(cut);
  const leftSum = left.reduce((sum, item) => sum + item.bytes, 0);
  const frac = leftSum / total;
  if (w >= h) {
    return [
      ...splitTree(left, x, y, w * frac, h),
      ...splitTree(right, x + w * frac, y, w * (1 - frac), h),
    ];
  }
  return [
    ...splitTree(left, x, y, w, h * frac),
    ...splitTree(right, x, y + h * frac, w, h * (1 - frac)),
  ];
}

function caption(lang) {
  if (!lang) return "hover a slice";
  const repos = lang.repos ? ` · ${lang.repos} repo${lang.repos === 1 ? "" : "s"}` : "";
  return `${lang.name}  ${lang.pct.toFixed(1)}%  ${formatBytes(lang.bytes)}${repos}`;
}

function ink(color) {
  const hex = String(color || "#888").replace("#", "");
  const full =
    hex.length === 3
      ? hex
          .split("")
          .map((c) => c + c)
          .join("")
      : hex;
  const n = parseInt(full, 16);
  if (Number.isNaN(n)) return "#f4efe6";
  const r = (n >> 16) & 255;
  const g = (n >> 8) & 255;
  const b = n & 255;
  const l = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return l > 0.62 ? "#0a0a0a" : "#eee";
}

export default function Viz({ languages, repos }) {
  const [mode, setMode] = useState("donut");
  const [active, setActive] = useState(null);
  const current = languages.find((lang) => lang.name === active) || null;
  const maxPct = languages[0]?.pct || 1;

  const tree = useMemo(() => splitTree(languages, 0, 0, 1000, 560), [languages]);

  return (
    <div className="viz">
      <div className="modes" role="tablist">
        {MODES.map((item) => (
          <button
            key={item.id}
            type="button"
            role="tab"
            aria-selected={mode === item.id}
            className={mode === item.id ? "on" : ""}
            onClick={() => setMode(item.id)}
          >
            {item.label}
          </button>
        ))}
      </div>

      <p className="caption">{caption(current)}</p>

      <div className="chart-slot">
        {mode === "donut" && (
          <Donut languages={languages} active={active} setActive={setActive} />
        )}
        {mode === "bars" && (
          <Bars languages={languages} maxPct={maxPct} active={active} setActive={setActive} />
        )}
        {mode === "tree" && (
          <Tree cells={tree} active={active} setActive={setActive} />
        )}
        {mode === "rose" && (
          <Rose languages={languages} maxPct={maxPct} active={active} setActive={setActive} />
        )}
        {mode === "repos" && (
          <RepoStack repos={repos} active={active} setActive={setActive} />
        )}
      </div>

      <ol className="list viz-legend">
        {languages.map((lang) => (
          <li
            key={lang.name}
            className={active && active !== lang.name ? "dim" : ""}
            onMouseEnter={() => setActive(lang.name)}
            onMouseLeave={() => setActive(null)}
          >
            <span className="swatch" style={{ background: lang.color }} />
            <div>
              {lang.name}
              <div className="bar">
                <span style={{ width: `${lang.pct}%`, background: lang.color }} />
              </div>
            </div>
            <span className="pct">{lang.pct.toFixed(1)}%</span>
          </li>
        ))}
      </ol>
    </div>
  );
}

function Donut({ languages, active, setActive }) {
  const cx = 200;
  const cy = 200;
  const r0 = 78;
  const r1 = 148;
  let angle = -Math.PI / 2;
  const top = languages[0];

  return (
    <svg className="frame donut-frame" viewBox="0 0 400 400">
      {languages.map((lang) => {
        const sweep = (lang.pct / 100) * Math.PI * 2;
        const a0 = angle;
        const a1 = angle + sweep;
        angle = a1;
        const dim = active && active !== lang.name;
        return (
          <path
            key={lang.name}
            d={slicePath(cx, cy, r0, r1, a0, a1)}
            fill={lang.color}
            stroke="#000"
            strokeWidth="2"
            opacity={dim ? 0.28 : 1}
            onMouseEnter={() => setActive(lang.name)}
            onMouseLeave={() => setActive(null)}
          />
        );
      })}
      <text x={cx} y={cy - 8} textAnchor="middle" className="hole-name">
        {top?.name}
      </text>
      <text x={cx} y={cy + 16} textAnchor="middle" className="hole-pct">
        {top ? `${top.pct.toFixed(1)}%` : ""}
      </text>
    </svg>
  );
}

function Bars({ languages, maxPct, active, setActive }) {
  const row = 34;
  const height = 16 + languages.length * row;
  const labelW = 128;
  const barW = 340;

  return (
    <svg className="frame bar-frame" viewBox={`0 0 560 ${height}`}>
      {languages.map((lang, i) => {
        const y = 10 + i * row;
        const w = Math.max(3, (lang.pct / maxPct) * barW);
        const dim = active && active !== lang.name;
        return (
          <g
            key={lang.name}
            opacity={dim ? 0.28 : 1}
            onMouseEnter={() => setActive(lang.name)}
            onMouseLeave={() => setActive(null)}
          >
            <text x="0" y={y + 13} className="tick">
              {lang.name}
            </text>
            <rect x={labelW} y={y} width={barW} height="14" rx="0" fill="#171717" />
            <rect x={labelW} y={y} width={w} height="14" rx="0" fill={lang.color} />
            <text x={labelW + barW + 10} y={y + 13} className="tick muted">
              {lang.pct.toFixed(1)}%
            </text>
          </g>
        );
      })}
    </svg>
  );
}

function Tree({ cells, active, setActive }) {
  return (
    <svg className="frame tree-frame" viewBox="0 0 1000 560">
      {cells.map((cell) => {
        const dim = active && active !== cell.name;
        const show = cell.w > 90 && cell.h > 36;
        return (
          <g
            key={cell.name}
            opacity={dim ? 0.28 : 1}
            onMouseEnter={() => setActive(cell.name)}
            onMouseLeave={() => setActive(null)}
          >
            <rect
              x={cell.x + 1.5}
              y={cell.y + 1.5}
              width={Math.max(0, cell.w - 3)}
              height={Math.max(0, cell.h - 3)}
              fill={cell.color}
              stroke="#000"
              strokeWidth="2"
            />
            {show && (
              <>
                <text
                  x={cell.x + 12}
                  y={cell.y + 24}
                  className="tree-name"
                  fill={ink(cell.color)}
                >
                  {cell.name}
                </text>
                <text
                  x={cell.x + 12}
                  y={cell.y + 42}
                  className="tree-pct"
                  fill={ink(cell.color)}
                >
                  {cell.pct.toFixed(1)}%
                </text>
              </>
            )}
          </g>
        );
      })}
    </svg>
  );
}

function Rose({ languages, maxPct, active, setActive }) {
  const cx = 200;
  const cy = 200;
  const inner = 28;
  const outer = 168;
  const slice = (Math.PI * 2) / languages.length;
  let a = -Math.PI / 2 - slice / 2;

  return (
    <svg className="frame donut-frame" viewBox="0 0 400 400">
      {languages.map((lang) => {
        const r = inner + (outer - inner) * Math.sqrt(lang.pct / maxPct);
        const a0 = a;
        const a1 = a + slice * 0.92;
        a += slice;
        const dim = active && active !== lang.name;
        return (
          <path
            key={lang.name}
            d={slicePath(cx, cy, inner, r, a0, a1)}
            fill={lang.color}
            stroke="#000"
            strokeWidth="2"
            opacity={dim ? 0.28 : 0.95}
            onMouseEnter={() => setActive(lang.name)}
            onMouseLeave={() => setActive(null)}
          />
        );
      })}
    </svg>
  );
}

function RepoStack({ repos, active, setActive }) {
  if (!repos?.length) {
    return <p className="note">No per-repo language mix to draw.</p>;
  }

  return (
    <ul className="repo-list">
      {repos.map((repo) => (
        <li key={repo.name}>
          <div className="repo-head">
            <a href={repo.url}>{repo.name}</a>
            <span>{formatBytes(repo.bytes)}</span>
          </div>
          <div className="stack" title={repo.name}>
            {repo.languages.map((lang) => (
              <span
                key={lang.name}
                style={{
                  width: `${Math.max(lang.pct, 0.6)}%`,
                  background: lang.color,
                  opacity: active && active !== lang.name ? 0.28 : 1,
                }}
                onMouseEnter={() => setActive(lang.name)}
                onMouseLeave={() => setActive(null)}
              />
            ))}
          </div>
        </li>
      ))}
    </ul>
  );
}
