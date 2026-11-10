/*
 * Module card-scale: the scale device
 *
 * The scale as a device: display, mode keys, person keys, preselection timers, the
 * history digits, the glide animation and the key layout.
 */

mixin(BodyScaleCard, {
  // Brightness of an active inverted field, percent of the LED colour (20 to 100, default 65).
  _invBrightness() {
    const v = Number(this._config?.invert_brightness);
    return v >= 20 && v <= 100 ? v : 65;
  },
  // Choose who steps on next (`kind` is auto, guest or a person_id).
  _setNext(nx, kind, option, minutes) {
    return this._call("set_next_user", { choice: kind, ...(minutes > 0 ? { minutes } : {}) });
  },
  _runGlide() {
    // Move each series from its old scale into the new one; curves fade in.
    const before = this._glide, after = this._scales;
    this._glide = null;
    const svg = this.shadowRoot.querySelector("svg.chart");
    if (!before || !after || !svg) return;
    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches || !Element.prototype.animate) return;
    const ease = { duration: 300, easing: "ease-out" };
    for (const side of ["left", "right"]) {
      const from = before[side], to = after[side];
      if (!from || !to || from.key !== to.key || from.h !== to.h) continue;
      const k = (to.v1 - to.v0) / (from.v1 - from.v0);
      const dy = to.top + ((from.v1 - to.v1) / (from.v1 - from.v0)) * to.h - k * to.top;
      if (Math.abs(k - 1) < 1e-3 && Math.abs(dy) < 0.5) continue;
      const sel = side === "left" ? ".line.left, .dot.left, .last.left, .area" : ".line.right, .dot.right, .last.right";
      svg.querySelectorAll(sel).forEach((el) => {
        el.style.transformOrigin = "0 0";
        el.animate([{ transform: `translate(0px, ${dy}px) scale(1, ${k})` }, { transform: "none" }], ease);
      });
    }
    svg.querySelectorAll(".guide, .band-line, .band-median, .axis").forEach((el) => el.animate([{ opacity: 0 }, { opacity: 1 }], ease));
  },
  // Baby / pet mode, kept in the card: the integration is set to Guest; the
  // first new guest reading is the carrier alone (base), the second the
  // carrier with the baby; the difference is the result. Guest readings the
  // mode used up never show as guest results.
  _holdStart(data) {
    this._holdUsed = new Set(this._holdUsed || []);
    if (data.guest?.timestamp) this._holdUsed.add(data.guest.timestamp);
    this._hold = { stage: 1, base: null, at: Date.now() };
  },
  _holdAdvance(data, next, guest) {
    const used = (this._holdUsed = this._holdUsed || new Set());
    const g = data.guest;
    const h = this._hold;
    if (h) {
      const lost = next.state !== guest && Date.now() - h.at > 4000;
      const old = Date.now() - h.at > (Number(this._config.choice_minutes) > 0 ? Number(this._config.choice_minutes) : Number(next.attributes.timeout_minutes) || 5) * 60000 + 4000;
      if (lost || old) this._hold = null;
    }
    if (this._hold && g && g.timestamp && !used.has(g.timestamp)) {
      const hh = this._hold;
      used.add(g.timestamp);
      if (hh.stage === 1) {
        hh.base = { timestamp: g.timestamp, weight: Number(g.weight), impedance: g.impedance };
        hh.stage = 2;
        hh.at = Date.now();
        // Arm the guest again for the second weighing.
        const cm = Number(this._config.choice_minutes);
        Promise.resolve(this._setNext(next, "guest", guest, cm)).catch(() => {});
      } else {
        // Order does not matter (with the baby first or second): heavy minus light.
        const a = Number(g.weight), b = hh.base.weight;
        const total = Math.max(a, b), base = Math.min(a, b);
        const diff = Math.round((total - base) * 100) / 100;
        this._holdResult = { timestamp: g.timestamp, weight: diff, total, base, same: diff < 0.1 };
        this._hold = null;
      }
    }
    if (g && used.has(g.timestamp)) data.guest = null;
  },
  // The scale as a device: the display shows the latest weighing and what
  // happens next; the two mode keys under it and the person keys choose the
  // mode. A key that is armed is pressed again to go back to "automatic".
  // Display and keys keep their places in every state.
  _renderNext(data, t) {
    const next = data.next;
    if (!next || !Array.isArray(next.attributes?.options)) return "";
    // Fixed choices first (automatic, guest, then the people). Baby/pet is a mode
    // of the card itself: two guest readings, the difference is the result.
    const [auto, guest] = next.attributes.options;
    const holdLabel = this._can("guest") && this._can("set_entry") ? t.hold : "";
    const names = this._ordered(next.attributes.options.slice(2), data);
    this._holdAdvance(data, next, guest);
    // A tap counts at once (before Home Assistant has answered), so nothing of the
    // previous choice or result is carried over.
    const choice = this._choice;
    const optimistic = !!choice && Date.now() - choice.at < 3000 && choice.option !== next.state;
    if (choice && !optimistic) this._choice = null;
    clearTimeout(this._optTimer);
    if (optimistic) this._optTimer = setTimeout(() => this._render(), 3100);
    let current = optimistic ? choice.option : next.state;
    // While the card runs the baby/pet mode the integration waits for a guest.
    if (this._hold && current === guest) current = holdLabel;
    // A choice that has run out counts as Automatik from then on (same time again).
    const vu = Date.parse(next.attributes.valid_until || "");
    if (current !== next.attributes.options[0] && !optimistic && !Number.isNaN(vu)) {
      if (Date.now() < vu) this._lastChoice = { end: vu, start: Date.parse(next.last_changed) || 0 };
      else current = next.attributes.options[0];
    }
    const modes = [[guest, t.guest], [auto, t.auto], ...(holdLabel ? [[holdLabel, t.hold]] : [])];
    // Person keys with a view to jump to: holding the key opens it.
    const links = this._config.links || {};
    const linkOf = (option) => {
      const p = data.people.find((x) => x.name === option);
      return p && links[p.id] ? links[p.id] : "";
    };
    const hold = (option) => (linkOf(option) ? ` data-link="${esc(linkOf(option))}"` : "");
    const tip = (option, label) => (linkOf(option) ? `${label} · ${t.holdOpen}` : label);
    const ringOn = this._timerModes().has("ring");
    const key = (option, label, inner, cls = "") => {
      // The three mode keys stay neutral (like unlit keys): the symbol in the display
      // shows the state and the time. Only person keys light up.
      const isMode = cls !== "person";
      const on = option === lit && !isMode;
      const timed = on && end != null;
      const ring = timed && ringOn && cls === "person"
        ? `<svg class="ring" preserveAspectRatio="none" aria-hidden="true"><path/></svg>` : "";
      const title = tip(option, label) + (timed && until ? ` · ${until}` : "");
      return `<button class="key ${cls} ${on ? "on" : ""}" data-action="next" data-option="${esc(option)}"${timed ? ` data-end="${end}" data-start="${start}"` : ""}${hold(option)} title="${esc(title)}" aria-label="${esc(label)}" aria-pressed="${option === lit}">${inner}${ring}</button>`;
    };

    // The latest events: a person's weighing, guest, baby/pet, unclear reading.
    const people = data.people.filter((p) => p.visible);
    const stage = this._hold && current === holdLabel ? this._hold.stage : 0;
    const events = [];
    const latest = people
      .map((p) => ({ p, row: p.rows[0] }))
      .filter((x) => x.row && x.row.weight != null)
      .sort((a, b) => (Date.parse(b.row.timestamp) || 0) - (Date.parse(a.row.timestamp) || 0))[0];
    if (latest) events.push({ kind: "person", ts: latest.row.timestamp, weight: latest.row.weight, ohm: latest.row.impedance, person: latest.p, replaced: latest.row.replaced, idx: 0 });
    if (data.guest) events.push({ kind: "guest", ts: data.guest.timestamp, weight: data.guest.weight, ohm: data.guest.impedance });
    if (this._holdResult) events.push({ kind: "hold", ts: this._holdResult.timestamp, weight: this._holdResult.weight, hold: this._holdResult });
    const base = this._hold?.base;
    if (stage === 2 && base) events.push({ kind: "base", ts: base.timestamp, weight: base.weight, ohm: base.impedance });
    // The newest unclear reading, unless it may belong to someone this viewer can't see.
    const open = data.pending[0];
    const candidates = open ? (open.candidates || []).map((id) => data.people.find((x) => x.id === id)).filter(Boolean) : [];
    // Only the suggested person (nearest by last weight) blinks, with the guest key (discard).
    // Blinking: the integration's suggestion plus everybody whose last weight lies
    // within blink_tolerance_kg (default 2) of the reading.
    const tol = this._opt("blink_tolerance_kg") != null && Number(this._opt("blink_tolerance_kg")) >= 0 ? Number(this._opt("blink_tolerance_kg")) : 2;
    const suggestedIds = open ? new Set(open.suggested?.length ? open.suggested : open.candidates || []) : new Set();
    if (open && Number(open.weight) > 0) {
      for (const p of data.people) {
        const last = Number(p.rows[0]?.weight);
        if (last > 0 && Math.abs(last - Number(open.weight)) <= tol) suggestedIds.add(p.id);
      }
    }
    const suggested = open ? [...suggestedIds].map((id) => data.people.find((x) => x.id === id)).filter(Boolean) : [];
    if (open && candidates.every((x) => x.visible)) {
      events.push({ kind: "open", ts: open.timestamp, weight: open.weight, ohm: open.resistance_1, open, candidates, suggested });
    }
    let ev = events.sort((a, b) => (Date.parse(b.ts) || 0) - (Date.parse(a.ts) || 0))[0] || null;
    const lc = this._lastChoice;
    if (lc && current === auto && !optimistic && Date.now() >= lc.end) {
      // Not used up by a reading since the choice: Automatik is active from the end of it.
      if (!(ev && (Date.parse(ev.ts) || 0) > lc.start)) this._autoWake = lc.end;
      this._lastChoice = null;
    }
    // A tap on any key ends the result shown (an unclear reading stays).
    const clickAt = this._clickAt || 0;
    if (ev && ev.kind !== "open" && clickAt > (Date.parse(ev.ts) || 0)) ev = null;
    // A key pressed after the last reading: ready, like a real scale
    // (00.00 and the chosen name); an older reading never gets their name.
    // A tap on Automatik wakes the display like the other keys (00.00, lit) for display_hold minutes.
    const holdMs = (Number(this._config.display_hold) > 0 ? Number(this._config.display_hold) : 5) * 60000;
    // Same time as a choice of any other key: the integration's setting.
    const cfgMin = Number(this._config.choice_minutes);
    const wakeMs = (cfgMin > 0 ? cfgMin : Number(next.attributes.timeout_minutes) > 0 ? Number(next.attributes.timeout_minutes) : 5) * 60000;
    // Automatic chosen on any view (the integration stamps it) wakes this one, too.
    const autoSel = current === auto && !optimistic ? Date.parse(next.attributes.auto_selected_at || "") : NaN;
    const autoWake = Math.max(this._autoWake || 0, Number.isNaN(autoSel) ? 0 : autoSel);
    const wakeAt = current === auto && autoWake && Date.now() < autoWake + wakeMs ? autoWake : 0;
    const waiting = people.find((p) => p.name === current) ? "person" : current === guest ? "guest" : stage === 1 ? "hold" : wakeAt ? "auto" : null;
    const since = Math.max(Date.parse(next.last_changed) || 0, clickAt, wakeAt);
    const ready = !!waiting && (!ev || since > (Date.parse(ev.ts) || 0));
    if (ready) ev = null;
    this._shownPending = ev?.kind === "open" ? ev.open.measurement_id : null;

    // Time left: until the choice runs out, or until the result is put away
    // (display_hold minutes after the reading). An unclear reading stays.
    const validUntil = Date.parse(next.attributes.valid_until || "");
    let end = null, start = null;
    if (ev?.kind !== "open") {
      if ((ready || stage === 2) && current !== auto && !Number.isNaN(validUntil) && !optimistic) {
        end = validUntil;
        start = Date.parse(next.last_changed) || end - holdMs;
      } else if (ev) {
        start = Date.parse(ev.ts) || 0;
        end = start + holdMs;
      } else if (ready && wakeAt) {
        start = wakeAt;
        end = wakeAt + wakeMs;
      }
    }
    const idle0 = ev?.kind !== "open" && ((end != null && end - Date.now() <= 0) || (!ready && !ev));
    if (idle0) end = null;

    // History: the ten newest readings of all visible people.
    const list = this._histList(data);
    const key0 = list[0]?.row.timestamp || "";
    if (this._histKey !== key0) {
      this._histKey = key0;
      this._hist = null;
    }
    if (this._hist && !list[this._hist - 1]) this._hist = null;
    const h = this._hist ? list[this._hist - 1] : null;
    // A reading called up from the history is never idle.
    const idle = idle0 && !h;
    let shown = idle ? null : ev;
    if (h) {
      shown = { kind: "person", ts: h.row.timestamp, weight: h.row.weight, ohm: h.row.impedance, person: h.p, replaced: h.row.replaced, idx: h.i };
      end = null;
    }
    // The mode is only shown while nothing is displayed: not with a result, an old
    // reading from the history or an open reading (their keys show who it is).
    const modeOpt = h || shown ? null : current;
    // The key that is lit: the person or mode of the reading shown, else the choice.
    // Lit = active now (a result of it, or the scale waiting for it); framed =
    // the mode that is set (automatic when nothing is chosen). Idle: all dim, automatic framed.
    let lit = null;
    if (h) lit = h.p.name;
    else if (shown?.kind === "person") lit = shown.person.name;
    else if (shown?.kind === "guest") lit = guest;
    else if (shown?.kind === "hold" || shown?.kind === "base") lit = holdLabel;
    else if (ready) lit = current;

    const icon = (i) => `<ha-icon icon="${i}"></ha-icon>`;
    const val = (row, m) => (row && row[m] != null && row[m] !== "" && !Number.isNaN(Number(row[m])) ? Number(row[m]) : null);
    const arrow = (now, prev, digits) => {
      if (now == null || prev == null) return "";
      const d = Number((now - prev).toFixed(digits));
      return `<span class="d-ar">${d > 0 ? "▲" : d < 0 ? "▼" : "▬"}</span>`;
    };
    const algos = infoText(this._lang).algos;

    // Whose reading it is: the weighed person, else the one chosen.
    const chosen = people.find((p) => p.name === current);
    const who = shown?.kind === "person" ? shown.person : !shown && ready && chosen ? chosen : null;
    const prof = who ? this._profileOf(who) : null;

    // Left part of the values row: BMI (children: percentile) and fat; the
    // fat only when measured with impedance. Trend beside kg.
    const measured = Number(shown?.ohm) > 0;
    let trend = "";
    let leftHtml = "";
    if (shown?.kind === "person") {
      const rows = shown.person.rows || [];
      const row = rows[shown.idx], prev = rows[shown.idx + 1];
      const w0 = val(row, "weight"), w1 = val(prev, "weight");
      if (w0 != null && w1 != null) {
        const d = Number((w0 - w1).toFixed(1));
        trend = `${d > 0 ? "▲" : d < 0 ? "▼" : "▬"}${d ? this._lcd(Math.abs(d), 1) : ""}`;
      }
      let bmi = "--.-";
      let bmiLabel = t.chartLabels.body_mass_index;
      if (prof.minor && prof.percentile != null) {
        const [p0, p1] = this._pctAt(shown.person, prof, shown.ts);
        const p = p0 != null ? p0 : h ? null : prof.percentile;
        bmi = p != null ? `P${this._lcd(p, 0)}${arrow(p0, p1, 0)}` : "P--";
        bmiLabel = t.chartLabels.bmi_percentile;
      } else if (val(row, "body_mass_index") != null) {
        bmi = `${this._lcd(val(row, "body_mass_index"), 1)}${arrow(val(row, "body_mass_index"), val(prev, "body_mass_index"), 1)}`;
      }
      leftHtml = `<span class="d-val" title="${esc(bmiLabel)}">${icon("body_scale:bmi")}${bmi}</span>`;
      if (measured) {
        const f0 = val(row, "body_fat_percentage");
        const fat = f0 != null ? `${this._lcd(f0, 1)}%${arrow(f0, val(prev, "body_fat_percentage"), 1)}` : "--.-%";
        leftHtml += `<span class="d-val" title="${esc(t.chartLabels.body_fat_percentage)}">${icon("body_scale:body-fat")}${fat}</span>`;
      }
    } else if (shown?.kind === "hold" && shown.hold.base != null) {
      leftHtml = `<span class="d-sum"${shown.hold.same ? ` title="${esc(t.holdSame)}"` : ""}>${shown.hold.same ? icon("mdi:alert-outline") : ""}${this._w2(shown.hold.total)} − ${this._w2(shown.hold.base)}</span>`;
    } else if (stage) {
      leftHtml = `<span class="d-steps" title="${esc(t.holdSteps[stage - 1] || `${stage}/2`)}"><span class="hs ${stage === 1 ? "now" : ""}">${icon("mdi:account")}</span><span class="ar">→</span>` +
        `<span class="hs ${stage === 2 ? "now" : ""}">${icon("mdi:account")}<span class="pl">+</span>${icon("mdi:baby-face-outline")}${icon("mdi:paw")}</span></span>`;
    }

    // Right block: three slots of equal width: replaced · athlete · method
    // (or "not stored" in place of the method).
    const nosave = !h && (["guest", "hold", "base"].includes(shown?.kind) || (ready && (waiting === "guest" || waiting === "hold")) || stage > 0);
    const slot = (inner, title) => `<span class="d-sl"${inner && title ? ` title="${esc(title)}"` : ""}>${inner || ""}</span>`;
    const methodTitle = prof ? [algos[prof.alternative ? "alternative" : "standard"][0], prof.athlete && algos.athlete[0]].filter(Boolean).join(" + ") : "";
    const cluster = `<span class="d-cl">${slot(shown?.kind === "person" && !h && shown.replaced ? icon("mdi:sync") : "", t.replaced)}` +
      `${slot(prof?.athlete ? icon("mdi:weight-lifter") : "", algos.athlete[0])}` +
      `${prof ? slot(methodMark(prof.alternative ? 2 : 1), methodTitle) : nosave ? slot(icon("mdi:content-save-off-outline"), t.guestNote) : slot("")}</span>`;

    // Weight on the scale's 0.05 raster; the other lines dim when idle.
    const wTxt = shown ? this._w2(shown.weight) : ready ? "00.00" : "--.--";
    const [wa, wb] = (wTxt || "--.--").split(".");
    const ohmHtml = idle ? "" : shown && measured ? `${this._lcd(shown.ohm, 0)}<span class="d-u">Ω</span>` : shown?.kind === "person" ? `<span title="${esc(t.noImpedance)}">${icon("mdi:shoe-sneaker")}</span>` : "";
    const two = (n) => String(n).padStart(2, "0");
    let date = "", time = "";
    if (h) {
      const d = new Date(h.row.timestamp);
      if (!Number.isNaN(d.getTime())) {
        date = `${two(d.getDate())}.${two(d.getMonth() + 1)}`;
        time = `${two(d.getHours())}:${two(d.getMinutes())}`;
      }
    }
    const until = !h && !Number.isNaN(validUntil) && current !== auto
      ? t.until(new Date(validUntil).toLocaleTimeString(this._lang, { hour: "2-digit", minute: "2-digit" })) : "";
    const kgTrend = shown?.kind === "person" && !h ? trend : "";
    const side = `<div class="d-side ${idle ? "dim" : ""}"><div class="d-l"><div class="d-s">${ohmHtml}</div><div class="d-zn">${date ? `<span class="d-dt">${date}</span>` : ""}</div></div>` +
      `<div class="d-l d-l2"><div class="d-kgl">${idle ? "" : "kg"}<span class="d-tr" title="${esc(t.sincePrevious)}">${kgTrend}</span></div><div class="d-zn">${time ? `<span class="d-dt">${time}</span>` : ""}</div></div></div>`;

    // An unclear reading: any person key assigns it, the guest key keeps it as a guest's.
    const openId = ev?.kind === "open" ? ev.open.measurement_id : null;
    const candNames = new Set(ev?.kind === "open" ? ev.suggested.map((x) => x.name) : []);
    const candList = ev?.kind === "open" ? ev.suggested.map((x) => x.name) : [];
    // The guest key blinks in turn: choosing it keeps the reading as a guest's (not assigned).
    // A baby/pet result: the babies' keys blink in turn with the guest key.
    const babyPeople = shown?.kind === "hold" && !h && !shown.hold.same && this._can("set_entry") ? people.filter((x) => x.isBaby) : [];
    const babyList = babyPeople.map((x) => x.name);
    const blink = openId ? [...candList, guest] : babyList.length ? [...babyList, guest] : [];
    // Last row: the three modes as symbols, each above its slim key.
    const cycle = (i, n) => (n > 1 ? `style="animation: rs${n} ${n}s step-end infinite; animation-delay: -${(n - i) % n}s"` : "");
    const shorts = initials(names);
    const mode = (opt, i, title) => {
      const blinking = blink.length && opt === guest;
      const timed = lit === opt && end != null;
      return `<span class="d-m ${opt === modeOpt ? "mode" : ""} ${lit === opt ? "on" : ""} ${blinking ? "cand cyc" : ""}"${timed ? ` data-end="${end}" data-start="${start}"${opt === auto ? " data-auto" : ""}` : ""} ${blinking ? cycle(blink.length - 1, blink.length) : ""} title="${esc(title + (timed && until ? ` · ${until}` : ""))}">${i}</span>`;
    };
    const bottom = `<div class="d-bot" style="--m:${modes.length}">${mode(guest, icon("mdi:account-question-outline"), t.guest)}${mode(auto, icon("mdi:account-search-outline"), t.auto)}` +
      (holdLabel ? mode(holdLabel, icon("mdi:baby-face-outline") + icon("mdi:paw"), t.hold) : "") + `</div>`;
    const hist = `<div class="d-hist ${idle ? "off" : ""}">${[...Array(10).keys()].map((k) => {
      const i = k + 1, row = list[k];
      return row
        ? `<span class="${this._hist === i ? "cur" : ""}" data-action="hist" data-i="${i}" role="button" tabindex="0" title="${esc(this._when(row.row))}">${i}</span>`
        : `<span class="none">${i}</span>`;
    }).join("")}</div>`;

    // An unclear reading: any person key assigns it, the guest key discards it.

    const keyFor = (option, label, inner, cls = "") => {
      if (openId && option === guest) {
        return `<button class="key ${cls} cand cyc" ${cycle(blink.length - 1, blink.length)} data-action="discard" data-mid="${esc(openId)}" title="${esc(t.discard)}" aria-label="${esc(t.discard)}">${inner}</button>`;
      }
      if (babyList.length && option === guest) {
        return `<button class="key ${cls} cand cyc" ${cycle(blink.length - 1, blink.length)} data-action="baby-dismiss" title="${esc(t.babyDismiss)}" aria-label="${esc(t.babyDismiss)}">${inner}</button>`;
      }
      const baby = babyList.indexOf(option);
      if (baby >= 0) {
        const bp = babyPeople[baby];
        return `<button class="key ${cls} cand cyc" ${cycle(baby, blink.length)} data-action="baby-assign" data-user="${esc(bp.id)}" data-w="${esc(this._w2(shown.weight))}" data-raw="${esc(shown.weight)}" data-ts="${esc(shown.ts)}"${hold(option)} title="${esc(tip(option, label))}" aria-label="${esc(label)}">${inner}</button>`;
      }
      const person = openId && data.people.find((x) => x.name === option);
      if (person) {
        const i = candList.indexOf(option);
        return `<button class="key ${cls} ${candNames.has(option) ? "cand cyc" : ""}" ${i >= 0 ? cycle(i, blink.length) : ""} data-action="assign" data-mid="${esc(openId)}" data-user="${esc(person.id)}"${hold(option)} title="${esc(tip(option, label))}" aria-label="${esc(label)}">${inner}</button>`;
      }
      return key(option, label, inner, cls);
    };
    const modeKeys2 = modes.map(([o, label]) => keyFor(o, label, "")).join("");
    const personKeys2 = names.map((n, i) => keyFor(n, n, `<span class="full">${esc(n)}</span><span class="short">${esc(shorts[i])}</span>`, "person")).join("");
    const n = blink.length;
    const frames = n > 1 ? `<style>@keyframes rs${n} { 0% { opacity: 1; } ${(100 / n).toFixed(2)}% { opacity: 0.25; } 100% { opacity: 0.25; } }</style>` : "";
    return `<section class="device-wrap">${frames}<div class="device ${this._config.skin === "theme" ? "theme" : ""} ${this._config.invert_modes === true ? "inv-modes" : ""} ${this._config.invert_history === true ? "inv-hist" : ""} ${this._config.mode_field_width === "wide" ? "fw-wide" : ""}" style="--inv: ${this._invBrightness()}" role="group" aria-label="${esc(t.next)}">
        <div class="device-top">
          <div class="display" aria-live="off">
            ${hist}
            <div class="d-wrow"><div class="d-weight ${idle ? "dim" : ""}">${wa}<span class="dp"><i></i></span>${wb}</div>${side}</div>
            <div class="d-row"><span class="d-vv">${leftHtml}</span>${cluster}</div>
            ${bottom}
          </div>
          <div class="mode-keys">${modeKeys2}</div>
        </div>
        <div class="person-keys" style="--n:${names.length}">${personKeys2}</div>
        <div class="feet"><span></span><span></span></div>
      </div></section>`;
  },
  // The ten newest readings of all visible people (no guest, no baby/pet).
  _histList(data) {
    const out = [];
    for (const p of data.people.filter((x) => x.visible)) {
      (p.rows || []).forEach((row, i) => {
        if (row.weight != null) out.push({ p, row, i });
      });
    }
    return out.sort((a, b) => (Date.parse(b.row.timestamp) || 0) - (Date.parse(a.row.timestamp) || 0)).slice(0, 10);
  },
  // How long a reading called up from the history stays (seconds in the option).
  _histHold() {
    const v = Number(this._config?.history_hold);
    return (v > 0 ? v : 30) * 1000;
  },
  // How the lit key shows the time left: key_timer = frame (default: thick frame
  // that thins to the normal one), ring (outline runs back), fade (key darkens),
  // all, none; combinable with commas. The old key_timer_ring / key_timer_fade
  // switch the ring / fading on when set to true.
  _timerModes() {
    const c = this._config || {};
    if (c.key_timer != null) {
      const set = new Set(String(c.key_timer).split(/[\s,+]+/).filter(Boolean));
      if (set.has("all")) return new Set(["frame", "ring", "fade"]);
      if (set.has("none")) return new Set();
      return set;
    }
    const m = new Set(["frame"]);
    if (c.key_timer_ring === true) m.add("ring");
    if (c.key_timer_fade === true) m.add("fade");
    return m;
  },
  // The lit key shows the time left by itself, without numbers: its outline
  // runs back and it fades (each can be switched off with key_timer_ring /
  // key_timer_fade), and it blinks in the last minute. Everything is derived
  // from the end time, so a redraw never restarts it.
  _armKeyTimer() {
    clearTimeout(this._keyTimer);
    (this._keyAnims || []).forEach((a) => a.cancel());
    this._keyAnims = [];
    // The history number called up fades over the time it stays.
    const cur = this.shadowRoot.querySelector(".d-hist span.cur");
    if (cur && this._hist && Element.prototype.animate) {
      const hl = this._histAt + this._histHold() - Date.now();
      if (hl > 0) this._keyAnims.push(cur.animate([{ opacity: 1 }, { opacity: 0.5 }], { duration: hl, easing: "linear", fill: "forwards" }));
    }
    const el = this.shadowRoot.querySelector(".device .key[data-end], .device .d-m[data-end]");
    if (!el) return;
    const symbol = el.classList.contains("d-m");
    const end = Number(el.dataset.end), start = Number(el.dataset.start);
    const now = Date.now(), total = Math.max(1, end - start), left = end - now;
    if (left <= 0) {
      this._render();
      return;
    }
    const elapsed = total - left;
    const modes = symbol ? new Set() : this._timerModes();
    this._keyRO?.disconnect();
    if (Element.prototype.animate && modes.has("frame")) {
      // The frame starts thick and thins out to the normal one over the time left.
      const cs = getComputedStyle(el);
      const led = cs.getPropertyValue("--led").trim() || cs.color;
      const glow = cs.getPropertyValue("--glow").trim() || "transparent";
      const sh = (px) => `inset 0 0 0 ${px.toFixed(2)}px ${led}, 0 0 8px ${glow}`;
      const opts = { duration: left, easing: "linear", fill: "forwards" };
      this._keyAnims.push(el.animate([{ boxShadow: sh(1 + 2 * (left / total)) }, { boxShadow: sh(1) }], opts));
    }
    if (Element.prototype.animate) {
      const ring = el.querySelector(".ring path");
      if (ring && !(el.clientWidth > 0 && el.clientHeight > 0)) {
        // Not laid out yet (hidden view, first draw): draw the ring once it has a size.
        if (window.ResizeObserver) {
          this._keyRO = new ResizeObserver(() => {
            if (el.clientWidth > 0) {
              this._keyRO.disconnect();
              this._armKeyTimer();
            }
          });
          this._keyRO.observe(el);
        }
      } else if (ring) {
        // Drawn in real pixels, always from the top centre clockwise, so every
        // browser starts at the same place.
        const w = el.clientWidth, h = el.clientHeight, r = 9, x0 = 1.2, y0 = 1.2, x1 = w - 1.2, y1 = h - 1.2, m = w / 2;
        ring.parentNode.setAttribute("viewBox", `0 0 ${w} ${h}`);
        ring.setAttribute("d", `M${m} ${y0}H${x1 - r}A${r} ${r} 0 0 1 ${x1} ${y0 + r}V${y1 - r}A${r} ${r} 0 0 1 ${x1 - r} ${y1}H${x0 + r}A${r} ${r} 0 0 1 ${x0} ${y1 - r}V${y0 + r}A${r} ${r} 0 0 1 ${x0 + r} ${y0}H${m}`);
        const len = ring.getTotalLength ? ring.getTotalLength() : 0;
        if (len > 0) {
          ring.style.strokeDasharray = `${len} ${len}`;
          this._keyAnims.push(ring.animate([{ strokeDasharray: `${(left / total) * len} ${len}` }, { strokeDasharray: `0 ${len}` }], { duration: left, easing: "linear", fill: "forwards" }));
        }
      }
      if (modes.has("fade")) {
        // Clearly darker already by half time (70 %), then faster, down to 35 % at the end.
        const slow = 0.5 * total, quick = Math.max(slow, total - 60000);
        const pts = [[0, 1], [slow, 0.7], [quick, 0.5], [total, 0.35]];
        const at = (x) => {
          for (let i = 1; i < pts.length; i++) {
            if (x <= pts[i][0]) {
              const [x0, y0] = pts[i - 1], [x1, y1] = pts[i];
              return x1 === x0 ? y1 : y0 + ((y1 - y0) * (x - x0)) / (x1 - x0);
            }
          }
          return pts[pts.length - 1][1];
        };
        const frames = [{ offset: 0, opacity: at(elapsed) }];
        for (const [x, y] of pts) if (x > elapsed && x < total) frames.push({ offset: (x - elapsed) / left, opacity: y });
        frames.push({ offset: 1, opacity: pts[pts.length - 1][1] });
        this._keyAnims.push(el.animate(frames, { duration: left, easing: "linear", fill: "forwards" }));
      }
    }
    const reduce = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    // Mode symbol (guest, baby/pet): calm, its frame blinks in the last minute;
    // Automatic never blinks. Person key: only with key_blink: true.
    const wantsBlink = symbol ? !el.hasAttribute("data-auto") : this._config.key_blink === true;
    const blink = () => { if (!reduce) el.classList.add("expiring"); };
    if (wantsBlink) {
      if (left <= 60000) blink();
      else this._keyTimer = setTimeout(blink, left - 60000);
    }
    clearTimeout(this._keyEnd);
    this._keyEnd = setTimeout(() => this._render(), left + 50);
  },
  // Full names on the person keys while they fit on one line; otherwise the
  // initials, spread evenly over as few rows as six to a row allow.
  _fitKeys() {
    const glance = this.shadowRoot?.querySelector(".glance");
    if (glance) {
      glance.classList.remove("compact");
      if (glance.scrollWidth > glance.clientWidth + 1) glance.classList.add("compact");
    }
    if (!this._resizer && window.ResizeObserver) {
      this._resizer = new ResizeObserver(() => this._fitKeys());
      this._resizer.observe(this);
    }
    this._placeDetail();
    const box = this.shadowRoot?.querySelector(".person-keys");
    if (!box) return;
    if (this._keyBox !== box && this._resizer) {
      // The key row itself is watched, too (shown again after a tab switch).
      this._keyBox = box;
      this._resizer.observe(box);
    }
    if (!this._fontsWatched && document.fonts?.ready) {
      this._fontsWatched = true;
      document.fonts.ready.then(() => this._fitKeys());
    }
    const n = box.children.length;
    // Full names on one row, else on two even rows, else initials; all keys
    // alike. Decided by calculation (text width in the key's own font against
    // the key width), not by a one-off look at the layout, and with a small
    // tolerance in favour of the last choice so it does not flip at the edge.
    box.classList.remove("short");
    box.closest(".device")?.classList.remove("short-keys");
    box.classList.toggle("one", n === 1);
    box.style.setProperty("--cols", n);
    const keys = [...box.children];
    const width = box.clientWidth;
    if (!width || !keys.length) return;
    const names = keys.map((k) => k.querySelector(".full")?.textContent || "");
    const cs = getComputedStyle(keys[0]);
    const ctx = (this._measure = this._measure || document.createElement("canvas").getContext("2d"));
    let widest = 0;
    if (ctx) {
      ctx.font = `${cs.fontStyle} ${cs.fontWeight} ${cs.fontSize} ${cs.fontFamily}`;
      widest = Math.max(...names.map((nm) => ctx.measureText(nm).width));
    }
    if (!widest) widest = Math.max(...keys.map((k) => k.querySelector(".full")?.offsetWidth || 0));
    const gap = 7;
    const keyWidth = (cols) => (width - (cols - 1) * gap) / cols;
    const key = `${names.join("|")}|${n}`;
    const last = this._keyMode?.key === key ? this._keyMode.mode : null;
    const room = (cols, mode) => keyWidth(cols) - (widest + 14) + (last === mode ? 6 : 0) >= 0;
    let mode = "short";
    if (room(n, "one")) mode = "one";
    else if (n > 1 && Math.ceil(n / 2) <= 6 && room(Math.ceil(n / 2), "two")) mode = "two";
    this._keyMode = { key, mode };
    if (mode === "two") box.style.setProperty("--cols", Math.ceil(n / 2));
    if (mode === "short") {
      box.classList.add("short");
      box.closest(".device")?.classList.add("short-keys");
      box.style.setProperty("--cols", Math.ceil(n / Math.ceil(n / 6)));
    }
  },
  // An opened value tile's explanation goes below the end of its row, so the
  // tiles beside it keep their places.
  _placeDetail() {
    // The pop-up spans the tiles' width with its arrow at the open tile:
    // above it where the card has room (the graph is there), else below.
    const grid = this.shadowRoot?.querySelector(".vals");
    const pop = grid?.querySelector(".val-detail");
    const tile = grid?.querySelector(".val.open");
    if (!pop || !tile) return;
    const g = grid.getBoundingClientRect();
    const r = tile.getBoundingClientRect();
    if (!g.width || !r.width) {
      // Not laid out yet: try again with the next frame.
      if (!this._placeLater) this._placeLater = requestAnimationFrame(() => { this._placeLater = null; this._placeDetail(); });
      return;
    }
    const card = this.shadowRoot.querySelector("ha-card")?.getBoundingClientRect() || g;
    const gap = 10;
    const h = pop.offsetHeight;
    const above = r.top - card.top >= h + gap + 8;
    pop.classList.toggle("below", !above);
    pop.style.top = `${above ? r.top - g.top - h - gap : r.bottom - g.top + gap}px`;
    pop.style.setProperty("--arrow", `${Math.round(r.left - g.left + r.width / 2)}px`);
  },
});
