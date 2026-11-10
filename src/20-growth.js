/*
 * Module growth: children's percentiles (maths and loading)
 *
 * The WHO 2007 and Kromeyer-Hauschild tables are NOT part of this file: they are separate
 * data files (body-scale-card.growth.*.json next to the card, each with source and licence in its head).
 * They are loaded only after the user ticked the option in the editor; without them the
 * card works, just without percentiles and children's curves.
 */

// ---- BEGIN growth: percentile maths and loading of the LMS tables.
// Sources of the data files: de Onis et al. 2007, Bull World Health Organ 85:660-7 (WHO,
// CC BY-NC-SA); Kromeyer-Hauschild et al. 2001, Monatsschrift Kinderheilkunde 149:807-818
// (tables from the R package childsds, GPL-3). Tested against growth.py.
// GROWTH.who / GROWTH.kh are the parsed files, null until loaded.
const GROWTH = { who: null, kh: null };
const GROWTH_FILES = { who: "who_2007.json", kh: "kromeyer_hauschild_2001.json" };
const GROWTH_LICENSE = { who: "CC BY-NC-SA 3.0 IGO", kh: "GPL-3.0-or-later" };
// Per reference: does the file exist next to the card (probe), is it loading.
const growthState = { who: { exists: null, loading: false }, kh: { exists: null, loading: false } };
const growthUrl = (ref) => (cardFolder ? `${cardFolder}body-scale-card.growth.${GROWTH_FILES[ref]}` : null);
const growthChanged = () => globalOptions.cards.forEach((c) => c._render?.());
// Is the file there? (HEAD request, once per page.)
function growthProbe(ref) {
  const st = growthState[ref];
  if (st.exists !== null || st.probing) return;
  st.probing = true;
  const url = growthUrl(ref);
  (url ? fetch(url, { method: "HEAD" }).then((r) => r.ok) : Promise.resolve(false))
    .catch(() => false)
    .then((ok) => { st.exists = ok; st.probing = false; growthChanged(); });
}
// Load the file (only called with the user's consent).
function growthLoad(ref) {
  const st = growthState[ref];
  if (GROWTH[ref] || st.loading || st.failed) return;
  const url = growthUrl(ref);
  if (!url) return;
  st.loading = true;
  fetch(url).then((r) => (r.ok ? r.json() : Promise.reject(new Error(r.status))))
    .then((data) => {
      if (!data || !data.bmi || !data.height) throw new Error("not a growth table");
      GROWTH[ref] = data;
    })
    .catch((e) => { st.failed = true; console.warn("body-scale-card: growth data", ref, "not loaded", e); })
    .finally(() => { st.loading = false; growthChanged(); });
}
// "ready" = file exists but not allowed yet, "loaded", or "absent".
const growthStatus = (ref) => (GROWTH[ref] ? "loaded" : growthState[ref].exists ? "ready" : "absent");
function growthErf(x) {
  // Series up to |x| = 4, beyond that erf is 1 to better than 1e-8.
  const a = Math.abs(x);
  if (a >= 4) return Math.sign(x);
  let sum = 0, term = a;
  for (let n = 0; n < 80; n++) {
    sum += term / (2 * n + 1);
    term *= (-a * a) / (n + 1);
    if (Math.abs(term) < 1e-18) break;
  }
  const v = (2 / Math.sqrt(Math.PI)) * sum;
  return Math.sign(x) * Math.min(v, 1);
}
const growthPercentOf = (z) => Math.round(50 * (1 + growthErf(z / Math.SQRT2)) * 10) / 10;
const growthRound = (v, d) => Math.round(v * 10 ** d) / 10 ** d;
function growthLms(ref, kind, sex, months) {
  const side = sex === "female" ? "female" : "male";
  if (!GROWTH[ref === "kh" ? "kh" : "who"]) return null;
  if (ref === "kh") {
    const table = GROWTH.kh[kind][side];
    const years = months / 12;
    if (years < table[0][0] || years > table[table.length - 1][0]) return null;
    for (let i = 0; i + 1 < table.length; i++) {
      const a = table[i], b = table[i + 1];
      if (a[0] <= years && years <= b[0]) {
        const f = b[0] > a[0] ? (years - a[0]) / (b[0] - a[0]) : 0;
        return [1, 2, 3].map((k) => a[k] + (b[k] - a[k]) * f);
      }
    }
    return table[table.length - 1].slice(1);
  }
  if (months < GROWTH.who.first_month || months > GROWTH.who.last_month) return null;
  const table = GROWTH.who[kind][side];
  const whole = Math.floor(months);
  const low = whole - GROWTH.who.first_month, high = Math.min(low + 1, table.length - 1), frac = months - whole;
  return table[low].map((v, i) => v + (table[high][i] - v) * frac);
}
// { z, p } of a BMI or height (kind "bmi" / "height") at an age in whole months, or null.
function growthPercentile(ref, kind, value, sex, months) {
  if (!(value > 0)) return null;
  const params = growthLms(ref, kind, sex, months);
  if (!params) return null;
  const [l, m, s] = params;
  let z = l ? (Math.pow(value / m, l) - 1) / (l * s) : 0;
  // Beyond +-3 SD the WHO extends the BMI curve linearly in BMI units.
  if (ref === "who" && kind === "bmi" && Math.abs(z) > 3) {
    const sign = z > 0 ? 1 : -1;
    const sd3 = m * Math.pow(1 + l * s * 3 * sign, 1 / l), sd2 = m * Math.pow(1 + l * s * 2 * sign, 1 / l);
    z = sign * 3 + (value - sd3) / Math.abs(sd3 - sd2);
  }
  return { z: growthRound(z, 2), p: growthPercentOf(z) };
}
// WHO cut-offs (-2 / +1 / +2 SD) or the German ones (P10 / P90 / P97).
function growthCategory(ref, z) {
  if (ref === "kh") return z < -1.2816 ? "thinness" : z > 1.8808 ? "obesity" : z > 1.2816 ? "overweight" : "normal";
  return z < -2 ? "thinness" : z > 2 ? "obesity" : z > 1 ? "overweight" : "normal";
}
const GROWTH_CURVE_Z = [-1.8808, -1.2816, 0, 1.2816, 1.8808];
// [months, P3, P10, P50, P90, P97] rows.
function growthCurves(ref, kind, sex, from, to, step = 1) {
  const rows = [];
  for (let months = Math.max(0, from); months <= to; months += step) {
    const params = growthLms(ref, kind, sex, months);
    if (!params) continue;
    const [l, m, s] = params;
    rows.push([months, ...GROWTH_CURVE_Z.map((z) => growthRound(l ? m * Math.pow(1 + l * s * z, 1 / l) : m * Math.exp(s * z), 2))]);
  }
  return rows;
}
// Whole months between a birth date (YYYY-MM-DD) and a time, like age_in_months.
function growthAgeMonths(born, ms) {
  const b = /^(\d{4})-(\d{2})-(\d{2})/.exec(String(born || ""));
  if (!b) return null;
  const on = new Date(ms);
  let months = (on.getFullYear() - Number(b[1])) * 12 + on.getMonth() + 1 - Number(b[2]);
  if (on.getDate() < Number(b[3])) months -= 1;
  return months >= 0 ? months : null;
}
// ---- END growth
