/*
 * Module card-chart: the history graph
 *
 * Views (weight + fat, composition, BMI, height), series, curves and percentile
 * bands, the SVG drawing, tooltips and the stacked composition chart.
 */

mixin(BodyScaleCard, {
  // Composition view: kilograms stacked (default) or weight + fat in percent.
  _compPctOn() {
    return this._compPct ?? this._restoreFlag("comp-pct");
  },
  // Fat-free and fat mass at the weigh-ins (newest last). Where a weigh-in has
  // no fat value, the fat share is bridged between the nearest known ones (or
  // held before the first / after the last) and applied to the real weight;
  // those points carry real: false.
  _stackSeries(person) {
    const ffm = this._series(person, "fat_free_mass");
    const wt = this._series(person, "weight").slice();
    const row = person.rows[0];
    const rt = Date.parse(row?.timestamp);
    const rw = Number(row?.weight);
    if (row && !Number.isNaN(rt) && !Number.isNaN(rw) && (!wt.length || wt[wt.length - 1].t < rt - 60000)) wt.push({ t: rt, v: rw, synthetic: true });
    const known = [];
    let j = 0;
    for (const p of wt) {
      while (j + 1 < ffm.length && Math.abs(ffm[j + 1].t - p.t) <= Math.abs(ffm[j].t - p.t)) j++;
      if (ffm[j] && Math.abs(ffm[j].t - p.t) < 12 * 3600000 && p.v > 0) {
        const f = 1 - ffm[j].v / p.v;
        if (f >= 0 && f < 1) known.push({ t: p.t, f });
      }
    }
    if (!known.length) return [];
    const realAt = new Set(known.map((k) => k.t));
    const share = (tm) => {
      if (tm <= known[0].t) return known[0].f;
      const last = known[known.length - 1];
      if (tm >= last.t) return last.f;
      for (let i = 1; i < known.length; i++) {
        if (tm <= known[i].t) {
          const a = known[i - 1], b = known[i];
          return a.f + ((b.f - a.f) * (tm - a.t)) / Math.max(b.t - a.t, 1);
        }
      }
      return last.f;
    };
    return wt.map((p) => {
      const f = share(p.t);
      return { t: p.t, ffm: p.v * (1 - f), fat: p.v * f, real: realAt.has(p.t), synthetic: !!p.synthetic };
    });
  },
  // The kilogram stack as SVG: fat-free mass below, fat above, the top edge is the weight.
  _stackSvg(pts, grid, t) {
    const W = Math.max(280, Math.min(900, (this.offsetWidth || 600) - 32));
    const H = (W < 450 ? 170 : 200) + HEAD_H, L = 40, R = 12, T = HEAD_H + 6, B = 22;
    const t0 = pts[0].t, t1 = pts[pts.length - 1].t;
    const x = (tm) => L + ((tm - t0) / Math.max(t1 - t0, 1)) * (W - L - R);
    const hi = Math.max(...pts.map((p) => p.ffm + p.fat));
    const v0 = 0, v1 = hi * 1.04;
    const y = (v) => T + (1 - (v - v0) / (v1 - v0)) * (H - T - B);
    const base = H - B;
    const bottom = pts.map((p) => [x(p.t), y(p.ffm)]);
    const top = pts.map((p) => [x(p.t), y(p.ffm + p.fat)]);
    const dB = smoothPath(bottom), dT = smoothPath(top);
    const rev = smoothPath(bottom.slice().reverse());
    let back = "", axes = "";
    const xTicks = timeTicks(t0, t1);
    if (grid) back += xTicks.map((tm) => `<line x1="${x(tm).toFixed(1)}" x2="${x(tm).toFixed(1)}" y1="${T}" y2="${base}" class="grid dotted"/>`).join("");
    axes += xTicks.map((tm) => `<text x="${x(tm).toFixed(1)}" y="${H - 6}" class="axis" text-anchor="middle">${esc(this._fmtTick(tm, t1 - t0))}</text>`).join("");
    const ticks = niceTicks(v0, v1, H < 180 ? 4 : 5);
    for (const v of ticks) {
      if (grid) back += `<line x1="${L}" x2="${W - R}" y1="${y(v).toFixed(1)}" y2="${y(v).toFixed(1)}" class="grid dotted"/>`;
      axes += `<text x="${L - 6}" y="${(y(v) + 4).toFixed(1)}" class="axis left" text-anchor="end">${this._num(v, ticks.digits)}</text>`;
    }
    const a = pts[0], z = pts[pts.length - 1];
    const layer = (cls) => `<path d="${dB}L${x(z.t).toFixed(1)},${base}L${x(a.t).toFixed(1)},${base}Z" class="stack-ffm ${cls}"/>`
      + `<path d="${dT}${rev.replace(/^M/, "L")}Z" class="stack-fat ${cls}"/>`
      + `<path d="${dB}" class="line left ${cls}"/><path d="${dT}" class="line right ${cls}"/>`;
    // Estimated stretches (no fat value measured) are drawn faded; the solid
    // layer is clipped to the stretches between two measured weigh-ins.
    const runs = [];
    for (let i = 1; i < pts.length; i++) if (pts[i - 1].real && pts[i].real) runs.push([x(pts[i - 1].t), x(pts[i].t)]);
    const faded = pts.some((p) => !p.real);
    const paths = (faded ? `<clipPath id="stkreal">${runs.map(([x0, x1]) => `<rect x="${x0.toFixed(1)}" y="0" width="${Math.max(x1 - x0, 0.5).toFixed(1)}" height="${H}"/>`).join("")}</clipPath>${layer("est")}<g clip-path="url(#stkreal)">${layer("")}</g>` : layer(""))
      + pts.filter((p) => !p.synthetic && p.real && pts.length <= 60).map((p) => `<circle cx="${x(p.t).toFixed(1)}" cy="${y(p.ffm + p.fat).toFixed(1)}" r="2.5" class="dot right"><title>${esc(this._fmtDate(p.t, this._period || "month"))}: ${this._num(p.ffm + p.fat, 2)} kg · ${this._num(p.fat, 1)} kg</title></circle>`).join("")
      + `<circle cx="${x(z.t).toFixed(1)}" cy="${y(z.ffm).toFixed(1)}" r="4" class="last left"/><circle cx="${x(z.t).toFixed(1)}" cy="${y(z.ffm + z.fat).toFixed(1)}" r="4" class="last right"/>`;
    this._scales = {};
    return `<svg viewBox="0 0 ${W} ${H}" class="chart" role="img" aria-label="${esc(t.comp.kg)}"><line x1="${L}" x2="${W - R}" y1="${base}" y2="${base}" class="grid"/>${back}${paths}${axes}</svg>`;
  },
  // The latest reading split in two equal bars: by tissue (fat, muscle and
  // organs, bone) and by substance (water, fat, protein, remainder). The fat
  // section is split into subcutaneous and remaining fat where known. Below, a
  // colour-keyed explanation per value. Null without enough values.
  _compContent(person, t, it) {
    const row = person.rows[0];
    const n = (k) => (row && row[k] != null && row[k] !== "" && !Number.isNaN(Number(row[k])) ? Number(row[k]) : null);
    const w = n("weight"), ffm = n("fat_free_mass");
    if (w == null || ffm == null || w <= 0) return null;
    const c = t.comp, info = it.compInfo;
    const fat = Math.max(w - ffm, 0);
    const bone = n("bone_mass");
    const subPct = n("subcutaneous_fat_percentage");
    const sub = subPct != null && fat > 0 ? Math.min((subPct * w) / 100, fat) : null;
    const wPct = n("body_water_percentage"), pPct = n("protein_percentage");
    const entries = {};
    const note = (key, label, kg, cls, extra = {}) => { if (kg != null && kg > 0 && !entries[key]) entries[key] = { key, label, kg, cls, text: info[key], ...extra }; };
    const seg = (kg, icon, key, label, cls) => {
      if (kg == null || kg <= 0) return "";
      note(key, label, kg, cls);
      const share = (kg / w) * 100;
      const title = `${label}: ${this._num(kg, 1)} kg (${this._num(share, 0)} %)`;
      return `<div class="seg-c ${cls}" style="flex:${kg.toFixed(3)} 1 0" title="${esc(title)}">${share >= 8 ? `<ha-icon icon="${icon}"></ha-icon>` : ""}${share >= 14 ? `<b>${this._num(kg, 1)}</b>` : ""}</div>`;
    };
    // The fat section in two shades (the same in both bars) when the split is known.
    const fatSeg = () => {
      if (fat <= 0) return "";
      note("fat", c.fat, fat, "c-fat");
      if (sub == null) return seg(fat, "body_scale:body-fat", "fat", c.fat, "c-fat");
      const rest = Math.max(fat - sub, 0);
      note("subcut", c.subcut, sub, "c-sub");
      note("restFat", c.restFat, rest, "c-restfat");
      const share = (fat / w) * 100;
      const title = `${c.fat}: ${this._num(fat, 1)} kg (${this._num(share, 0)} %) · ${c.subcut} ${this._num(sub, 1)} kg · ${c.restFat} ${this._num(rest, 1)} kg`;
      return `<div class="seg-c seg-fat" style="flex:${fat.toFixed(3)} 1 0" title="${esc(title)}"><span class="fat-parts"><i class="c-sub" style="flex:${sub.toFixed(3)} 1 0"></i><i class="c-restfat" style="flex:${rest.toFixed(3)} 1 0"></i></span>${share >= 8 ? `<ha-icon icon="body_scale:body-fat"></ha-icon>` : ""}${share >= 14 ? `<b>${this._num(fat, 1)}</b>` : ""}</div>`;
    };
    const rowOf = (label, parts) => `<div class="comp-row"><span class="comp-cap">${esc(label)}</span><div class="comp-bar">${parts.join("")}</div></div>`;
    let html = "";
    if (bone != null) {
      const muscle = Math.max(w - fat - bone, 0);
      html += rowOf(c.tissue, [fatSeg(), seg(muscle, "mdi:arm-flex", "muscle", c.muscle, "c-muscle"), seg(bone, "body_scale:bone-mass", "bone", c.bone, "c-bone")]);
    }
    if (wPct != null && pPct != null) {
      const water = (wPct * w) / 100, prot = (pPct * w) / 100;
      const rest = Math.max(w - water - fat - prot, 0);
      html += rowOf(c.substances, [seg(water, "mdi:water-outline", "water", c.water, "c-water"), fatSeg(), seg(prot, "mdi:hexagon-multiple-outline", "protein", c.protein, "c-protein"), seg(rest, "mdi:dots-horizontal", "rest", c.rest, "c-rest")]);
    }
    if (!html) return null;
    const vis = n("visceral_fat");
    if (vis != null) entries.visceral = { key: "visceral", label: c.visceral, level: this._num(vis, 0), cls: "c-none", text: info.visceral };
    const order = ["fat", "subcut", "restFat", "muscle", "bone", "water", "protein", "rest", "visceral"];
    const list = order.map((k) => entries[k]).filter(Boolean);
    const dl = `<dl class="comp-info">${list.map((e) => `<dt><span class="sw ${e.cls}"></span></dt><dd><b>${esc(e.label)}</b> ${e.level != null ? esc(e.level) : `${this._num(e.kg, 1)} kg`}<span class="muted small"> ${esc(e.text || "")}</span></dd>`).join("")}</dl>`;
    return { fat, ffm, bars: `<div class="comp-bars">${html}</div>${dl}` };
  },
  _chartViews(person) {
    return this._profileOf(person).minor ? ["composition", "percentile", "bmi", "height"] : ["composition", "bmi", "height"];
  },
  _heightHistory(person) {
    // Every height change with its time (the heights table), oldest first.
    return (person.heights || [])
      .map(([at, cm]) => ({ at, t: Date.parse(at), v: Number(cm) }))
      .filter((p) => !Number.isNaN(p.t) && !Number.isNaN(p.v))
      .sort((a, b) => a.t - b.t);
  },
  _heightSeries(person) {
    // The exact entries in the period, held flat to its start and to now.
    const history = this._heightHistory(person);
    if (!history.length) return null;
    const now = Date.now();
    const from = now - PERIODS[this._period || "month"].days * 86400000;
    const before = history.filter((p) => p.t < from).pop();
    const points = history.filter((p) => p.t >= from).map((p) => ({ t: p.t, v: p.v }));
    if (before) points.unshift({ t: from, v: before.v, synthetic: true });
    const last = points[points.length - 1];
    if (last && now - last.t > 60000) points.push({ t: now, v: last.v, synthetic: true });
    return points;
  },
  _chartSeries(person, metric) {
    if (metric === "height") return this._heightSeries(person) || this._series(person, metric);
    if (metric !== "fat_mass") return this._series(person, metric);
    // Fat in kg = weight - fat-free mass, paired with the nearest point
    // of the same day (statistics periods line up; table rows are equal).
    const ffm = this._series(person, "fat_free_mass");
    const out = [];
    let j = 0;
    for (const p of this._series(person, "weight")) {
      while (j + 1 < ffm.length && Math.abs(ffm[j + 1].t - p.t) <= Math.abs(ffm[j].t - p.t)) j++;
      if (ffm[j] && Math.abs(ffm[j].t - p.t) < 12 * 3600000) out.push({ t: p.t, v: p.v - ffm[j].v });
    }
    return out;
  },
  _curveMode(person, key) {
    // "ref" (settings), "other" (the other reference) or "off"; per device.
    let mode = this._curves;
    if (!mode) {
      try {
        mode = window.localStorage.getItem("body-scale-card:curves-mode");
      } catch (e) {
        mode = null;
      }
      if (!mode) mode = this._restoreFlagOff("curves") ? "off" : "ref";
    }
    if (mode === "other" && !this._references(person, key).hasOther) mode = "ref";
    return ["ref", "other", "off"].includes(mode) ? mode : "ref";
  },
  // Elements of the graph that come and go with the percentile switch carry
  // data-fx: before a re-render their drawing is kept, afterwards new ones fade
  // in, removed ones fade out and paths that remain morph to their new shape.
  _fxCapture() {
    const svg = this.shadowRoot.querySelector("svg.chart");
    return svg ? [...svg.querySelectorAll("[data-fx]")].map((el) => ({ k: el.dataset.fx, d: el.getAttribute("d"), html: el.outerHTML, clip: !!el.closest("[clip-path]") })) : [];
  },
  _fxRun(prev) {
    const svg = this.shadowRoot.querySelector("svg.chart");
    if (!svg || !Element.prototype.animate || window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return;
    const canMorph = !!window.CSS?.supports?.("d", "path('M0 0L1 1')");
    const opt = { duration: 350, easing: "ease-in-out" };
    const old = new Map(prev.map((p) => [p.k, p]));
    const now = new Set();
    svg.querySelectorAll("[data-fx]").forEach((el) => {
      const k = el.dataset.fx;
      now.add(k);
      const was = old.get(k);
      const d = el.getAttribute("d");
      if (!was) el.animate([{ opacity: 0 }, { opacity: 1 }], opt);
      else if (d && was.d && was.d !== d) {
        if (canMorph) el.animate([{ d: `path("${was.d}")` }, { d: `path("${d}")` }], opt);
        else el.animate([{ opacity: 0.2 }, { opacity: 1 }], opt);
      }
    });
    for (const p of prev) {
      if (now.has(p.k)) continue;
      const wrap = p.clip ? `<g clip-path="url(#plotclip)">${p.html}</g>` : p.html;
      svg.insertAdjacentHTML("beforeend", wrap);
      const ghost = svg.lastElementChild;
      const a = ghost.animate([{ opacity: 1 }, { opacity: 0 }], opt);
      a.onfinish = () => ghost.remove();
    }
  },
  _curveState(person, view) {
    // Children: which reference (who / kh) and whether its curves or guide
    // lines show, per view and device; the percentile line keeps the
    // reference when they are off.
    const key = CHART_VIEWS[view]?.bands || "bmi_percentile";
    const refs = this._references(person, key);
    this._curveStates = this._curveStates || {};
    let state = this._curveStates[view];
    if (!state) {
      try {
        state = JSON.parse(window.localStorage.getItem(`body-scale-card:curves2:${view}`) || "null");
      } catch (e) {
        state = null;
      }
      if (!state || typeof state !== "object") state = { ref: refs.chosen, on: false };
    }
    const has = (ref) => (CHART_VIEWS[view]?.bands ? !!this._bands(person, key, ref === refs.chosen ? "ref" : "other") : this._refAvailable(person, ref));
    // Without the curves shown the preset reference applies, whatever was chosen before.
    const ref = state.on === true && refs.compare && ["who", "kh"].includes(state.ref) && has(state.ref) ? state.ref : refs.chosen;
    return { ref, on: state.on === true, has, refs };
  },
  _bands(person, key, mode = "ref") {
    // P3-P97 curves of a reference over the whole reference range, on the time axis.
    // Children only; adults have no percentile curves.
    if (!this._profileOf(person).minor) return null;
    const ctx = this._growthCtx(person);
    const ref = mode === "other" ? ctx.other : ctx.chosen;
    const kind = key === "height_percentile" ? "height" : "bmi";
    const born = Date.parse(ctx.born || "");
    if (Number.isNaN(born)) return null;
    this._bandCache = this._bandCache || new Map();
    const id = `${ref}|${kind}|${ctx.sex}|${ctx.born}|${GROWTH[ref] ? 1 : 0}`;
    if (!this._bandCache.has(id)) {
      const rows = growthCurves(ref, kind, ctx.sex, 0, 228, 1);
      this._bandCache.set(id, rows.length ? rows.map(([months, ...values]) => ({ t: born + months * 30.4375 * 86400000, values })) : null);
    }
    return this._bandCache.get(id);
  },
  _gridOn() {
    if (this._config.grid === false) return false;
    return this._grid ?? !this._restoreFlagOff("grid");
  },
  _renderChart(person, t) {
    const views = this._chartViews(person);
    const view = views.includes(this._chartView) ? this._chartView : views[0];
    const compView = view === "composition";
    const pctMode = compView && this._compPctOn();
    const stack = compView && !pctMode;
    const spec = CHART_VIEWS[pctMode ? "fat" : view];
    const period = this._period || "month";
    for (const m of spec.load) this._loadStats(person, m);
    if (period !== "year") this._loadStatsFor(person, "weight", "year");
    const grid = this._gridOn();
    const minor = this._profileOf(person).minor;
    const kid = minor && (spec.bands || view === "percentile") ? this._curveState(person, view) : null;
    // The percentile line after the reference picked on the buttons.
    const lineOther = !!kid && kid.ref !== kid.refs.chosen;
    const lines = [spec.left, spec.right]
      .map((metric, i) => metric && ({ metric, side: i ? "right" : "left",
        points: (kid && metric.endsWith("_percentile") && this._refSeries(person, metric, kid.ref).length ? this._refSeries(person, metric, kid.ref) : null) || this._chartSeries(person, metric) }))
      // e.g. no height percentile for adults
      .filter((l) => l && (l.side === "left" || (l.metric.endsWith("_percentile") ? this._profileOf(person).minor : this._hasMetric(person, l.metric))));
    // A line that starts later than another (no value measured before) is held
    // at its first known value back to the common start, drawn faded.
    const withPts = lines.filter((l) => l.points.length && l.metric !== "height");
    if (withPts.length && lines.length > 1) {
      const start = Math.min(...lines.filter((l) => l.points.length).map((l) => l.points[0].t));
      for (const l of withPts) {
        if (l.points[0].t > start + 36 * 3600000) {
          l.estUntil = l.points[0].t;
          l.points = [{ t: start, v: l.points[0].v, synthetic: true }, ...l.points];
        }
      }
    }
    // Both lines run to the same end with today's value (statistics only hold
    // whole days, the height history is held to now), and the height starts
    // where its percentile does: the profile had it before the first change.
    const current = (metric) => {
      if (metric.endsWith("_percentile")) {
        const v = this._pctNow(person, metric, kid ? kid.ref : this._profileOf(person).reference);
        if (v != null) return v;
      } else if (metric === "height") {
        const hh = this._heightHistory(person);
        if (hh.length) return hh[hh.length - 1].v;
      }
      const row = person.rows[0];
      if (metric === "fat_mass") return row && row.fat_free_mass != null && row.weight != null ? Number(row.weight) - Number(row.fat_free_mass) : null;
      const v = row ? Number(row[metric]) : NaN;
      return row && row[metric] != null && row[metric] !== "" && !Number.isNaN(v) ? v : null;
    };
    const lastReading = Date.parse(person.rows[0]?.timestamp) || 0;
    const endT = Math.max(lastReading, ...lines.filter((l) => l.points.length).map((l) => l.points[l.points.length - 1].t));
    for (const l of lines) {
      const pts = l.points = l.points.slice();
      const v = current(l.metric);
      if (pts.length && v != null && pts[pts.length - 1].t < endT - 60000) pts.push({ t: endT, v, synthetic: true });
    }
    const [hl, pl] = lines;
    if (hl?.metric === "height" && pl?.points.length && hl.points.length && pl.points[0].t < hl.points[0].t) {
      hl.points.unshift({ t: pl.points[0].t, v: hl.points[0].v, synthetic: true });
    }
    // Curves exist for this child; drawn unless switched off on the legend tile.
    // A tap on the curves tile goes: reference from the settings → the other one → off.
    const curveMode = kid ? (kid.on ? (lineOther && spec.bands ? "other" : "ref") : "off")
      : spec.bands || view === "bmi" ? this._curveMode(person, spec.bands || "bmi_percentile") : "off";
    const curvesOn = curveMode !== "off";
    const curveRows = spec.bands && this._config.curves !== false ? this._bands(person, spec.bands, curveMode === "other" ? "other" : "ref") : null;
    const bandRows = curvesOn ? curveRows : null;
    // Adults: the fixed WHO ranges instead of curves, switched on the same tile.
    const adultZones = view === "bmi" && !this._profileOf(person).minor && this._config.curves !== false;
    const zonesOn = adultZones;
    // Weight + BMI percentile: guide lines P3–P97 across a 0–100 scale. A
    // percentile is already relative to age, so they hold over all the time.
    const guides = view === "percentile" && this._config.curves !== false;
    const guidesOn = guides && curvesOn;
    // With curves the percentile line would repeat them on another scale: legend only.
    const drawn = lines.filter((l) => l.points.length >= 2 && !(spec.bands && l.side === "right") && !(view === "percentile" && kid && !curvesOn && l.side === "right"));
    // Draw at the real width so labels keep their size on a phone.
    const W = Math.max(280, Math.min(900, (this.offsetWidth || 600) - 32));
    const chartH = W < 450 ? 170 : 200;
    let svg, stackPts = null;
    if (stack) stackPts = this._stackSeries(person);
    if (stack && stackPts.length >= 2) {
      svg = this._stackSvg(stackPts, grid, t);
    } else if (!drawn.length) {
      const filtered = this._effFilter(person);
      svg = `<div class="muted chart-empty" style="height:${chartH + HEAD_H}px">${esc(filtered.clothed !== "any" || filtered.impedance !== "any" ? t.filterEmpty : t.noChart)}</div>`;
    } else {
      const hasRight = drawn.some((l) => l.side === "right") || !!bandRows || zonesOn || !!kid;
      // The top band holds the title and the display toggles (see chart-head).
      const H = chartH + HEAD_H, L = 40, R = zonesOn ? 50 : hasRight ? 40 : 12, T = HEAD_H + 6, B = 22;
      // The time window never depends on what is switched on.
      const all = (kid ? lines.filter((l) => !(spec.bands && l.side === "right") && l.points.length >= 2) : drawn).flatMap((l) => l.points);
      const t0 = Math.min(...all.map((p) => p.t)), t1 = Math.max(...all.map((p) => p.t));
      const x = (tm) => L + ((tm - t0) / Math.max(t1 - t0, 1)) * (W - L - R);
      // Curves inside the window (interpolated at the edges) widen the left scale.
      const winBands = (rows) => {
        if (!rows) return null;
        const at = (tm) => {
          for (let i = 1; i < rows.length; i++) {
            const a = rows[i - 1], b = rows[i];
            if (tm >= a.t && tm <= b.t) {
              const f = (tm - a.t) / Math.max(b.t - a.t, 1);
              return { t: tm, values: a.values.map((v, k) => v + (b.values[k] - v) * f) };
            }
          }
          return null;
        };
        const inside = rows.filter((r) => r.t > t0 && r.t < t1);
        const out = [at(t0), ...inside, at(t1)].filter(Boolean);
        return out.length < 2 ? null : out;
      };
      const bands = winBands(bandRows);
      // The scale always has room for both references' curves (on or off), so
      // nothing moves when they are switched.
      const reserve = kid && spec.bands && this._config.curves !== false
        ? [winBands(this._bands(person, spec.bands, "ref")), winBands(this._bands(person, spec.bands, "other"))].filter(Boolean) : [];
      const scale = (points, metric, extra = []) => {
        const vs = points.map((p) => p.v).concat(extra);
        let v0 = Math.min(...vs), v1 = Math.max(...vs);
        const pad = Math.max((v1 - v0) * 0.08, metric.endsWith("_percentile") ? 5 : metric === "height" ? 1 : 0.5);
        return { v0: v0 - pad, v1: v1 + pad };
      };
      let back = kid ? `<clipPath id="plotclip"><rect x="${L}" y="${T}" width="${W - L - R}" height="${H - T - B}"/></clipPath>` : "", paths = "", axes = "";
      const scales = this._scales = {};
      // Body-fat method switches (from the method sensor's history).
      const switches = spec.load.some((m) => METHOD_METRICS.includes(m)) ? this._methodSwitches(person) : [];
      const marked = new Set();
      const algos = infoText(this._lang).algos;
      const methodName = (m) => [algos[m.startsWith("alternative") ? "alternative" : "standard"][0], m.endsWith("_athlete") && algos.athlete[0]].filter(Boolean).join(" + ");
      const methodNo = (m) => `${m.startsWith("alternative") ? 2 : 1}${m.endsWith("_athlete") ? "+" : ""}`;
      // Vertical grid at month or year starts, with dates on the axis.
      const xTicks = timeTicks(t0, t1);
      if (grid) {
        back += xTicks.map((tm) => `<line x1="${x(tm).toFixed(1)}" x2="${x(tm).toFixed(1)}" y1="${T}" y2="${H - B}" class="grid dotted"/>`).join("");
      }
      axes += xTicks.map((tm) => `<text x="${x(tm).toFixed(1)}" y="${H - 6}" class="axis" text-anchor="middle">${esc(this._fmtTick(tm, t1 - t0))}</text>`).join("");
      for (const line of drawn) {
        const extra = line.side === "left" ? reserve.flatMap((r) => r.flatMap((b) => [b.values[0], b.values[4]])) : [];
        if (line.side === "left" && zonesOn) {
          // Widen to the next range limit below and above, so the own range is always framed.
          const vs = line.points.map((p) => p.v);
          const lo = Math.min(...vs), hi = Math.max(...vs);
          const below = [18.5, 25, 30].filter((b) => b <= lo).pop(), above = [18.5, 25, 30].find((b) => b >= hi);
          if (below != null) extra.push(below - 0.5);
          if (above != null) extra.push(above + 0.5);
        }
        const sc = guidesOn && line.side === "right" ? { v0: 0, v1: 100 } : scale(line.points, line.metric, extra);
        const y = (v) => T + (1 - (v - sc.v0) / (sc.v1 - sc.v0)) * (H - T - B);
        scales[line.side] = { key: `${person.id}|${view}`, v0: sc.v0, v1: sc.v1, top: T, h: H - T - B };
        const cls = line.side;
        if (guidesOn && line.side === "right") {
          for (const p of CURVE_LABELS) {
            back += `<line data-fx="g-${p}" x1="${L}" x2="${W - R}" y1="${y(p).toFixed(1)}" y2="${y(p).toFixed(1)}" class="guide ${p === 50 ? "mid" : ""}"/>`;
          }
          // Labels keep 10 px apart from the bottom up.
          let prev = Infinity;
          for (const p of CURVE_LABELS) {
            prev = Math.min(y(p) + 4, prev - 10);
            axes += `<text data-fx="gl-${p}" x="${W - R + 6}" y="${prev.toFixed(1)}" class="axis right">P${p}</text>`;
          }
        }
        if (line.side === "left" && bands) {
          // The five reference curves, dotted; labels on the right.
          const edge = (k) => bands.map((b) => `${x(b.t).toFixed(1)},${y(b.values[k]).toFixed(1)}`);
          // The child's own scale stays as it is: curves outside it are cut off.
          back += `<g clip-path="url(#plotclip)">${[0, 1, 2, 3, 4].map((k) => `<path data-fx="band-${k}" d="M${edge(k).join("L")}" class="${k === 2 ? "band-median" : "band-line"}"/>`).join("")}</g>`;
          const last = bands[bands.length - 1];
          // Labels only for curves inside the plot, 10 px apart from the bottom up.
          let prev = Infinity;
          const ys = last.values.map((v) => { prev = Math.min(y(v) + 3, prev - 10); return [prev, y(v) >= T && y(v) <= H - B]; });
          axes += CURVE_LABELS.map((p, k) => (ys[k][1] ? `<text data-fx="bl-${k}" x="${W - R + 4}" y="${ys[k][0].toFixed(1)}" class="axis band-label">P${p}</text>` : "")).join("");
        }
        const d = smoothPath(line.points.map((p) => [x(p.t), y(p.v)]));
        if (line.side === "left" && zonesOn) {
          // Under 18.5, normal to 25, over to 30, obese: only where visible.
          const zones = [[-Infinity, 18.5, "zone-low"], [18.5, 25, "zone-ok"], [25, 30, "zone-high"], [30, Infinity, "zone-veryhigh"]];
          zones.forEach(([lo, hi, cls], k) => {
            const top = y(Math.min(hi, sc.v1)), bottom = y(Math.max(lo, sc.v0));
            if (bottom - top <= 0) return;
            back += `<rect x="${L}" y="${top.toFixed(1)}" width="${W - L - R}" height="${(bottom - top).toFixed(1)}" class="${cls}"/>`;
            if (bottom - top >= 14) {
              axes += `<text x="${W - R + 4}" y="${((top + bottom) / 2 + 4).toFixed(1)}" class="axis band-label">${esc(t.zoneShort[k])}</text>`;
            }
          });
          for (const v of [18.5, 25, 30]) {
            if (v > sc.v0 && v < sc.v1) back += `<line x1="${L}" x2="${W - R}" y1="${y(v).toFixed(1)}" y2="${y(v).toFixed(1)}" class="band-median"/>`;
          }
        }
        if (line.side === "left" && !bands && !zonesOn) {
          paths += `<path d="${d}L${x(line.points[line.points.length - 1].t).toFixed(1)},${H - B}L${x(line.points[0].t).toFixed(1)},${H - B}Z" class="area"/>`;
        }
        // Values from an earlier body-fat method faded, up to the switch.
        const cuts = METHOD_METRICS.includes(line.metric)
          ? switches.filter((sw) => sw.t > line.points[0].t && sw.t <= line.points[line.points.length - 1].t) : [];
        if (cuts.length) {
          const sw = cuts[cuts.length - 1];
          const real = line.points.filter((p) => !p.synthetic || p === line.points[line.points.length - 1]);
          const before = real.filter((p) => p.t < sw.t).pop(), after = real.find((p) => p.t >= sw.t);
          // Daily means mix both methods on the day of the switch: the cut
          // lies between the last old and the first new point.
          const xs = before && after ? Math.min(Math.max(x(sw.t), x(before.t) + 0.6 * (x(after.t) - x(before.t))), x(after.t)) : x(sw.t);
          const id = `cut-${cls}`;
          paths += `<clipPath id="${id}-a"><rect x="0" y="0" width="${xs.toFixed(1)}" height="${H}"/></clipPath><clipPath id="${id}-b"><rect x="${xs.toFixed(1)}" y="0" width="${W}" height="${H}"/></clipPath>`;
          paths += `<path d="${d}" class="line ${cls} old" clip-path="url(#${id}-a)"/><path d="${d}" class="line ${cls}" clip-path="url(#${id}-b)"/>`;
          for (const c of cuts) {
            if (marked.has(c.t)) continue;
            marked.add(c.t);
            const cx = c === sw ? xs : x(c.t);
            const label = `${t.chartLabels.body_fat_percentage}: ${methodName(c.from)} → ${methodName(c.to)}`;
            const tx = Math.min(Math.max(cx - 17, L + 2), W - R - 36);
            back += `<line x1="${cx.toFixed(1)}" x2="${cx.toFixed(1)}" y1="${T}" y2="${H - B}" class="method-switch"/>`;
            axes += `<g class="method-tag" transform="translate(${tx.toFixed(1)},${T + 2})"><title>${esc(label)}</title><rect width="34" height="15" rx="4"/><text x="17" y="11" text-anchor="middle">${methodNo(c.from)}→${methodNo(c.to)}</text></g>`;
          }
        } else if (line.estUntil) {
          const xe = x(line.estUntil).toFixed(1), id = `est-${cls}`;
          paths += `<clipPath id="${id}-a"><rect x="0" y="0" width="${xe}" height="${H}"/></clipPath><clipPath id="${id}-b"><rect x="${xe}" y="0" width="${W}" height="${H}"/></clipPath>`;
          paths += `<path d="${d}" class="line ${cls} est" clip-path="url(#${id}-a)"/><path d="${d}" class="line ${cls}" clip-path="url(#${id}-b)"/>`;
        } else {
          paths += `<path ${kid && line.side === "right" ? 'data-fx="right-line" ' : ""}d="${d}" class="line ${cls}"/>`;
        }
        if (line.points.length <= 60) {
          paths += line.points.filter((p) => !p.synthetic).map((p) => `<circle ${kid && line.side === "right" ? `data-fx="right-dot-${Math.round(p.t)}" ` : ""}cx="${x(p.t).toFixed(1)}" cy="${y(p.v).toFixed(1)}" r="2.5" class="dot ${cls}"><title>${esc(this._fmtDate(p.t, period))}: ${this._num(p.v, metricDigits(line.metric))}</title></circle>`).join("");
        }
        const last = line.points[line.points.length - 1];
        paths += `<circle ${kid && line.side === "right" ? 'data-fx="right-last" ' : ""}cx="${x(last.t).toFixed(1)}" cy="${y(last.v).toFixed(1)}" r="4" class="last ${cls}"/>`;
        // Round values on the axis; dotted lines across for the left one.
        const ax = line.side === "left" ? L - 6 : W - R + 6;
        const anchor = line.side === "left" ? "end" : "start";
        const ticks = guidesOn && line.side === "right" ? [] : niceTicks(sc.v0, sc.v1, H < 180 ? 4 : 5);
        for (const v of ticks) {
          if (line.side === "left" && grid) back += `<line x1="${L}" x2="${W - R}" y1="${y(v).toFixed(1)}" y2="${y(v).toFixed(1)}" class="grid dotted"/>`;
          axes += `<text x="${ax}" y="${(y(v) + 4).toFixed(1)}" class="axis ${cls}" text-anchor="${anchor}">${this._num(v, ticks.digits)}</text>`;
        }
      }
      svg = `<svg viewBox="0 0 ${W} ${H}" class="chart" role="img" aria-label="${esc(t.chartViews[view])}">
          <line x1="${L}" x2="${W - R}" y1="${H - B}" y2="${H - B}" class="grid"/>${back}${paths}${axes}
        </svg>`;
    }
    // One entry per series in the chart head: colour mark, label, latest value.
    const lastStack = stackPts && stackPts[stackPts.length - 1];
    const stackLegend = lastStack ? `<span class="legend left"><span class="swatch"></span><span class="legend-label">${esc(t.comp.ffm)}</span><span class="legend-value">${this._num(lastStack.ffm, 1)} kg</span></span>`
      + `<span class="legend right"><span class="swatch"></span><span class="legend-label">${esc(t.comp.fat)}</span><span class="legend-value">${this._num(lastStack.fat, 1)} kg</span></span>` : "";
    const legend = stackLegend || lines.map((l) => {
      let last = l.points[l.points.length - 1];
      // Current values come from the latest reading or the sensors, not from
      // daily statistics, so they match the summary and the value tiles.
      const row = person.rows[0];
      if (row && row[l.metric] != null && row[l.metric] !== "" && !Number.isNaN(Number(row[l.metric]))) last = { v: Number(row[l.metric]) };
      if (l.metric.endsWith("_percentile")) {
        // After the reference shown (the other one's value with its curves).
        const v = this._pctNow(person, l.metric, kid ? kid.ref : this._profileOf(person).reference);
        if (v != null) last = { v };
      } else if (l.metric === "height") {
        const hh = this._heightHistory(person);
        if (hh.length) last = { v: hh[hh.length - 1].v };
      }
      let value = "–";
      if (last) {
        const n = this._num(last.v, metricDigits(l.metric));
        value = l.metric === "height" ? this._cm(last.v)
          : CHART_UNITS[l.metric] === "P" ? `P${n}` : CHART_UNITS[l.metric] ? `${n} ${CHART_UNITS[l.metric]}` : n;
      }
      // Not drawn (shown by the curves instead): value without a colour mark.
      const mark = `<span class="swatch ${drawn.includes(l) ? "" : "ghost"}"></span>`;
      // Which reference the percentile follows: short, in the same line (tooltip: full name, sex).
      let refMark = "";
      if (l.metric.endsWith("_percentile")) {
        const ref = kid ? kid.ref : this._profileOf(person).reference;
        const sx = this._profileOf(person).sex;
        const full = `${ref === "kh" ? "Kromeyer-Hauschild" : "WHO"}${sx && t.bandsFor[sx] ? ` · ${t.bandsFor[sx]}` : ""}`;
        refMark = `<span class="legend-ref" title="${esc(full)}">${ref === "kh" ? "DE" : "WHO"}${sx ? `<ha-icon icon="mdi:gender-${sx === "female" ? "female" : "male"}"></ha-icon>` : ""}</span>`;
      } else if (zonesOn && l.metric === "body_mass_index") {
        refMark = `<span class="legend-ref" title="${esc(t.zonesValue)}">WHO</span>`;
      }
      return `<span class="legend ${l.side}">${mark}<span class="legend-label">${esc(t.chartLabels[l.metric])}</span><span class="legend-value">${esc(value)}</span>${refMark}</span>`;
    }).join("");
    // Fixed places: the same buttons in every view, unavailable ones greyed out.
    const seg = (items) => `<div class="seg">${items.join("")}</div>`;
    const viewSeg = seg(views.map((v) => `<button class="${v === view ? "on" : ""}" data-action="chartview" data-view="${v}"
        title="${esc(t.chartViews[v])}" aria-label="${esc(t.chartViews[v])}" aria-pressed="${v === view}"><ha-icon icon="${VIEW_ICONS[v]}"></ha-icon></button>`));
    const refs = curveRows ? this._references(person, spec.bands) : null;
    const shownRef = refs ? (curveMode === "other" ? refs.other : refs.chosen) : null;
    const canCurves = !!curveRows || adultZones || guides;
    const toggles = [];
    if (compView) {
      toggles.push(`<button class="ref-key ${pctMode ? "on" : ""}" data-action="comppct" title="${esc(pctMode ? t.comp.kg : t.comp.pct)}" aria-label="${esc(pctMode ? t.comp.kg : t.comp.pct)}" aria-pressed="${pctMode}">%</button>`);
    }
    if (this._config.grid !== false) {
      toggles.push(`<button class="${grid ? "on" : ""}" data-action="grid" title="${esc(t.grid)}" aria-label="${esc(t.grid)}" aria-pressed="${grid}"><ha-icon icon="mdi:grid"></ha-icon></button>`);
    }
    if (this._config.curves !== false && kid) {
      // Two buttons: a tap picks the reference, a second tap hides its curves.
      // Without comparing (settings) only the chosen reference: one button.
      for (const ref of kid.refs.compare ? ["who", "kh"] : [kid.refs.chosen]) {
        const on = kid.on && kid.ref === ref, can = kid.has(ref);
        const label = `${ref === "kh" ? "Kromeyer-Hauschild" : "WHO"}: ${t.curvesToggle}`;
        toggles.push(`<button class="ref-key ${on ? "on" : ""}" data-action="curves" data-ref="${ref}" title="${esc(label)}" aria-label="${esc(label)}"
            aria-pressed="${on}" ${can ? "" : "disabled"}>${ref === "kh" ? "DE" : "WHO"}</button>`);
      }
    } else if (this._config.curves !== false && canCurves && !adultZones) {
      const badge = curvesOn && shownRef ? `<span class="badge">${shownRef === "kh" ? "DE" : "WHO"}</span>` : "";
      toggles.push(`<button class="${canCurves && curvesOn ? "on" : ""}" data-action="curves" title="${esc(t.curvesToggle)}" aria-label="${esc(t.curvesToggle)}"
          aria-pressed="${canCurves && curvesOn}" ${canCurves ? "" : "disabled"}><ha-icon icon="mdi:chart-bell-curve"></ha-icon>${badge}</button>`);
    }
    const periodSeg = seg(Object.keys(PERIODS).map((p) => `<button class="${p === period ? "on" : ""}" data-action="period" data-period="${p}"
        title="${esc(t.periods[p])}" aria-label="${esc(t.periods[p])}" aria-pressed="${p === period}">${calendar(PERIOD_MARKS[p])}</button>`));
    // Title: the series with their latest values, and which reference the curves or ranges follow.
    const sex = this._profileOf(person).sex;
    const sub = "";
    const title = `<span class="chart-title" aria-label="${esc(t.chartViews[view])}">${legend}${sub ? `<span class="ct-sub muted">${esc(sub)}</span>` : ""}</span>`;
    // One bar for what is shown (view, period); title and display toggles
    // (grid, curves) sit inside the graph, they only change how it looks.
    // Filters: which entries count (clothes, impedance). Without one the line is the
    // long-term statistics; with one only the stored single entries.
    const fl = this._filterNow(), scope = this._filterScope(person), eff = this._effFilter(person);
    const flBtn = (kind, icons, titles) => `<button class="${fl[kind] !== "any" ? "on" : ""}" data-action="filter" data-kind="${kind}" title="${esc(titles[fl[kind]])}" aria-label="${esc(titles[fl[kind]])}" aria-pressed="${fl[kind] !== "any"}"><ha-icon icon="${icons[fl[kind]]}"></ha-icon>${fl[kind] === "any" ? "" : `<span class="badge">${fl[kind] === "yes" || fl[kind] === "with" ? "✓" : "✕"}</span>`}</button>`;
    const filterBtns = (scope.clothed ? flBtn("clothed", { any: "mdi:tshirt-crew-outline", yes: "mdi:tshirt-crew", no: "mdi:tshirt-crew-outline" }, t.filterClothed) : "")
      + (scope.impedance ? flBtn("impedance", { any: "mdi:flash-outline", with: "mdi:flash", without: "mdi:flash-off-outline" }, t.filterImpedance) : "");
    const filterSeg = filterBtns && this._can("series") && this._can("entries") ? `<div class="seg toggles">${filterBtns}</div>` : "";
    let hint = "";
    if (eff.clothed !== "any" || eff.impedance !== "any") {
      const from = spec.load.map((m) => this._stats?.[`${person.id}|${m}|${period}|${this._filterKey(person)}`]?.entriesFrom).find(Boolean);
      hint = `<div class="muted small chart-hint">${esc(from ? t.filterHint(new Date(from).toLocaleDateString(this._lang)) : t.filterNone)}</div>`;
    }
    // Children: percentiles and curves need the growth data; offer them once per user.
    if (this._profileOf(person).minor && this._config.curves !== false) {
      for (const r of this._growthCtx(person).compare ? ["who", "kh"] : [this._growthCtx(person).chosen]) {
        if (growthStatus(r) === "ready") {
          hint += `<div class="muted small chart-hint growth-hint">${esc(t.growthHint(r === "kh" ? "Kromeyer-Hauschild" : "WHO", GROWTH_LICENSE[r]))}
            <button class="link-btn" data-action="growthon" data-ref="${r}">${esc(t.growthEnable)}</button></div>`;
        }
      }
    }
    return `<div class="chart-box"><div class="chart-controls">${viewSeg}<span class="spacer"></span>${filterSeg}${periodSeg}</div>
      <div class="chart-area"><div class="chart-head">${title}${toggles.length ? `<span class="chart-toggles">${toggles.join("")}</span>` : ""}</div>${svg}</div>${hint}</div>`;
  },
});
