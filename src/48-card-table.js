/*
 * Module card-table: tables, people, open measurements, dialogs
 *
 * The people tabs, the overview, open measurements, the measurement table, the height
 * table and the confirmation dialogs.
 */

mixin(BodyScaleCard, {
  _renderPending(data, t) {
    // The newest unclear reading is handled on the scale's display; the list
    // only holds the others and stays away while there are none.
    const pending = data.pending.filter((p) => p.measurement_id !== this._shownPending);
    if (!pending.length) return "";
    const items = pending
      .map((p) => {
        const hasImp = p.resistance_1 !== null && p.resistance_1 !== undefined && Number(p.resistance_1) > 0;
        const candidates = new Set(p.candidates || []);
        const buttons = data.people
          .map((person) => {
            // No hint towards a private person this viewer cannot see.
            const hint = candidates.has(person.id) && person.visible;
            return `<button class="chip ${hint ? "hint" : ""}" data-action="assign" data-mid="${esc(p.measurement_id)}" data-user="${esc(person.id)}" title="${hint ? esc(t.suggested) : ""}">${esc(person.name)}</button>`;
          })
          .join("");
        const discard = `<button class="chip muted-chip" data-action="discard" data-mid="${esc(p.measurement_id)}">${esc(t.discard)}</button>`;
        return `<div class="pending">
            <div class="pending-head"><span class="strong">${esc(this._pendingLabel(p))}</span>
            <span class="tag ${hasImp ? "ok" : ""}">${esc(hasImp ? t.impedance : t.noImpedance)}</span></div>
            <div class="chips"><span class="muted small">${esc(t.assignTo)}</span>${buttons}${discard}</div>
          </div>`;
      })
      .join("");
    return `<section><h2>${esc(t.pending)} <span class="count">${pending.length}</span></h2>${items}</section>`;
  },
  _renderOverview(people, t) {
    // One row per person; the graphs live in each person's own view.
    const links = this._config.links || {};
    const rows = people.map((p) => {
      const latest = p.rows[0];
      const change = this._weightChange(p, 7);
      const weight = latest ? `${this._num(latest.weight, 2)} kg` : "–";
      const delta = change == null ? "" : `${change > 0.05 ? "+" : change < -0.05 ? "−" : "±"}${this._num(Math.abs(change), 2)}`;
      const link = links[p.id];
      const inner = `<ha-icon class="who" icon="${personIcon(this._profileOf(p))}"></ha-icon>
        <span class="ov-name">${esc(p.name)}${p.private ? ` <ha-icon class="pen" icon="mdi:eye-off-outline" title="${esc(t.private)}"></ha-icon>` : ""}</span>
        <span class="ov-weight">${esc(weight)}</span><span class="ov-delta" title="${esc(t.days(7))}">${esc(delta)}</span>
        ${link ? `<ha-icon class="chev" icon="mdi:chevron-right"></ha-icon>` : ""}`;
      return link
        ? `<button class="ov-row" data-action="open" data-path="${esc(link)}">${inner}</button>`
        : `<div class="ov-row">${inner}</div>`;
    });
    return `<section><h2>${esc(t.measurements)}</h2><div class="overview">${rows.join("")}</div></section>`;
  },
  _renderPeople(people, t, showTabs, glanceInHeader = false) {
    if (!people.length) return "";
    if (this._config.overview) return this._config.list === false ? "" : this._renderOverview(people, t);
    let html = "<section>";
    if (showTabs && people.length > 1) {
      html += `<div class="tabs">${people
        .map((p) => `<button class="tab ${p.id === this._selected ? "active" : ""}" data-action="tab" data-user="${esc(p.id)}"><ha-icon icon="${personIcon(this._profileOf(p))}"></ha-icon>${esc(p.name)}</button>`)
        .join("")}</div>`;
    }
    const person = people.find((p) => p.id === this._selected) || people[0];
    if (!glanceInHeader && this._config.info !== false) html += `<div class="glance-row">${this._renderGlance(person, t)}</div>`;
    if (this._config.profile !== false) html += this._renderProfile(person, t);
    html += this._renderSummary(person, t);
    if (this._config.chart !== false && person.rows.length) html += this._renderChart(person, t);
    if (this._config.info !== false && person.rows.length) html += this._renderValues(person, t);
    // In the height view the table lists the heights instead of the weigh-ins.
    const views = this._chartViews(person);
    const view = views.includes(this._chartView) ? this._chartView : views[0];
    html += this._config.chart !== false && view === "height" && this._heightHistory(person).length
      ? this._renderHeightTable(person, t)
      : this._renderTable(person, t);
    if (person.rows.length) html += this._renderChartLegend(t);
    return html + "</section>";
  },
  _renderHeightTable(person, t) {
    const rows = this._heightHistory(person).reverse();
    // Each entry's percentile at its own date (children only).
    const refNow = this._references(person, "height_percentile").chosen;
    const pct = new Map();
    if (this._profileOf(person).minor) {
      for (const r of rows) {
        const g = this._growthAt(person, "height", r.v, r.t, refNow);
        if (g) pct.set(r.at, g.p);
      }
    }
    const date = (ms) => new Date(ms).toLocaleDateString(this._lang, { day: "2-digit", month: "2-digit", year: "2-digit" });
    const draft = this._heightRow?.user === person.id ? this._heightRow : null;
    const user = esc(person.id);
    const canEditH = this._can("set_height");
    // The inline row: −/+ in 0.5 cm steps or typed, ✓ saves, ✕ cancels.
    const edit = (when) => `<tr class="draft"><td class="when">${esc(when)}</td>
      <td class="num" colspan="${pct.size ? 3 : 2}"><span class="stepper">
        <button class="icon" data-action="hstep" data-d="-0.5" aria-label="−0,5 cm"><ha-icon icon="mdi:minus"></ha-icon></button>
        <label class="hval"><input type="number" inputmode="decimal" min="40" max="250" step="0.5" value="${esc(String(draft.v))}"><span>cm</span></label>
        <button class="icon" data-action="hstep" data-d="0.5" aria-label="+0,5 cm"><ha-icon icon="mdi:plus"></ha-icon></button></span>
        ${draft.error ? `<div class="error">${esc(draft.error)}</div>` : ""}</td>
      <td class="actions"><button class="icon ok" data-action="hsave" title="${esc(t.save)}" aria-label="${esc(t.save)}" ${draft.busy ? "disabled" : ""}><ha-icon icon="mdi:check"></ha-icon></button><button class="icon" data-action="hcancel" title="${esc(t.cancel)}" aria-label="${esc(t.cancel)}"><ha-icon icon="mdi:close"></ha-icon></button></td></tr>`;
    const body = rows.map((row, i) => {
      if (draft && draft.at === row.at) return edit(date(row.t));
      const older = rows[i + 1];
      let change = "–";
      if (older) {
        const d = row.v - older.v;
        if (Math.abs(d) >= 0.05) change = `<span class="delta ${d > 0 ? "up" : "down"}">${d > 0 ? "+" : "−"}${this._num(Math.abs(d), Number.isInteger(d) ? 0 : 1)}</span>`;
      }
      const p = pct.get(row.at);
      const del = rows.length > 1 && canEditH
        ? `<button class="icon danger" data-action="delheight" data-at="${esc(row.at)}" data-user="${user}" title="${esc(t.remove)}" aria-label="${esc(t.remove)}"><ha-icon icon="mdi:delete-outline"></ha-icon></button>`
        : "";
      return `<tr><td class="when">${esc(date(row.t))}</td>
        <td class="num">${esc(this._cm(row.v))}</td><td class="num">${change}</td>${pct.size ? `<td class="num">${p != null ? `P${Math.round(p)}` : "–"}</td>` : ""}
        <td class="actions">${canEditH ? `<button class="icon" data-action="hedit" data-at="${esc(row.at)}" data-user="${user}" title="${esc(t.heightEdit)}" aria-label="${esc(t.heightEdit)}"><ha-icon icon="mdi:pencil-outline"></ha-icon></button>` : ""}${del}</td></tr>`;
    }).join("");
    const th = (icon, label, cls = "num") => `<th class="${cls}" title="${esc(label)}" aria-label="${esc(label)}"><ha-icon icon="${icon}"></ha-icon></th>`;
    const add = draft || !canEditH ? "" : `<button class="icon add-h" data-action="hadd" data-user="${user}" title="${esc(t.heightAdd)}" aria-label="${esc(t.heightAdd)}"><ha-icon icon="mdi:plus"></ha-icon></button>`;
    return `<div class="table-wrap htable"><table><tr>${th("mdi:calendar-blank-outline", t.date, "")}${th("mdi:human-male-height", t.chartLabels.height)}${th("mdi:delta", t.change)}${pct.size ? th("mdi:chart-bell-curve", t.chartLabels.height_percentile) : ""}<th class="actions">${add}</th></tr>
      ${draft && draft.at == null ? edit(date(Date.now())) : ""}${body}</table></div>`;
  },
  _renderTable(person, t) {
    const rows = this._rowsFiltered(person);
    if (!rows.length) return `<div class="muted">${esc(t.noMeasurements)}</div>`;
    const columns = (this._config.columns || DEFAULT_COLUMNS).filter((c) => t.cols[c]);
    const limit = this._expanded ? rows.length : Math.min(rows.length, Number(this._config.rows) || 10);
    const head = `<tr><th>${esc(t.date)}</th>${columns
      .map((c, i) => `<th class="num ${i >= 3 ? "wide" : ""}">${esc(t.cols[c])}${UNITS[c] ? `<span class="unit"> ${UNITS[c]}</span>` : ""}</th>`)
      .join("")}<th></th></tr>`;
    const body = rows
      .slice(0, limit)
      .map((row, index) => {
        const cells = columns
          .map((c, i) => {
            const digits = ["basal_metabolic_rate", "impedance", "visceral_fat", "metabolic_age"].includes(c) ? 0 : c === "weight" ? 2 : 1;
            let cell = this._num(row[c], digits);
            if (c === "weight") {
              const older = rows[index + 1];
              if (older && older.weight != null && row.weight != null) {
                const delta = Number(row.weight) - Number(older.weight);
                if (Math.abs(delta) >= 0.05) {
                  cell += ` <span class="delta ${delta > 0 ? "up" : "down"}">${delta > 0 ? "+" : "−"}${this._num(Math.abs(delta), 2)}</span>`;
                }
              }
            }
            return `<td class="num ${i >= 3 ? "wide" : ""}">${cell}</td>`;
          })
          .join("");
        const mid = esc(row.measurement_id);
        const others = this._data.people.length > 1 && this._can("set_entry") && this._can("write");
        const canDelete = this._can("write");
        const dressed = !!row.clothed;
        const clothes = this._can("set_entry") && row.weight != null
          ? `<button class="icon ${dressed ? "on" : ""}" data-action="clothed" data-mid="${mid}" data-user="${esc(person.id)}" title="${esc(dressed ? t.clothedOn : t.clothedOff)}" aria-label="${esc(dressed ? t.clothedOn : t.clothedOff)}" aria-pressed="${dressed}"><ha-icon icon="${dressed ? "mdi:tshirt-crew" : "mdi:tshirt-crew-outline"}"></ha-icon></button>`
          : "";
        return `<tr><td class="when">${esc(this._when(row))}</td>${cells}
          <td class="actions">
            ${clothes}
            ${others ? `<button class="icon" data-action="move" data-mid="${mid}" data-user="${esc(person.id)}" title="${esc(t.move)}" aria-label="${esc(t.move)}"><ha-icon icon="mdi:account-switch-outline"></ha-icon></button>` : ""}
            ${canDelete ? `<button class="icon danger" data-action="remove" data-mid="${mid}" data-user="${esc(person.id)}" title="${esc(t.remove)}" aria-label="${esc(t.remove)}"><ha-icon icon="mdi:delete-outline"></ha-icon></button>` : ""}
          </td></tr>`;
      })
      .join("");
    let html = `<div class="table-wrap"><table>${head}${body}</table></div>`;
    if (rows.length > (Number(this._config.rows) || 10)) {
      html += `<div class="chips table-actions"><button class="chip small-chip toggle-chip muted-chip" data-action="expand"><ha-icon icon="${this._expanded ? "mdi:chevron-up" : "mdi:chevron-down"}"></ha-icon>${esc(this._expanded ? t.less : t.more)}</button></div>`;
    }
    return html;
  },
  _renderDialog() {
    const host = this.shadowRoot.querySelector(".dialog-host");
    if (!host) return;
    const dlg = this._dialog;
    if (!dlg) {
      host.innerHTML = "";
      return;
    }
    const t = this._t;
    const targets = dlg.targets
      ? `<div class="chips">${dlg.targets
          .map((p) => `<button class="chip" data-target="${esc(p.id)}">${esc(p.name)}</button>`)
          .join("")}</div>`
      : "";
    const input = dlg.input
      ? `<label class="dlg-input"><input type="number" inputmode="decimal" min="${dlg.input.min}" max="${dlg.input.max}" step="${dlg.input.step}"
          value="${esc(String(dlg.input.value))}"><span>${esc(dlg.input.unit)}</span></label>`
      : "";
    host.innerHTML = `<div class="backdrop"><div class="dialog" role="dialog" aria-modal="true">
        <p>${esc(dlg.text)}</p>${targets}${input}
        ${dlg.error ? `<p class="error">${esc(t.failed)} ${esc(dlg.error)}</p>` : ""}
        <div class="buttons">
          <button class="btn" data-dlg="cancel">${esc(t.cancel)}</button>
          ${dlg.run ? `<button class="btn primary ${dlg.danger ? "danger" : ""}" data-dlg="ok" ${dlg.busy ? "disabled" : ""}>${esc(dlg.confirm)}</button>` : ""}
        </div></div></div>`;
    host.querySelector(".backdrop").addEventListener("click", (ev) => {
      if (ev.target.classList.contains("backdrop")) this._closeDialog();
    });
    host.querySelector('[data-dlg="cancel"]').addEventListener("click", () => this._closeDialog());
    host.querySelectorAll("[data-target]").forEach((el) =>
      el.addEventListener("click", () => {
        const target = dlg.targets.find((p) => p.id === el.dataset.target);
        if (target) dlg.pick(target);
      })
    );
    const field = host.querySelector(".dlg-input input");
    if (field) {
      field.focus();
      field.select();
      field.addEventListener("input", () => { dlg.input.value = field.value; });
      field.addEventListener("keydown", (ev) => { if (ev.key === "Enter") host.querySelector('[data-dlg="ok"]')?.click(); });
    }
    const ok = host.querySelector('[data-dlg="ok"]');
    if (ok) {
      ok.addEventListener("click", async () => {
        dlg.busy = true;
        this._renderDialog();
        try {
          await dlg.run(dlg.input?.value);
          if (this._dialog === dlg) this._closeDialog();
        } catch (err) {
          dlg.busy = false;
          dlg.error = err?.message || String(err);
          if (this._dialog === dlg) this._renderDialog();
        }
      });
    }
  },
});
