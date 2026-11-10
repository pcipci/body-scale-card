/*
 * Module card-format: numbers, dates and labels
 *
 * Number and date formatting for the card (display digits, weights, times, ticks).
 */

mixin(BodyScaleCard, {
  // ------------------------------------------------------------ formatting

  _num(value, digits = 1) {
    if (value === null || value === undefined || value === "") return "–";
    const n = Number(value);
    if (Number.isNaN(n)) return esc(value);
    return n.toLocaleString(this._lang, {
      minimumFractionDigits: digits,
      maximumFractionDigits: digits,
    });
  },
  // Display digits: always a point, whatever the language (like a device).
  _lcd(value, digits = 1) {
    const n = Number(value);
    if (value === null || value === undefined || value === "" || Number.isNaN(n)) return "–";
    return n.toFixed(digits).replace("-", "−");
  },
  // Weight like the scale shows it: 0.05 kg raster, two digits before the
  // point; from 100 kg one decimal.
  _w2(value) {
    const n = Number(value);
    if (value === null || value === undefined || value === "" || Number.isNaN(n)) return null;
    if (n >= 100) return n.toFixed(1);
    return (Math.round(n * 20) / 20).toFixed(2).padStart(5, "0");
  },
  _when(row) {
    if (row.timestamp) {
      const d = new Date(row.timestamp);
      if (!Number.isNaN(d.getTime())) {
        return d.toLocaleString(this._lang, {
          day: "2-digit", month: "2-digit", year: "2-digit",
          hour: "2-digit", minute: "2-digit",
        });
      }
    }
    return row.time || row.timestamp_display || "";
  },
  _pendingLabel(p) {
    // Hidden when it may belong to a private person this viewer can't see.
    const hidden = (p.candidates || []).some((id) => {
      const person = this._data?.people.find((x) => x.id === id);
      return person && !person.visible;
    });
    if (hidden) return `${this._when(p)} · ${this._t.newMeasurement}`;
    const unit = p.weight_unit || "kg";
    return `${this._when(p)} · ${this._num(p.weight, 2)} ${unit}`;
  },
  _weightChange(person, days) {
    // Latest weight minus the weight `days` ago (own rows, else statistics).
    const latest = person.rows[0];
    if (!latest) return null;
    const history = person.rows
      .map((r) => ({ t: new Date(r.timestamp).getTime(), v: Number(r.weight) }))
      .filter((p) => !Number.isNaN(p.t) && !Number.isNaN(p.v))
      .sort((a, b) => a.t - b.t);
    const stats = this._stats?.[`${person.id}|weight|year`]?.points || this._stats?.[`${person.id}|weight|month`]?.points || [];
    const ms = Date.now() - days * 86400000;
    const ref = this._valueAt(history, ms) || this._valueAt(stats, ms);
    return ref ? Number(latest.weight) - ref.v : null;
  },
  _valueAt(points, ms) {
    let found = null;
    for (const p of points) {
      if (p.t <= ms) found = p;
      else break;
    }
    return found;
  },
  _cm(v) {
    // One way everywhere: 140 cm, 126,5 cm.
    const n = Number(v);
    return `${this._num(n, Number.isInteger(n) ? 0 : 1)} cm`;
  },
  _fmtTick(ms, span) {
    const d = new Date(ms);
    // Over about 14 months: years; otherwise months (with the year on January).
    if (span > 430 * 86400000) return String(d.getFullYear());
    if (span < 62 * 86400000) return d.toLocaleDateString(this._lang, { day: "numeric", month: "numeric" });
    return d.toLocaleDateString(this._lang, d.getMonth() === 0 ? { month: "short", year: "2-digit" } : { month: "short" });
  },
  _fmtDate(ms, period) {
    return new Date(ms).toLocaleDateString(this._lang, { day: "2-digit", month: "2-digit", year: period === "month" ? undefined : "2-digit" });
  },
  _rowLabel(userId, mid) {
    const row = (this._person(userId)?.rows || []).find((r) => r.measurement_id === mid);
    return row ? `${this._when(row)} (${this._num(row.weight, 2)} kg)` : mid;
  },
});
