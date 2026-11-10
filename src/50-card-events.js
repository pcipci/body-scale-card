/*
 * Module card-events: clicks and actions
 *
 * Binds the events after every render and handles every action (assign, move, delete,
 * filters, tabs, height edits, dialogs).
 */

mixin(BodyScaleCard, {
  // Private people: only their own Home Assistant user and administrators
  // see them (dashboard visibility, not access control).
  _mayView(person) {
    const user = this._hass.user;
    if (!person.private || !user) return true;
    return !!user.is_admin || (!!person.loginUserId && person.loginUserId === user.id);
  },
  // ------------------------------------------------------------- actions

  _bind() {
    this.shadowRoot.querySelectorAll("[data-action]").forEach((el) => {
      el.addEventListener("click", (ev) => {
        if (this._held) {
          this._held = false;
          return;
        }
        this._onAction(ev.currentTarget.dataset);
      });
    });
    // Holding a person key fills it with light, then opens the person's view;
    // let go earlier and it is an ordinary tap.
    this.shadowRoot.querySelectorAll(".person-keys .key[data-link]").forEach((el) => {
      let timer = null;
      const cancel = () => {
        clearTimeout(timer);
        timer = null;
        el.classList.remove("holding");
      };
      el.addEventListener("pointerdown", (ev) => {
        if (ev.button > 0) return;
        this._held = false;
        el.classList.add("holding");
        timer = setTimeout(() => {
          timer = null;
          this._held = true;
          el.classList.remove("holding");
          el.classList.add("held");
          setTimeout(() => this._onAction({ action: "open", path: el.dataset.link }), 150);
          setTimeout(() => el.classList.remove("held"), 700);
        }, HOLD_MS);
      });
      ["pointerup", "pointerleave", "pointercancel"].forEach((name) => el.addEventListener(name, () => timer && cancel()));
      el.addEventListener("contextmenu", (ev) => ev.preventDefault());
    });
    const field = this.shadowRoot.querySelector(".htable .hval input");
    if (field) {
      field.addEventListener("input", () => { if (this._heightRow) this._heightRow.v = field.value; });
      field.addEventListener("keydown", (ev) => {
        if (ev.key === "Enter") this._saveHeightRow();
        else if (ev.key === "Escape") this._onAction({ action: "hcancel" });
      });
    }
  },
  _onAction(d) {
    const t = this._t;
    if (d.action === "open") {
      // The person's view on this dashboard: same path, last part replaced.
      const path = window.location.pathname.replace(/[^/]*$/, d.path);
      window.history.pushState(null, "", path);
      window.dispatchEvent(new CustomEvent("location-changed", { detail: { replace: false } }));
    } else if (d.action === "tab") {
      this._selected = d.user;
      this._expanded = false;
      this._saveTab(d.user);
      this._render();
    } else if (d.action === "delheight") {
      const row = this._heightHistory(this._person(d.user) || {}).find((r) => r.at === d.at);
      const label = row ? `${new Date(row.t).toLocaleDateString(this._lang)} (${this._cm(row.v)})` : d.at;
      this._openDialog({
        text: t.confirmDelHeight(label, this._person(d.user)?.name),
        confirm: t.remove,
        danger: true,
        run: () => this._call("delete_height", { person_id: d.user, at: d.at }),
      });
    } else if (d.action === "height") {
      this._openHeight(d.user);
    } else if (d.action === "hadd" || d.action === "hedit") {
      const person = this._person(d.user);
      const row = d.at ? this._heightHistory(person || {}).find((r) => r.at === d.at) : null;
      this._heightRow = { user: d.user, at: d.at || null, v: row ? row.v : this._profileOf(person).heightCm ?? "" };
      this._render();
      this.shadowRoot.querySelector(".htable .hval input")?.focus();
    } else if (d.action === "hstep") {
      const v = this._heightInput() ?? Number(this._heightRow.v) ?? 0;
      this._heightRow.v = Math.min(250, Math.max(40, Math.round((v + Number(d.d)) * 2) / 2));
      const field = this.shadowRoot.querySelector(".htable .hval input");
      if (field) field.value = this._heightRow.v;
    } else if (d.action === "hcancel") {
      this._heightRow = null;
      this._render();
    } else if (d.action === "hsave") {
      this._saveHeightRow();
    } else if (d.action === "curves") {
      const person = this._person(this._selected);
      const views = person ? this._chartViews(person) : [];
      const view = views.includes(this._chartView) ? this._chartView : views[0];
      // Curves fade in and out and morph between WHO and DE; the scales stay.
      const fxBefore = this._fxCapture();
      if (d.ref && person) {
        const cur = this._curveState(person, view);
        // Plain on/off per button: the shown reference hides its curves, any
        // other button shows its own (one reference at a time).
        const next = cur.ref === d.ref && cur.on ? { ref: d.ref, on: false } : { ref: d.ref, on: true };
        this._curveStates = { ...(this._curveStates || {}), [view]: next };
        try {
          window.localStorage.setItem(`body-scale-card:curves2:${view}`, JSON.stringify(next));
        } catch (e) {
          /* private mode: not remembered */
        }
      } else {
        // Adults: the WHO ranges on or off.
        const mode = person ? this._curveMode(person, "bmi_percentile") : "ref";
        this._curves = mode === "off" ? "ref" : "off";
        try {
          window.localStorage.setItem("body-scale-card:curves-mode", this._curves);
        } catch (e) {
          /* private mode: not remembered */
        }
      }
      this._render();
      this._fxRun(fxBefore);
    } else if (d.action === "grid") {
      this._grid = !this._gridOn();
      this._saveFlag("grid-off", !this._grid);
      this._render();
    } else if (d.action === "growthon") {
      // Consent to load a growth table, kept per user.
      saveGlobalOptions(this._hass, { ...globalOptions.values, [`growth_${d.ref}`]: true }).catch((e) => console.warn("body-scale-card: saving failed", e));
    } else if (d.action === "comppct") {
      this._compPct = !this._compPctOn();
      this._saveFlag("comp-pct", this._compPct);
      this._render();
      // Two different drawings: fade the new one in instead of jumping.
      if (Element.prototype.animate && !window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) {
        this.shadowRoot.querySelectorAll("svg.chart, .chart-title").forEach((el) => el.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 300, easing: "ease-out" }));
      }
    } else if (d.action === "chartview") {
      this._chartView = d.view;
      this._render();
    } else if (d.action === "period") {
      this._period = d.period;
      this._render();
    } else if (d.action === "filter") {
      // any -> first value -> second value -> any
      const order = d.kind === "clothed" ? ["any", "no", "yes"] : ["any", "with", "without"];
      const f = this._filterNow();
      f[d.kind] = order[(order.indexOf(f[d.kind]) + 1) % order.length];
      this._filter = f;
      this._expanded = false;
      this._render();
    } else if (d.action === "clothed") {
      // Clothes are set afterwards by storing the same weighing again (it replaces
      // the entry at that time).
      const row = this._person(d.user)?.rows.find((r) => r.measurement_id === d.mid);
      if (row && row.weight != null) {
        Promise.resolve(this._call("set_entry", {
          person_id: d.user, at: row.at, weight: Number(row.weight),
          ...(row.impedance ? { impedance: Number(row.impedance) } : {}), clothed: !row.clothed,
        })).catch((err) => this._openDialog({ text: `${t.failed} ${err?.message || err}` }));
      }
    } else if (d.action === "legend") {
      this._legendOpen = !this._legendOpen;
      this._render();
    } else if (d.action === "how") {
      this._howOpen = !this._howOpen;
      this._render();
    } else if (d.action === "clegend") {
      this._chartLegendOpen = !this._chartLegendOpen;
      this._render();
    } else if (d.action === "info") {
      this._infoOpen = !(this._infoOpen ?? this._restoreFlag("info"));
      this._saveFlag("info", this._infoOpen);
      this._render();
    } else if (d.action === "glance") {
      // Jump to the values; a symbol also opens its tile.
      if (d.metric) this._openMetric = d.metric;
      this._render();
      const target = this.shadowRoot.querySelector(d.metric ? `.val[data-metric="${d.metric}"]` : ".vals");
      target?.scrollIntoView({ behavior: "smooth", block: "center" });
    } else if (d.action === "metric") {
      this._openMetric = this._openMetric === d.metric ? null : d.metric;
      this._render();
    } else if (d.action === "how") {
      this._howOpen = !(this._howOpen ?? this._restoreFlag("how"));
      this._saveFlag("how", this._howOpen);
      this._render();
    } else if (d.action === "expand") {
      this._expanded = !this._expanded;
      this._render();
    } else if (d.action === "assign") {
      const p = this._data.pending.find((x) => x.measurement_id === d.mid);
      const label = p ? this._pendingLabel(p) : d.mid;
      this._openDialog({
        text: t.confirmAssign(label, this._person(d.user)?.name),
        confirm: t.assign,
        run: () => this._call("assign_measurement", { measurement_id: d.mid, person_id: d.user }),
      });
    } else if (d.action === "hist") {
      const i = Number(d.i);
      // The choice stays as it is; after the history view the display returns to it.
      this._hist = this._hist === i ? null : i;
      clearTimeout(this._histTimer);
      if (this._hist) {
        this._histAt = Date.now();
        this._histTimer = setTimeout(() => {
          this._hist = null;
          this._render();
        }, this._histHold());
      }
      this._render();
    } else if (d.action === "next") {
      // Choosing a key or person ends the history view.
      this._hist = null;
      clearTimeout(this._histTimer);
      // Whatever a key was showing ends with the tap; the new choice starts from zero.
      this._clickAt = Date.now();
      this._autoWake = this._data.next && d.option === this._data.next.attributes.options[0] ? this._clickAt : 0;
      this._lastChoice = null;
      const isHold = d.option === t.hold;
      this._hold = null;
      this._holdResult = null;
      if (this._data.next) {
        // A key switches to its mode; pressing the lit one again changes nothing
        // (automatic has a key of its own).
        const nx = this._data.next, cm = Number(this._config.choice_minutes);
        const person = this._data.people.find((x) => x.name === d.option);
        const kind = d.option === nx.attributes.options[0] ? "auto" : d.option === nx.attributes.options[1] || isHold ? "guest" : person?.id;
        const option = isHold ? nx.attributes.options[1] : d.option;
        this._choice = { option, at: Date.now() };
        if (isHold) this._holdStart(this._data);
        // With choice_minutes the card hands the duration of the choice to the integration.
        const send = this._setNext(nx, kind, option, cm);
        Promise.resolve(send)
          .catch((err) => {
            this._choice = null;
            this._render();
            this._openDialog({ text: `${t.failed} ${err?.message || err}` });
          });
      }
      this._render();
    } else if (d.action === "baby-dismiss") {
      this._clickAt = Date.now();
      this._render();
    } else if (d.action === "baby-assign") {
      this._openDialog({
        text: t.confirmBaby(d.w, this._person(d.user)?.name),
        confirm: t.babySave,
        run: async () => {
          await this._call("set_entry", { person_id: d.user, at: d.ts, weight: Number(d.raw) });
          this._holdResult = null;
          this._clickAt = Date.now();
        },
      });
    } else if (d.action === "discard") {
      const p = this._data.pending.find((x) => x.measurement_id === d.mid);
      this._openDialog({
        text: t.confirmDiscard(p ? this._pendingLabel(p) : d.mid),
        confirm: t.discardShort,
        danger: true,
        run: () => this._call("discard_measurement", { measurement_id: d.mid }),
      });
    } else if (d.action === "move") {
      const label = this._rowLabel(d.user, d.mid);
      this._openDialog({
        text: t.pickTarget(label),
        targets: this._data.people.filter((p) => p.id !== d.user),
        pick: (target) => {
          this._openDialog({
            text: t.confirmMove(label, this._person(d.user)?.name, target.name),
            confirm: t.move,
            run: async () => {
              // Moving = the same weighing for the other person (their profile
              // computes the body values), then removing it from the first.
              const row = this._person(d.user)?.rows.find((r) => r.measurement_id === d.mid);
              if (!row || row.weight == null) throw new Error("entry not found");
              await this._call("set_entry", {
                person_id: target.id, at: row.at, weight: Number(row.weight),
                ...(row.impedance ? { impedance: Number(row.impedance) } : {}),
                ...(row.clothed ? { clothed: true } : {}),
              });
              await this._call("delete_entry", { person_id: d.user, entry_id: d.mid });
            },
          });
        },
      });
    } else if (d.action === "remove") {
      this._openDialog({
        text: t.confirmRemove(this._rowLabel(d.user, d.mid), this._person(d.user)?.name),
        confirm: t.remove,
        danger: true,
        run: () => this._call("delete_entry", { person_id: d.user, entry_id: d.mid }),
      });
    }
  },
  _openHeight(userId) {
    const t = this._t;
    const person = this._person(userId);
    if (!person) return;
    const cm = this._profileOf(person).heightCm;
    this._openDialog({
      text: t.heightAsk(person.name),
      input: { value: cm ?? "", min: 40, max: 250, step: 0.5, unit: "cm" },
      confirm: t.save,
      run: (value) => {
        const v = Number(String(value).replace(",", "."));
        if (!(v >= 40 && v <= 250)) throw new Error(t.heightRange);
        return this._call("set_height", { person_id: userId, cm: v });
      },
    });
  },
  _heightInput() {
    const field = this.shadowRoot.querySelector(".htable .hval input");
    const v = field ? Number(String(field.value).replace(",", ".")) : NaN;
    return field && field.value !== "" && !Number.isNaN(v) ? v : null;
  },
  async _saveHeightRow() {
    const row = this._heightRow;
    if (!row || row.busy) return;
    const v = this._heightInput();
    row.v = v ?? row.v;
    if (!(v >= 40 && v <= 250)) {
      row.error = this._t.heightRange;
      this._render();
      return;
    }
    row.busy = true;
    row.error = null;
    try {
      await this._call("set_height", { person_id: row.user, cm: v, ...(row.at ? { at: row.at } : {}) });
      if (this._heightRow === row) this._heightRow = null;
    } catch (err) {
      row.busy = false;
      row.error = `${this._t.failed} ${err?.message || err}`;
    }
    this._render();
  },
  _openDialog(dialog) {
    this._dialog = { ...dialog, error: null, busy: false };
    this._renderDialog();
  },
  _closeDialog() {
    this._dialog = null;
    this._renderDialog();
  },
});
