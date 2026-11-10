/*
 * Module card-values: value tiles and explanations
 *
 * "Understanding the values": tiles with ratings and trends, the detail pop-ups,
 * the calculation-method table and the glance row.
 */

mixin(BodyScaleCard, {
  _bar(value, stops, labels, min, max, classes = ["low", "ok", "high", "veryHigh"]) {
    // stops: band boundaries between min and max; labels/classes per band.
    const pct = (v) => Math.max(0, Math.min(100, ((v - min) / (max - min)) * 100));
    const edges = [min, ...stops, max];
    const segs = labels
      .map((label, i) => {
        const width = pct(edges[i + 1]) - pct(edges[i]);
        // Narrow bands stay unlabelled; the tooltip still names them.
        return `<span class="band ${classes[i]}" style="width:${width.toFixed(2)}%" title="${esc(label)}">${width >= 22 ? esc(label) : ""}</span>`;
      })
      .join("");
    const ticks = stops
      .map((s) => `<span class="tick" style="left:${pct(s).toFixed(2)}%">${this._num(s, Number.isInteger(s) ? 0 : 1)}</span>`)
      .join("");
    const marker = value == null ? "" : `<span class="marker" style="left:${pct(Number(value)).toFixed(2)}%"></span>`;
    return `<div class="bar"><div class="bands">${segs}${marker}</div><div class="ticks">${ticks}</div></div>`;
  },
  _metricStatus(m, v, prof) {
    // low / ok / high / veryHigh where a range is established, else null.
    if (v == null) return null;
    const adult = !prof.minor;
    const by = (stops, classes) => classes[stops.filter((x) => v >= x).length];
    if (m === "body_mass_index") {
      if (adult) return by([18.5, 25, 30], ["low", "ok", "high", "veryHigh"]);
      return { thinness: "low", normal: "ok", overweight: "high", obesity: "veryHigh" }[prof.percentileCategory] || null;
    }
    if (!adult) return null;
    if (m === "body_fat_percentage" && prof.sex && prof.age != null) {
      const [, lo, ok, hi] = FAT_BANDS[prof.sex].find((b) => prof.age <= b[0]);
      return by([lo, ok, hi], ["low", "ok", "high", "veryHigh"]);
    }
    if (m === "body_water_percentage" && prof.sex) {
      const [lo, hi] = WATER_BANDS[prof.sex];
      return v < lo ? "low" : v <= hi ? "ok" : "high";
    }
    if (m === "skeletal_muscle_percentage" && prof.sex && prof.age != null) {
      const [, lo] = SMM_BANDS[prof.sex].find((b) => prof.age <= b[0]);
      return v < lo ? "low" : "ok";
    }
    if (m === "visceral_fat") return by([10, 15], ["ok", "high", "veryHigh"]);
    if (m === "metabolic_age" && prof.age != null) return v <= prof.age ? "ok" : "high";
    return null;
  },
  _statusLabel(m, status, it) {
    if (m === "body_mass_index") return it.categories[{ low: "thinness", ok: "normal", high: "overweight", veryHigh: "obesity" }[status]];
    if (m === "visceral_fat") return it.visceralBands[["ok", "high", "veryHigh"].indexOf(status)];
    if (m === "metabolic_age") return it.ageBands[status];
    return it.bands[status];
  },
  // Every rated value as a small coloured symbol, the noteworthy ones first.
  // Where they don't all fit, the good ones collapse into a tick with their
  // number (see _fitKeys). A tap jumps to the tile and opens it.
  _renderGlance(person, t) {
    const latest = person.rows[0];
    if (!latest) return "";
    const it = infoText(this._lang);
    const prof = this._profileOf(person);
    const order = ["veryHigh", "high", "low", "ok"];
    const rated = INFO_METRICS
      .map((m) => ({ m, status: this._metricStatus(m, latest[m] == null || latest[m] === "" ? null : Number(latest[m]), prof) }))
      .filter((x) => x.status)
      .sort((a, b) => order.indexOf(a.status) - order.indexOf(b.status));
    if (!rated.length) return "";
    const good = rated.filter((x) => x.status === "ok").length;
    const icons = rated.map(({ m, status }) => {
      const label = `${it.metrics[m][0]}: ${this._statusLabel(m, status, it)}`;
      return `<button class="g ${status}" data-action="glance" data-metric="${m}" title="${esc(label)}" aria-label="${esc(label)}"><ha-icon icon="${METRIC_ICONS[m]}"></ha-icon></button>`;
    }).join("");
    const count = good ? `<button class="g ok g-count" data-action="glance" data-metric="" title="${esc(t.allGood(good))}" aria-label="${esc(t.allGood(good))}"><ha-icon icon="mdi:check"></ha-icon>${good}</button>` : "";
    return `<span class="glance">${icons}${count}</span>`;
  },
  _renderValues(person, t) {
    // Every body value at a glance: symbol, value and, where a range is
    // established, whether it lies in it. A tap opens the explanation.
    const it = infoText(this._lang);
    const latest = person.rows[0] || {};
    const prof = this._profileOf(person);
    const adult = !prof.minor;
    // A body value the newest reading lacks (no impedance) is taken from the last
    // reading that has it, if that is at most values_max_age_days old (default 3).
    const maxAge = Number(this._config.values_max_age_days ?? 3) * 86400000;
    const carried = {};
    const value = (m) => {
      if (latest[m] != null && latest[m] !== "") return Number(latest[m]);
      if (!(maxAge > 0) || ["weight", "body_mass_index", "impedance", "height"].includes(m)) return null;
      const now = Date.now();
      const row = person.rows.find((r) => r[m] != null && r[m] !== "" && now - (Date.parse(r.timestamp) || 0) <= maxAge);
      if (!row) return null;
      carried[m] = row;
      return Number(row[m]);
    };
    const before = person.rows[1] || {};
    const w = value("weight");
    const metrics = INFO_METRICS.filter((m) => !(m === "impedance" || ESTIMATES.includes(m)) || value(m) != null);
    const comp = this._compContent(person, t, it);
    if (!adult && prof.heightCm != null && prof.heightPercentile != null) metrics.push("height");
    if (comp) metrics.push("composition");
    // Composition first, then the important indicators, technical values last.
    const order = TILE_ORDER;
    metrics.sort((a, b) => order.indexOf(a) - order.indexOf(b));
    let pop = "";
    const tiles = metrics.map((m) => {
      if (m === "height") {
        const open = this._openMetric === m;
        const head = `<button class="val none ${open ? "open" : ""}" data-action="metric" data-metric="${m}" aria-expanded="${open}">
          <span class="val-icon"><ha-icon icon="mdi:human-male-height"></ha-icon></span>
          <span class="val-text"><span class="val-name">${esc(t.chartLabels.height)}</span>
          <span class="val-value">${this._cm(prof.heightCm)}</span>
          <span class="val-status"><span class="muted">P${this._num(prof.heightPercentile, 0)}</span></span></span></button>`;
        if (open) {
          const refs = [[prof.reference, prof.heightPercentile]];
          if (prof.compare && prof.heightPercentileOther != null) refs.push([prof.reference === "kh" ? "who" : "kh", prof.heightPercentileOther]);
          refs.sort((a, b) => (a[0] === "who" ? -1 : 1) - (b[0] === "who" ? -1 : 1));
          pop = `<div class="val-detail" role="dialog" aria-label="${esc(t.chartLabels.height)}"><span class="pop-arrow"></span>${this._bar(prof.heightPercentile, prof.reference === "kh" ? [3, 97] : [2.3, 97.7], it.heightBands, 0, 100, ["low", "ok", "high"])}${refs.map(([ref, p]) => `<p class="small">${esc(it.heightPct(this._num(p, 0), ref))}</p>`).join("")}<p class="muted small">${esc(it.heightCuts)}</p></div>`;
        }
        return head;
      }
      if (m === "composition") {
        const open = this._openMetric === m;
        const head = `<button class="val none ${open ? "open" : ""}" data-action="metric" data-metric="${m}" aria-expanded="${open}">
          <span class="val-icon"><ha-icon icon="body_scale:composition-bars"></ha-icon></span>
          <span class="val-text"><span class="val-name">${esc(it.compTitle)}</span>
          <span class="val-value">${this._num(comp.fat, 1)} / ${this._num(comp.ffm, 1)} kg</span>
          <span class="val-status"><span class="muted">${esc(it.compSub)}</span></span></span></button>`;
        if (open) {
          pop = `<div class="val-detail" role="dialog" aria-label="${esc(it.compTitle)}"><span class="pop-arrow"></span>${comp.bars}<p>${esc(it.compIntro)}</p>${adult ? "" : `<p class="muted small">${esc(it.compKid)}</p>`}</div>`;
        }
        return head;
      }
      const [name, what, range] = it.metrics[m];
      const v = value(m);
      const digits = ["basal_metabolic_rate", "impedance", "visceral_fat", "metabolic_age"].includes(m) ? 0 : 1;
      const unit = UNITS[m] ? ` ${UNITS[m]}` : "";
      const status = this._metricStatus(m, v, prof);
      const open = this._openMetric === m;
      // Change to the reading before: arrow and amount, neutral colour
      // (whether up is good depends on the value).
      let trend = "";
      const prev = before[m] == null || before[m] === "" ? null : Number(before[m]);
      if (v != null && prev != null && !Number.isNaN(prev)) {
        const d = Number((v - prev).toFixed(digits));
        if (d !== 0) {
          trend = `<span class="val-delta" title="${esc(t.sincePrevious)}"><ha-icon icon="${d > 0 ? "mdi:arrow-top-right" : "mdi:arrow-bottom-right"}"></ha-icon>${d > 0 ? "+" : "−"}${this._num(Math.abs(d), digits)}</span>`;
        }
      }
      // Children: the BMI percentile is what the rating rests on.
      const pct = !adult && m === "body_mass_index" && prof.percentile != null ? ` · P${this._num(prof.percentile, 0)}` : "";
      const old = carried[m];
      const oldText = old ? t.carriedFrom(this._when(old)) : "";
      if (old) trend = "";
      const head = `<button class="val ${status || "none"} ${old ? "old" : ""} ${open ? "open" : ""}" data-action="metric" data-metric="${m}" aria-expanded="${open}"${old ? ` title="${esc(oldText)}"` : ""}>
          <span class="val-icon"><ha-icon icon="${METRIC_ICONS[m]}"></ha-icon></span>
          <span class="val-text"><span class="val-name">${esc(name)}</span>
          <span class="val-value">${v == null ? "–" : `${this._num(v, digits)}${unit}`}</span>
          <span class="val-status">${status ? `<span class="val-rating">${esc(this._statusLabel(m, status, it))}${pct}</span>` : ""}${trend}${old ? `<span class="val-old">${esc(oldText)}</span>` : ""}${status || trend || old ? "" : "&nbsp;"}</span></span></button>`;
      if (!open) return head;
      let extra = "";
      if (adult && m === "body_mass_index") {
        extra = this._bar(v, [18.5, 25, 30], it.bmiBands, 15, 40);
      } else if (!adult && m === "body_mass_index" && prof.percentile != null) {
        // WHO cut-offs -2 / +1 / +2 SD = percentiles 2.3 / 84.1 / 97.7; German ones P10 / P90 / P97.
        const stops = prof.reference === "kh" ? [10, 90, 97] : [2.3, 84.1, 97.7];
        extra = this._bar(prof.percentile, stops, it.bmiBands, 0, 100);
        if (prof.compare && prof.percentileOther != null) {
          // One explanation per reference.
          const otherRef = prof.reference === "kh" ? "who" : "kh";
          extra += [[prof.reference, prof.percentile, prof.percentileCategory], [otherRef, prof.percentileOther, prof.categoryOther]]
            .sort((a, b) => (a[0] === "who" ? -1 : 1) - (b[0] === "who" ? -1 : 1))
            .map(([ref, p, c]) => `<p class="small">${esc(it.percentile(this._num(p, 0), it.categories[c] || "", ref, null))}</p>`).join("");
        } else {
          extra += `<p class="small">${esc(it.percentile(this._num(prof.percentile, 0), it.categories[prof.percentileCategory] || "", prof.reference, null))}</p>`;
        }
        if (prof.compare && prof.percentileOther != null) {
          // Both ratings side by side: they can differ (other cut-offs and populations).
          const other = prof.reference === "kh" ? "who" : "kh";
          const one = (ref, p, c) => `<span class="ref-rate ${c || ""}"><b>${ref === "kh" ? "DE" : "WHO"}</b> P${esc(this._num(p, 0))}${c ? ` · ${esc(it.categories[c] || c)}` : ""}</span>`;
          const pair = [[prof.reference, prof.percentile, prof.percentileCategory], [other, prof.percentileOther, prof.categoryOther]]
            .sort((a, b) => (a[0] === "who" ? -1 : 1) - (b[0] === "who" ? -1 : 1));
          extra += `<p class="small ref-compare">${pair.map((x) => one(...x)).join("")}</p>`;
        }
      } else if (adult && m === "body_fat_percentage" && prof.sex && prof.age != null) {
        const [, lo, ok, hi] = FAT_BANDS[prof.sex].find((b) => prof.age <= b[0]);
        extra = this._bar(v, [lo, ok, hi], [it.bands.low, it.bands.ok, it.bands.high, it.bands.veryHigh], Math.max(0, lo - 8), hi + 10);
      } else if (adult && m === "body_water_percentage" && prof.sex) {
        const [lo, hi] = WATER_BANDS[prof.sex];
        extra = this._bar(v, [lo, hi], [it.bands.low, it.bands.ok, it.bands.high], lo - 10, hi + 10);
      } else if (adult && m === "skeletal_muscle_percentage" && prof.sex && prof.age != null) {
        const [, lo, hi] = SMM_BANDS[prof.sex].find((b) => prof.age <= b[0]);
        extra = this._bar(v, [lo, hi], [it.bands.low, it.bands.ok, it.bands.veryHigh], lo - 10, hi + 10, ["low", "ok", "ok"]) +
          `<p class="muted small">Omron Healthcare</p>`;
      } else if (adult && m === "bone_mass" && prof.sex && w) {
        extra = `<p class="muted small">${esc(it.avgForWeight(this._num(averageBone(prof.sex, w), 1)))}</p>`;
      } else if (m === "visceral_fat" && v != null) {
        extra = this._bar(v, [10, 15], it.visceralBands, 1, 30, ["ok", "high", "veryHigh"]);
      } else if (m === "metabolic_age" && prof.age != null) {
        extra = `<p class="muted small">${esc(it.realAge(prof.age))}</p>`;
      } else if (adult && m === "basal_metabolic_rate" && w && prof.heightCm && prof.age != null && prof.sex) {
        const msj = 10 * w + 6.25 * prof.heightCm - 5 * prof.age + (prof.sex === "male" ? 5 : -161);
        extra = `<p class="muted small">${esc(it.mifflin(this._num(msj, 0)))}</p>`;
      }
      // Percent values also in kilograms; body fat of an adult also after the other methods.
      if (v != null && w && ["body_fat_percentage", "body_water_percentage", "skeletal_muscle_percentage", "protein_percentage", "subcutaneous_fat_percentage"].includes(m)) {
        const kg = m === "body_fat_percentage" && value("fat_mass") != null ? value("fat_mass") : (v * w) / 100;
        extra = `<p class="kg-line"><b>${this._num(kg, 1)} kg</b></p>` + extra;
      }
      if (adult && METHOD_VALUES.includes(m) && w && latest.methods?.standard?.normal?.[m] != null) {
        extra += `<div class="methods-pop"><p class="muted small">${esc(it.algoTitle)}:</p>${this._methodTable(prof, latest.methods, w, it, m)}</div>`;
      }
      pop = `<div class="val-detail" role="dialog" aria-label="${esc(name)}"><span class="pop-arrow"></span>${extra}<p>${esc(what)}</p>
          <p class="muted small">${esc(adult ? range : m === "body_mass_index" ? (prof.compare ? `${it.kidBmi.who} ${it.kidBmi.kh}` : it.kidBmi[prof.reference]) : it.kidRanges[m] || range)}</p></div>`;
      return head;
    });
    // The explanation floats at its tile as a pop-up, so the rows stay put.
    return `<div class="vals" lang="${esc(this._lang.slice(0, 2))}">${tiles.join("")}${pop}</div>`;
  },
  // One value of a reading after each method (normal / athlete, standard /
  // alternative); percent values also in kilograms; the method in use is
  // marked and the cells carry the colour of their rating.
  _methodTable(prof, methods, w, it, metric = "body_fat_percentage") {
    const digits = ["basal_metabolic_rate", "visceral_fat", "metabolic_age"].includes(metric) ? 0 : 1;
    const unit = UNITS[metric] ? ` ${UNITS[metric]}` : "";
    const pct = ["body_fat_percentage", "body_water_percentage", "skeletal_muscle_percentage", "protein_percentage", "subcutaneous_fat_percentage"].includes(metric);
    const cell = (alt, ath) => {
      const v = methods[alt ? "alternative" : "standard"]?.[ath ? "athlete" : "normal"]?.[metric];
      if (v == null) return `<td class="num">–</td>`;
      const on = prof.alternative === alt && prof.athlete === ath;
      const st = this._metricStatus(metric, v, prof);
      return `<td class="num ${on ? "on" : ""} ${st ? `st-${st}` : ""}">${this._num(v, digits)}${unit}${pct ? `<span class="muted small" style="display:block">${this._num((v * w) / 100, 1)} kg</span>` : ""}</td>`;
    };
    return `<table class="algo"><tr><th></th><th class="num">${esc(it.normal)}</th><th class="num">${esc(it.athleteCol)}</th></tr>
        <tr><th>${esc(it.algos.standard[0])}</th>${cell(false, false)}${cell(false, true)}</tr>
        <tr><th>${esc(it.algos.alternative[0])}</th>${cell(true, false)}${cell(true, true)}</tr></table><p class="muted small algo-note">${esc(it.activeNote)}</p>`;
  },
});
