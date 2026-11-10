/*
 * Module card-legend: legends and "How the scale works"
 *
 * The collapsible explanation sections: scale symbols, chart and table legend,
 * "How the scale works" with the flow diagram, and the scale info.
 */

mixin(BodyScaleCard, {
  // The explanation of how the scale calculates is the same for everyone:
  // it sits with the scale, not with each person.
  _renderScaleInfo(t) {
    const it = infoText(this._lang);
    const open = this._infoOpen ?? this._restoreFlag("info");
    const head = `<button class="info-toggle" data-action="info" aria-expanded="${open ? "true" : "false"}">
        <ha-icon icon="mdi:information-outline"></ha-icon><span>${esc(it.howTitle)}</span><span class="spacer"></span>
        <ha-icon icon="${open ? "mdi:chevron-up" : "mdi:chevron-down"}"></ha-icon></button>`;
    if (!open) return `<div class="info">${head}</div>`;
    let html = `<div class="info">${head}<div class="info-body">`;
    html += `<div class="explain">${it.how.map((p) => `<p>${p}</p>`).join("")}</div>`;
    html += `<div class="explain"><h3>${esc(it.algoTitle)}</h3><dl class="algos">${["standard", "alternative", "athlete"]
      .map((k) => `<dt>${esc(it.algos[k][0])}</dt><dd>${esc(it.algos[k][1])}</dd>`)
      .join("")}</dl><p class="muted small">${esc(it.setHint)}</p></div>`;
    html += `<div class="note"><ha-icon icon="mdi:clock-outline"></ha-icon><span><b>${esc(it.tipsTitle)}:</b> ${esc(it.tips)}</span></div>`;
    html += `<p class="muted small disclaimer">${esc(it.disclaimer)}</p></div></div>`;
    return html;
  },
  // Legend of the display symbols, right below the scale.
  _renderLegend(t) {
    if (!t.legend) return "";
    const open = !!this._legendOpen;
    const ic = (i) => `<ha-icon icon="${i}"></ha-icon>`;
    const sym = {
      hist: "<b>1 2 3</b>", ohm: "Ω kg", arrow: "▲▼▬", bmi: ic("body_scale:bmi"), fat: ic("body_scale:body-fat"),
      shoe: ic("mdi:shoe-sneaker"), sync: ic("mdi:sync"), lift: ic("mdi:weight-lifter"), m1: methodMark(1), m2: methodMark(2),
      nosave: ic("mdi:content-save-off-outline"), guest: ic("mdi:account-question-outline"), auto: ic("mdi:account-search-outline"), baby: ic("mdi:baby-face-outline") + ic("mdi:paw"),
      dim: `<svg class="ck" viewBox="0 0 30 12" aria-hidden="true"><rect x="1" y="1" width="28" height="10" rx="4" class="ck-k dim"/></svg>`,
      lit: `<svg class="ck" viewBox="0 0 30 12" aria-hidden="true"><rect x="1" y="1" width="28" height="10" rx="4" class="ck-k lit"/></svg>`,
      frame: `<svg class="ck" viewBox="0 0 30 12" aria-hidden="true"><rect x="1.5" y="1.5" width="11" height="9" rx="4" class="ck-k lit thick"/><rect x="17.5" y="1.5" width="11" height="9" rx="4" class="ck-k thin"/></svg>`,
      ring: `<svg class="ck" viewBox="0 0 30 12" aria-hidden="true"><rect x="1" y="1" width="28" height="10" rx="4" class="ck-k dim"/><rect x="1" y="1" width="28" height="10" rx="4" pathLength="100" class="ck-k lit part"/></svg>`,
      fade: `<svg class="ck" viewBox="0 0 30 12" aria-hidden="true"><rect x="1" y="1" width="12" height="10" rx="4" class="ck-k lit"/><rect x="17" y="1" width="12" height="10" rx="4" class="ck-k lit half"/></svg>`,
      blink: `<svg class="ck" viewBox="0 0 30 12" aria-hidden="true"><rect x="1" y="1" width="12" height="10" rx="4" class="ck-k lit"/><rect x="17" y="1" width="12" height="10" rx="4" class="ck-k dim"/></svg>`,
    };
    const head = `<button class="info-toggle" data-action="legend" aria-expanded="${open}">
        <ha-icon icon="mdi:shape-outline"></ha-icon><span>${esc(t.legendTitle)}</span><span class="spacer"></span>
        <ha-icon icon="${open ? "mdi:chevron-up" : "mdi:chevron-down"}"></ha-icon></button>`;
    // Inverted displays (invert_modes / invert_history): the legend shows what is switched on.
    const invM = this._config.invert_modes === true, invH = this._config.invert_history === true;
    const gi = ic("mdi:account-question-outline");
    if (invM) {
      sym.dim = `<span class="lg-m set">${gi}</span>`;
      sym.lit = `<span class="lg-m on">${gi}</span>`;
    }
    if (invH) sym.hist = `<b>1 <span class="lg-h">2</span> 3</b>`;
    const legendText = (k, text) => ((invM && (k === "dim" || k === "lit")) || (invH && k === "hist")) && t.legendInv?.[k] ? t.legendInv[k] : text;
    const scale = open
      ? `<div class="info scale-legend">${head}<div class="info-body"><dl class="legend-list">${t.legend.map(([k, text]) => `<dt>${sym[k] || ""}</dt><dd>${esc(legendText(k, text))}</dd>`).join("")}</dl></div></div>`
      : `<div class="info scale-legend">${head}</div>`;
    return scale;
  },
  // Legend of the chart and table, below them (not with the scale symbols).
  _renderChartLegend(t) {
    if (!(t.chartLegend || []).length) return "";
    const chartOpen = !!this._chartLegendOpen;
    const svg = (inner) => `<svg class="ck" viewBox="0 0 30 12" aria-hidden="true">${inner}</svg>`;
    const ico = (n) => `<ha-icon icon="${n}"></ha-icon>`;
    const keys = {
      views: ico(VIEW_ICONS.composition) + ico(VIEW_ICONS.bmi) + ico(VIEW_ICONS.height) + ico(VIEW_ICONS.percentile),
      comppct: `<span class="ck-tag">%</span>`,
      periods: `<span class="ck-tag">30</span><span class="ck-tag">365</span><span class="ck-tag">Σ</span>`,
      fc: ico("mdi:tshirt-crew-outline") + ico("mdi:tshirt-crew"),
      fi: ico("mdi:flash-outline") + ico("mdi:flash") + ico("mdi:flash-off-outline"),
      fnote: `<span class="ck-tag">✓ ✕</span>`,
      grid: ico("mdi:grid"),
      curves: ico("mdi:chart-bell-curve") + `<span class="ck-tag">WHO</span><span class="ck-tag">DE</span>`,
      tshirt: ico("mdi:tshirt-crew") + ico("mdi:tshirt-crew-outline"),
      move: ico("mdi:account-switch-outline"),
      delete: ico("mdi:delete-outline"),
      hight: ico("mdi:pencil-outline") + ico("mdi:plus"),
      est: svg('<path d="M1 9 L29 4" class="ck-line ck-est"/>'),
      old: svg('<path d="M1 9 L29 4" class="ck-line ck-old"/>'),
      switch: `<span class="ck-tag">1→2</span>`,
      pct: svg('<path d="M1 6 L29 6" class="ck-pct"/>'),
    };
    const chartHead = `<button class="info-toggle" data-action="clegend" aria-expanded="${chartOpen}">
        <ha-icon icon="mdi:chart-line-variant"></ha-icon><span>${esc(t.chartLegendTitle)}</span><span class="spacer"></span>
        <ha-icon icon="${chartOpen ? "mdi:chevron-up" : "mdi:chevron-down"}"></ha-icon></button>`;
    return chartOpen
      ? `<div class="info scale-legend chart-legend">${chartHead}<div class="info-body"><dl class="legend-list chart-keys">${t.chartLegend.map(([k, text]) => (k === "_" ? `<dt></dt><dd class="lg-head"><b>${esc(text)}</b></dd>` : `<dt>${keys[k] || ""}</dt><dd>${esc(text)}</dd>`)).join("")}</dl></div></div>`
      : `<div class="info scale-legend chart-legend">${chartHead}</div>`;
  },
  // How the scale works: bullet points with the scale's own symbols and a flow chart.
  _renderHow(t) {
    if (!t.how) return "";
    const open = !!this._howOpen;
    const ic = (i) => `<ha-icon icon="${i}"></ha-icon>`;
    const sym = {
      auto: ic("mdi:account-search-outline"), tap: ic("mdi:gesture-tap"), done: ic("mdi:check-bold"), open: ic("mdi:help-circle-outline"),
      guest: ic("mdi:account-question-outline"), baby: ic("mdi:baby-face-outline") + ic("mdi:paw"), sync: ic("mdi:sync"),
      timer: ic("mdi:clock-outline"), hist: "<b>1 2 3</b>", fat: ic("body_scale:body-fat"), bmi: ic("body_scale:bmi"), pending: ic("mdi:scale-unbalanced"),
    };
    const head = `<button class="info-toggle" data-action="how" aria-expanded="${open}">
        <ha-icon icon="mdi:graph-outline"></ha-icon><span>${esc(t.howTitle)}</span><span class="spacer"></span>
        <ha-icon icon="${open ? "mdi:chevron-up" : "mdi:chevron-down"}"></ha-icon></button>`;
    if (!open) return `<div class="info scale-legend">${head}</div>`;
    const f = t.flow;
    const box = (x, y, w, label) => `<rect x="${x}" y="${y}" width="${w}" height="40" rx="9" class="fl-box"/><text x="${x + w / 2}" y="${y + 24.5}" class="fl-t">${esc(label)}</text>`;
    const arrow = (d, both) => `<path d="${d}" class="fl-a" marker-end="url(#fl-h)"${both ? ' marker-start="url(#fl-h)"' : ""}/>`;
    const label = (x, y, text, anchor) => `<text x="${x}" y="${y}" class="fl-l" text-anchor="${anchor}">${esc(text)}</text>`;
    const defs = `<defs><marker id="fl-h" viewBox="0 0 8 8" refX="7" refY="4" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0 L8 4 L0 8 z" class="fl-head"/></marker></defs>`;
    const svg = `<svg class="flow" viewBox="0 0 340 312" role="img" aria-label="${esc(t.flowTitle)}">${defs}
        ${box(110, 6, 120, f.idle)}${box(252, 6, 82, f.hist)}${box(6, 70, 120, f.pre)}${box(110, 134, 120, f.weigh)}
        ${box(4, 200, 100, f.known)}${box(114, 200, 112, f.gb)}${box(236, 200, 100, f.open)}${box(110, 266, 120, f.result)}
        ${arrow("M230 26 H252", true)}
        ${arrow("M110 26 H66 V70")}${label(60, 52, f.tap, "end")}
        ${arrow("M170 46 V134")}${label(177, 120, f.step, "start")}
        ${arrow("M126 90 H170")}
        ${arrow("M170 174 V186 H54 V200")}${arrow("M170 174 V200")}${arrow("M170 186 H286 V200")}
        ${arrow("M54 240 V253 H150 V266")}${arrow("M170 240 V266")}${arrow("M286 240 V253 H190 V266")}${label(240, 290, "← " + f.person, "start")}
      </svg>`;
    const a = this._data?.next?.attributes || {};
    const T = Number(a.timeout_minutes) > 0 ? Number(a.timeout_minutes) : 5;
    const H = Number(this._config.display_hold) > 0 ? Number(this._config.display_hold) : 5;
    const Y = Math.round(this._histHold() / 1000);
    const tm = t.times({ T, H, Y });
    const svg2 = `<svg class="flow" viewBox="0 0 340 190" role="img" aria-label="${esc(t.timesTitle)}">${defs}
        ${box(6, 6, 80, f.pre)}${box(130, 6, 80, f.auto)}${box(254, 6, 80, f.idle)}
        ${arrow("M86 26 H130")}${label(108, 20, tm.pre, "middle")}${arrow("M210 26 H254")}${label(232, 20, tm.auto, "middle")}
        ${box(6, 66, 80, f.result)}${box(254, 66, 80, f.idle)}${arrow("M86 86 H254")}${label(170, 80, tm.res, "middle")}
        ${box(6, 126, 80, f.hist)}${box(254, 126, 80, f.back)}${arrow("M86 146 H254")}${label(170, 140, tm.hist, "middle")}
      </svg>`;
    return `<div class="info scale-legend">${head}<div class="info-body"><dl class="legend-list how">${t.how.map(([k, title, text]) => `<dt>${sym[k] || ""}</dt><dd><b>${esc(title)}</b> ${esc(this._config.invert_modes === true && k === "timer" && t.howInv ? t.howInv.timer : text)}</dd>`).join("")}</dl>
      <h3 class="legend-sub">${esc(t.flowTitle)}</h3>${svg}<p class="muted small">${esc(t.flowNote)}</p>
      <h3 class="legend-sub">${esc(t.timesTitle)}</h3>${svg2}<p class="muted small">${esc(t.timesNote)}</p></div></div>`;
  },
});
