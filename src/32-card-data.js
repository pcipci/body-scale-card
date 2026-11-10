/*
 * Module card-data: reading the interfaces S and H
 *
 * Finds the scale's directory entity, calls the services of the two interfaces
 * (get_entries, get_series, set_entry, ...), caches entries and lines per person,
 * applies the clothes and impedance filters, orders the people.
 */

mixin(BodyScaleCard, {
  // ---------------------------------------------------------------- data

  // Interface S: the directory entity carries the scale record and the tables
  // (people, heights, pending, ...). Without one the card has nothing to show.
  _directoryState() {
    const hass = this._hass;
    const ok = (st) => st && st.attributes && st.attributes.scale?.scale_interface === 1 && Array.isArray(st.attributes.people);
    const named = this._config.directory || this._config.scale;
    if (named && ok(hass.states[named])) return hass.states[named];
    if (this._dirId && ok(hass.states[this._dirId])) return hass.states[this._dirId];
    this._dirId = null;
    if (Date.now() - (this._dirScan || 0) < 30000) return null;
    this._dirScan = Date.now();
    const st = Object.values(hass.states).find(ok);
    if (st) this._dirId = st.entity_id;
    return st || null;
  },
  _discover() {
    const dir = this._directoryState();
    if (!dir) return null;
    const hass = this._hass;
    const a = dir.attributes;
    const reg = hass.entities?.[dir.entity_id] || {};
    const domain = reg.platform || null;
    const scale = a.scale || {};
    const caps = new Set(String(scale.capabilities || "").split(",").map((c) => c.trim()).filter(Boolean));
    const heightsOf = (id) => (a.heights || []).filter((h) => h.person_id === id).map((h) => [h.at, h.cm]);
    this._src = { domain, deviceId: reg.device_id || null };
    const people = a.people
      .map((u) => ({
        id: u.person_id,
        name: u.name || u.person_id,
        rows: this._entries?.[u.person_id]?.rows || [],
        private: !!u.private,
        loginUserId: u.owner || null,
        born: u.birthdate || null,
        sex: u.sex || null,
        heights: heightsOf(u.person_id),
        method: u.method || "standard",
        athlete: !!u.athlete,
      }))
      .map((p) => ({ ...p, visible: this._mayView(p), isBaby: this._isBaby(p.born) }))
      .sort((x, y) => this._comparePeople(x, y));
    // Open measurements with the people they may belong to (and who is suggested).
    const who = {}, hint = {};
    for (const c of a.pending_candidates || []) {
      (who[c.measurement_id] = who[c.measurement_id] || []).push(c.person_id);
      if (c.suggested) (hint[c.measurement_id] = hint[c.measurement_id] || []).push(c.person_id);
    }
    const pending = caps.has("pending")
      ? (a.pending || []).map((p) => ({ measurement_id: p.measurement_id, timestamp: p.at, weight: p.weight, impedance: p.impedance, candidates: who[p.measurement_id] || [], suggested: hint[p.measurement_id] || [] }))
      : [];
    const guest = caps.has("guest") && a.guest ? { timestamp: a.guest.at, weight: a.guest.weight, impedance: a.guest.impedance } : null;
    this._loadHistoryInfo();
    this._ensureEntries(scale.revision, people);
    return {
      domain,
      directory: dir.entity_id,
      capabilities: caps,
      scaleDeviceId: reg.device_id || null,
      revision: scale.revision,
      pending,
      guest,
      next: caps.has("next_user") ? this._nextFromState(a) : null,
      people,
    };
  },
  // The choices of interface S as the card works with them: the order auto,
  // guest, people (labels), and the selected one by its label.
  _nextFromState(a) {
    const nx = a.next, choices = a.next_choices;
    if (!nx || !Array.isArray(choices)) return null;
    const label = (c) => c.label || c.choice_id;
    const auto = choices.find((c) => c.kind === "auto"), guest = choices.find((c) => c.kind === "guest");
    if (!auto || !guest) return null;
    const people = choices.filter((c) => c.kind === "person");
    const selected = choices.find((c) => c.choice_id === nx.selected) || auto;
    return {
      state: label(selected),
      attributes: { options: [label(auto), label(guest), ...people.map(label)], valid_until: nx.valid_until, auto_selected_at: nx.auto_selected_at, timeout_minutes: nx.timeout_minutes },
    };
  },
  // Interface H: a call of the history with an answer. The same integration
  // serves it (the card has no other source yet).
  async _service(name, data) {
    const src = this._src || {};
    const res = await this._hass.callWS({
      type: "call_service",
      domain: src.domain,
      service: name,
      service_data: { ...(src.deviceId ? { device_id: src.deviceId } : {}), ...data },
      return_response: true,
    });
    return res?.response || {};
  },
  // What the history offers (once per card): entries, series, variants, write.
  _loadHistoryInfo() {
    if (this._hcaps !== undefined || this._hcapsLoading || !this._src?.domain || !this._hass.services?.[this._src.domain]?.get_info) return;
    this._hcapsLoading = true;
    this._service("get_info")
      .then((res) => { this._hcaps = new Set(String(res.history?.capabilities || "").split(",").map((c) => c.trim()).filter(Boolean)); })
      .catch(() => { this._hcaps = new Set(); })
      .finally(() => { this._hcapsLoading = false; this._render(); });
  },
  // The newest entries of every person, again whenever the scale's `revision`
  // changes (a new weighing, a deleted entry, a changed profile).
  _ensureEntries(revision, people) {
    const svc = this._hass.services?.[this._src.domain]?.get_entries;
    if (!svc) return;
    this._entries = this._entries || {};
    for (const p of people) {
      if (!p.visible) continue;
      const cached = this._entries[p.id];
      if (cached && (cached.revision === revision || cached.loading)) continue;
      this._entries[p.id] = { revision: cached?.revision ?? null, rows: cached?.rows || [], loading: true };
      this._fetchEntries(p.id, revision);
    }
  },
  async _fetchEntries(id, revision) {
    let rows = this._entries[id]?.rows || [];
    try {
      const res = await this._service("get_entries", { person_id: id, limit: 100, variants: true });
      rows = (res.entries || []).map(entryRow);
      const methods = variantMethods(res.entry_variants);
      if (rows[0] && methods) rows[0].methods = methods;
    } catch (err) {
      // Kept as they were; asked again at the next change.
    }
    this._entries[id] = { revision, rows, loading: false };
    this._render();
  },
  // Whether an optional part of the interfaces is offered: declared by the
  // scale (capabilities) or the history (get_info), and the service exists.
  // The parts the card shows depend on it.
  _can(cap) {
    const caps = SCALE_CAPS.includes(cap) ? this._data?.capabilities : this._hcaps;
    if (caps && !caps.has(cap)) return false;
    const service = HISTORY_SERVICES[cap];
    return service ? this._hasService(service) : true;
  },
  _hasService(name) {
    const d = this._data?.domain;
    return !!(d && this._hass?.services?.[d]?.[name]);
  },
  _comparePeople(a, b) {
    // Oldest first (stable over the years: parents, then children); people
    // without a birth date last. `sort: name` sorts alphabetically.
    if (this._config?.sort !== "name" && a.born !== b.born) {
      if (!a.born) return 1;
      if (!b.born) return -1;
      return a.born < b.born ? -1 : 1;
    }
    return a.name.localeCompare(b.name, this._lang);
  },
  _ordered(names, data) {
    const rank = new Map(data.people.map((p, i) => [p.name, i]));
    return names.slice().sort((a, b) => (rank.get(a) ?? 1e9) - (rank.get(b) ?? 1e9));
  },
  // ---------------------------------------------------------- history

  // Whether a line of this metric can exist for the person: weight always, the
  // rest when some of their entries carry it (body values need impedance).
  _hasMetric(person, metric) {
    if (metric === "weight") return true;
    if (metric === "height") return this._heightHistory(person).length > 0;
    const key = metric === "fat_mass" ? "fat_free_mass" : metric;
    return person.rows.some((r) => r[key] != null && r[key] !== "");
  },
  // The filters the user chose: with or without clothes, with or without
  // impedance (any = no filter).
  _filterNow() {
    const f = this._filter || {};
    return { clothed: f.clothed || "any", impedance: f.impedance || "any" };
  },
  // The chart view in use for a person.
  _viewOf(person) {
    const views = this._chartViews(person);
    return views.includes(this._chartView) ? this._chartView : views[0];
  },
  // What the filters can mean in the view shown: the height depends on neither;
  // weight and BMI do not depend on the impedance (only on the clothes); the body
  // composition depends on both. The chart and the table use the same.
  _filterScope(person) {
    const view = this._viewOf(person);
    if (view === "height") return { clothed: false, impedance: false };
    const spec = CHART_VIEWS[view === "composition" && this._compPctOn() ? "fat" : view];
    return { clothed: true, impedance: spec.load.some((m) => !IMPEDANCE_FREE.includes(m)) };
  },
  _effFilter(person) {
    const f = this._filterNow(), scope = this._filterScope(person);
    return { clothed: scope.clothed ? f.clothed : "any", impedance: scope.impedance ? f.impedance : "any" };
  },
  _filterKey(person) {
    const f = this._effFilter(person);
    return `${f.clothed}|${f.impedance}`;
  },
  // Entries that pass the filters (the table and the fallback line).
  _rowsFiltered(person) {
    const f = this._effFilter(person);
    return person.rows.filter((r) => (f.clothed === "any" || !!r.clothed === (f.clothed === "yes"))
      && (f.impedance === "any" || (r.impedance != null) === (f.impedance === "with")));
  },
  _series(person, metric) {
    // The line of interface H (window means from the long-term statistics, or
    // from the stored entries when a filter is on) once it is loaded; until
    // then the newest entries.
    const period = this._period || "month";
    const cached = this._stats?.[`${person.id}|${metric}|${period}|${this._filterKey(person)}`];
    if (cached && cached.points.length) return cached.points;
    const cutoff = Date.now() - PERIODS[period].days * 86400000;
    return this._rowsFiltered(person)
      .filter((r) => r[metric] != null && r[metric] !== "")
      .map((r) => ({ t: new Date(r.timestamp).getTime(), v: Number(r[metric]) }))
      .filter((p) => !Number.isNaN(p.t) && !Number.isNaN(p.v) && p.t >= cutoff)
      .sort((a, b) => a.t - b.t);
  },
  async _loadStats(person, metric) {
    const period = this._period || "month";
    if (!SERIES_METRICS.includes(metric) || !this._can("series") || !this._hasMetric(person, metric)) return;
    const key = `${person.id}|${metric}|${period}|${this._filterKey(person)}`;
    this._stats = this._stats || {};
    // Again when an entry came, went or changed (the revision of the scale).
    const stamp = String(this._data.revision);
    const cached = this._stats[key];
    if (cached && (cached.stamp === stamp || cached.loading)) return;
    this._stats[key] = { points: cached?.points || [], entriesFrom: cached?.entriesFrom || null, stamp, loading: true };
    try {
      const spec = PERIODS[period], f = this._effFilter(person);
      const res = await this._service("get_series", {
        person_id: person.id, metric, bucket: spec.period,
        from: new Date(Date.now() - spec.days * 86400000).toISOString(), to: new Date().toISOString(),
        ...(this._hass.config?.time_zone ? { tz: this._hass.config.time_zone } : {}),
        ...(f.clothed !== "any" ? { clothed: f.clothed } : {}), ...(f.impedance !== "any" ? { impedance: f.impedance } : {}),
      });
      const points = (res.points || []).map((p) => ({ t: Date.parse(p.at), v: Number(p.value) })).filter((p) => !Number.isNaN(p.t) && !Number.isNaN(p.v));
      this._stats[key] = { points, entriesFrom: res.series_info?.entries_from || null, stamp, loading: false };
      // When the body-fat method changed in the period: [{ t, from, to }].
      this._switches = this._switches || {};
      this._switches[`${person.id}|${period}`] = (res.method_changes || [])
        .map((c) => ({ t: Date.parse(c.at), from: c.from_method + (c.from_athlete ? "_athlete" : ""), to: c.to_method + (c.to_athlete ? "_athlete" : "") }))
        .filter((c) => !Number.isNaN(c.t));
    } catch (err) {
      this._stats[key] = { points: [], entriesFrom: null, stamp, loading: false };
    }
    this._render();
  },
  _methodSwitches(person) {
    return this._switches?.[`${person.id}|${this._period || "month"}`] || [];
  },
  _loadStatsFor(person, metric, period) {
    const saved = this._period;
    this._period = period;
    this._loadStats(person, metric);
    this._period = saved;
  },
  _person(id) {
    return this._data.people.find((p) => p.id === id);
  },
  async _call(service, data) {
    await this._hass.callService(this._data.domain, service, {
      ...(this._data.scaleDeviceId ? { device_id: this._data.scaleDeviceId } : {}),
      ...data,
    });
  },
});
