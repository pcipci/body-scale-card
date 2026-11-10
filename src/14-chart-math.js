/*
 * Module chart-math: axis ticks and smooth lines
 *
 * Pure helpers for the graph: round axis values, date ticks, and a smooth line that
 * never overshoots its points. No access to the card.
 */

// About `count` round axis values (steps of 1, 2 or 5 times a power of ten).
function niceTicks(v0, v1, count) {
  const raw = (v1 - v0) / count;
  const mag = 10 ** Math.floor(Math.log10(raw));
  const step = [1, 2, 5, 10].map((f) => f * mag).find((s) => s >= raw) || 10 * mag;
  const out = [];
  for (let v = Math.ceil(v0 / step) * step; v <= v1; v += step) out.push(+v.toFixed(6));
  out.digits = Math.max(0, -Math.floor(Math.log10(step) + 1e-9));
  return out;
}

// Month starts (or year starts over long spans) between t0 and t1, at most ~8.
function timeTicks(t0, t1) {
  const span = t1 - t0;
  if (span <= 0) return [];
  if (span < 10 * 86400000) {
    // A few days: every day, or every second one.
    const d = new Date(t0);
    d.setHours(0, 0, 0, 0);
    if (d.getTime() < t0) d.setDate(d.getDate() + 1);
    const out = [];
    for (; d.getTime() <= t1; d.setDate(d.getDate() + (span > 5 * 86400000 ? 2 : 1))) out.push(d.getTime());
    return out;
  }
  if (span < 62 * 86400000) {
    // Short spans: Mondays (every second one over a month).
    const d = new Date(t0);
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() + ((8 - d.getDay()) % 7));
    const out = [];
    for (; d.getTime() <= t1; d.setDate(d.getDate() + (span > 35 * 86400000 ? 14 : 7))) if (d.getTime() >= t0) out.push(d.getTime());
    return out;
  }
  const years = span > 430 * 86400000;
  const d = new Date(t0);
  d.setHours(0, 0, 0, 0);
  d.setDate(1);
  if (years) d.setMonth(0);
  const stepMonths = years ? 12 * Math.max(1, Math.ceil(span / (8 * 365 * 86400000))) : Math.max(1, Math.ceil(span / (8 * 30.4 * 86400000)));
  const out = [];
  while (d.getTime() <= t1) {
    if (d.getTime() >= t0) out.push(d.getTime());
    d.setMonth(d.getMonth() + stepMonths);
  }
  return out;
}

// A smooth line through the points that never overshoots them (monotone
// cubic, Fritsch–Butland tangents): between two readings it stays within
// their values, so it shows no highs or lows that were never measured.
const smoothPath = (pts) => {
  const f = (v) => v.toFixed(1);
  if (pts.length < 3) return pts.map(([px, py], i) => `${i ? "L" : "M"}${f(px)},${f(py)}`).join("");
  const n = pts.length;
  const dx = [], slope = [];
  for (let i = 0; i < n - 1; i++) {
    dx.push(pts[i + 1][0] - pts[i][0]);
    slope.push(dx[i] ? (pts[i + 1][1] - pts[i][1]) / dx[i] : 0);
  }
  const m = [slope[0]];
  for (let i = 1; i < n - 1; i++) {
    const a = slope[i - 1], b = slope[i];
    m.push(a * b <= 0 ? 0 : (3 * (dx[i - 1] + dx[i])) / ((2 * dx[i] + dx[i - 1]) / a + (dx[i] + 2 * dx[i - 1]) / b));
  }
  m.push(slope[n - 2]);
  let d = `M${f(pts[0][0])},${f(pts[0][1])}`;
  for (let i = 0; i < n - 1; i++) {
    const [x0, y0] = pts[i], [x1, y1] = pts[i + 1], h = dx[i] / 3;
    d += `C${f(x0 + h)},${f(y0 + m[i] * h)} ${f(x1 - h)},${f(y1 - m[i + 1] * h)} ${f(x1)},${f(y1)}`;
  }
  return d;
};
