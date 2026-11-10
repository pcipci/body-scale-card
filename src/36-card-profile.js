/*
 * Module card-profile: person profile, growth and references
 *
 * Age, height, sex and body-fat method of a person; children's growth and percentiles
 * (WHO / Kromeyer-Hauschild); the profile line and the summary under the name.
 */

mixin(BodyScaleCard, {
  // A baby / pet is decided here, from the birth date; the integration only
  // stores a weight for whoever the card names.
  _isBaby(born) {
    const b = Date.parse(born || "");
    if (Number.isNaN(b)) return false;
    const limit = Number(this._opt("baby_max_months")) > 0 ? Number(this._opt("baby_max_months")) : 24;
    return (Date.now() - b) / (30.4375 * 86400000) < limit;
  },
  // The reference in use (and the other one): from the card's options, else
  // from the percentile sensors of an older integration, else WHO.
  _growthCtx(person) {
    const cfg = this._config || {};
    const ref = this._opt("reference") === "kh" ? "kh" : "who";
    const compare = this._opt("compare_references") === true;
    // The tables are separate files: look for them, load them if the user allowed it.
    for (const r of ["who", "kh"]) {
      growthProbe(r);
      if (this._opt(`growth_${r}`) === true && growthState[r].exists) growthLoad(r);
    }
    return { chosen: ref, other: ref === "kh" ? "who" : "kh", compare, sex: person.sex === "female" ? "female" : "male", born: person.born || null };
  },
  // Height at a time: the last entry of the height history before it (the
  // first one before the history starts), else the profile height.
  _heightAt(person, ms, fallback) {
    const history = this._heightHistory(person);
    if (!history.length) return fallback;
    let v = history[0].v;
    for (const h of history) if (h.t <= ms) v = h.v;
    return v;
  },
  // Percentile and rating of a BMI / height at a time after a reference.
  _growthAt(person, kind, value, ms, ref) {
    const ctx = this._growthCtx(person);
    const months = growthAgeMonths(ctx.born, ms);
    if (months == null) return null;
    const r = growthPercentile(ref, kind, value, ctx.sex, months);
    return r ? { p: r.p, z: r.z, category: growthCategory(ref, r.z) } : null;
  },
  // A child's BMI percentile readings after the reference in use.
  _pctRows(person, prof) {
    const out = [];
    for (const r of person.rows) {
      const t = Date.parse(r.timestamp), w = Number(r.weight);
      if (Number.isNaN(t) || !(w > 0)) continue;
      const h = this._heightAt(person, t, prof.heightCm);
      if (!(h > 0)) continue;
      const g = this._growthAt(person, "bmi", w / (h / 100) ** 2, t, prof.reference);
      if (g) out.push({ t, v: g.p });
    }
    return out.sort((a, b) => a.t - b.t);
  },
  // The percentile at a reading (within ten minutes) and the one before it.
  _pctAt(person, prof, ts) {
    const rows = this._pctRows(person, prof);
    const t0 = Date.parse(ts);
    let k = -1, best = Infinity;
    rows.forEach((r, i) => {
      const d = Math.abs(r.t - t0);
      if (d < best) { best = d; k = i; }
    });
    if (k < 0 || best > 600000) return [null, null];
    return [Number(rows[k].v), k > 0 ? Number(rows[k - 1].v) : null];
  },
  // ------------------------------------------------------- explanations

  _profileOf(person) {
    return this._profileFromDirectory(person);
  },
  // Profile from the interface directory: birth date, sex, method, heights.
  _profileFromDirectory(person) {
    const hs = this._heightHistory(person);
    const last = hs[hs.length - 1];
    const heightCm = last ? last.v : null;
    const b = Date.parse(person.born || "");
    let age = null;
    if (!Number.isNaN(b)) {
      const bd = new Date(b), n = new Date();
      age = n.getFullYear() - bd.getUTCFullYear() - (n < new Date(n.getFullYear(), bd.getUTCMonth(), bd.getUTCDate()) ? 1 : 0);
    }
    return {
      heightAgeDays: last ? (Date.now() - last.t) / 86400000 : null,
      age,
      minor: age != null && age < 18,
      heightCm,
      sex: person.sex === "male" || person.sex === "female" ? person.sex : null,
      athlete: !!person.athlete,
      alternative: person.method === "alternative",
      ...this._percentilesOf(person, age, heightCm),
    };
  },
  // The latest BMI and the height as percentiles after the reference in use
  // and the other one (children only).
  _percentilesOf(person, age, heightCm) {
    const ctx = this._growthCtx(person);
    const base = { reference: ctx.chosen, compare: ctx.compare, percentile: null, percentileCategory: null, percentileOther: null, categoryOther: null, heightPercentile: null, heightPercentileOther: null };
    if (age == null || age >= 18 || !ctx.born) return base;
    const row = person.rows[0];
    const t = Date.parse(row?.timestamp), w = Number(row?.weight);
    if (!Number.isNaN(t) && w > 0 && heightCm > 0) {
      const bmi = w / (heightCm / 100) ** 2;
      const a = this._growthAt(person, "bmi", bmi, t, ctx.chosen), b = this._growthAt(person, "bmi", bmi, t, ctx.other);
      base.percentile = a ? a.p : null;
      base.percentileCategory = a ? a.category : null;
      base.percentileOther = b ? b.p : null;
      base.categoryOther = b ? b.category : null;
    }
    if (heightCm > 0) {
      const now = Date.now();
      const a = this._growthAt(person, "height", heightCm, now, ctx.chosen), b = this._growthAt(person, "height", heightCm, now, ctx.other);
      base.heightPercentile = a ? a.p : null;
      base.heightPercentileOther = b ? b.p : null;
    }
    return base;
  },
  _renderProfile(person, t) {
    // Age, height and method at a glance: BMI, fat and percentile depend on
    // them, so an outdated height shows up here first.
    const prof = this._profileOf(person);
    const it = infoText(this._lang);
    // Symbol and value, the words as tooltip; height opens its dialog.
    const item = (icon, text, title, extra = "") =>
      `<span class="pf" title="${esc(title)}"><ha-icon icon="${icon}"></ha-icon>${text ? `<span>${esc(text)}</span>` : ""}${extra}</span>`;
    const items = [];
    if (prof.sex) items.push(item(prof.sex === "female" ? "mdi:gender-female" : "mdi:gender-male", "", t.sexes[prof.sex]));
    if (prof.age != null) items.push(item("mdi:cake-variant-outline", String(prof.age), t.years(prof.age)));
    const canHeight = this._can("set_height");
    if (prof.heightCm && !canHeight) items.push(item("mdi:human-male-height", this._cm(prof.heightCm), t.chartLabels.height));
    if (prof.heightCm && canHeight) {
      items.push(`<button class="pf inline-link" data-action="height" data-user="${esc(person.id)}" title="${esc(t.heightEdit)}" aria-label="${esc(t.heightEdit)}">
        <ha-icon icon="mdi:human-male-height"></ha-icon><span>${esc(this._cm(prof.heightCm))}</span><ha-icon class="pen" icon="mdi:pencil-outline"></ha-icon></button>`);
    }
    if (prof.sex) {
      const name = [it.algos[prof.alternative ? "alternative" : "standard"][0], prof.athlete && it.algos.athlete[0]].filter(Boolean).join(", ");
      items.push(`<span class="pf">${methodIcon(prof, `${it.algoTitle}: ${name}`)}</span>`);
    }
    if (person.private) items.push(item("mdi:eye-off-outline", "", t.private));
    // Children grow: remind when the height is older than half a year.
    if (canHeight && prof.minor && prof.heightAgeDays != null && prof.heightAgeDays > 182) {
      items.push(`<button class="pf inline-link stale" data-action="height" data-user="${esc(person.id)}">${esc(`${t.heightOld(Math.floor(prof.heightAgeDays / 30.4))} · ${t.heightNow}`)}</button>`);
    }
    if (!items.length) return "";
    return `<div class="profile">${items.join("")}</div>`;
  },
  _renderSummary(person, t) {
    const latest = person.rows[0];
    if (!latest) return "";
    const unit = "kg";
    const delta = (days) => {
      const d = this._weightChange(person, days);
      if (d == null) return "";
      const sign = d > 0.05 ? "+" : d < -0.05 ? "−" : "±";
      return `<span class="kpi" title="${esc(t.days(days))}"><span class="kpi-label muted" aria-label="${esc(t.days(days))}">${calendar(days)}</span><span>${sign}${this._num(Math.abs(d), 2)} ${unit}</span></span>`;
    };
    const parts = [
      `<span class="kpi" title="${esc(t.latest)}"><span class="kpi-label muted" aria-label="${esc(t.latest)}"><ha-icon icon="mdi:scale-bathroom"></ha-icon></span><span class="strong">${this._num(latest.weight, 2)} ${unit}</span></span>`,
    ];
    if (this._config.info === false && latest.body_mass_index != null) parts.push(`<span class="kpi"><span class="muted small">BMI</span><span>${this._num(latest.body_mass_index, 1)}</span></span>`);
    if (this._config.info === false && latest.body_fat_percentage != null) parts.push(`<span class="kpi"><span class="muted small">${esc(t.cols.body_fat_percentage)}</span><span>${this._num(latest.body_fat_percentage, 1)} %</span></span>`);
    parts.push(delta(7), delta(30));
    // Equal columns, label above value: one line on every width.
    const kpis = parts.filter(Boolean);
    return `<div class="summary" style="--k:${kpis.length}">${kpis.join("")}</div>`;
  },
  _references(person, key) {
    // [chosen in the options, the other one]; the curves come from the tables in the card.
    const ctx = this._growthCtx(person);
    const kind = key === "height_percentile" ? "height" : "bmi";
    const has = (ref) => !!growthLms(ref, kind, ctx.sex, ref === "kh" ? 120 : 120);
    return { attrs: {}, chosen: ctx.chosen, other: ctx.other, hasOther: has(ctx.other), compare: ctx.compare };
  },
  // A child's current percentile of a metric after a reference.
  _pctNow(person, metric, ref) {
    const prof = this._profileOf(person);
    const first = ref === prof.reference;
    return metric === "height_percentile" ? (first ? prof.heightPercentile : prof.heightPercentileOther) : (first ? prof.percentile : prof.percentileOther);
  },
  _refAvailable(person, ref) {
    // The reference has curves for this child.
    return !!this._bands(person, "bmi_percentile", ref === this._references(person, "bmi_percentile").chosen ? "ref" : "other");
  },
  _refSeries(person, metric, ref) {
    // The percentile after a reference, computed here: per weight (BMI, with
    // the height of that time) or per height entry.
    const prof = this._profileOf(person);
    const from = Date.now() - PERIODS[this._period || "month"].days * 86400000;
    if (metric !== "height_percentile") {
      return this._series(person, "weight")
        .map((p) => {
          const h = this._heightAt(person, p.t, prof.heightCm);
          const g = h > 0 ? this._growthAt(person, "bmi", p.v / (h / 100) ** 2, p.t, ref) : null;
          return g ? { t: p.t, v: g.p } : null;
        })
        .filter(Boolean);
    }
    const all = this._heightHistory(person)
      .map((r) => {
        const g = this._growthAt(person, "height", r.v, r.t, ref);
        return g ? { t: r.t, v: g.p } : null;
      })
      .filter(Boolean);
    const points = all.filter((p) => p.t >= from);
    // Held like the height itself: to the period start and to now.
    const before = all.filter((p) => p.t < from).pop();
    if (before) points.unshift({ t: from, v: before.v, synthetic: true });
    const last = points[points.length - 1];
    if (last && Date.now() - last.t > 60000) points.push({ t: Date.now(), v: last.v, synthetic: true });
    return points;
  },
});
