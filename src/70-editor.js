/*
 * Module editor: the visual card editor
 *
 * ha-form based editor with a help text for every option. Options that are not set stay
 * out of the YAML; options the form does not know (e.g. links) are kept.
 */

// ------------------------------------------------------------------ editor
//
// Visual editor (ha-form): every option of the card with a short explanation.
// Options that are not set stay out of the YAML; a value equal to its default
// is removed again. Options the form does not know (e.g. `links`) are kept.
const EDITOR_DEFAULTS = {
  rows: 10, pending: true, next_user: true, chart: true, profile: true, info: true, grid: true, curves: true,
  invert_modes: false, invert_history: false, invert_brightness: 65, mode_field_width: "narrow", overview: false, list: true, hide_empty_pending: false, values_max_age_days: 3, display_hold: 5, history_hold: 30, choice_minutes: 0,
  refresh_seconds: 0, key_blink: false, blink_tolerance_kg: 2, baby_max_months: 24, key_timer: "frame", reference: "who",
  compare_references: false, growth_who: false, growth_kh: false, sort: "age", skin: "device", language: "auto",
};


class BodyScaleCardEditor extends HTMLElement {
  setConfig(config) {
    this._config = { ...(config || {}) };
    if (!this._i18n) { this._i18n = () => this._draw(); i18nListeners.add(this._i18n); }
    this._draw();
  }

  set hass(hass) {
    this._hass = hass;
    if (this._form) this._form.hass = hass;
    else this._draw();
  }

  _text() {
    const lang = (this._hass?.locale?.language || this._hass?.language || "de").slice(0, 2);
    const tx = editorText(lang);
    // Language list: all languages that ship with the card, each in its own name.
    return { ...tx, options: { ...tx.options, language: { auto: tx.options.language.auto, ...I18N_NAMES } } };
  }

  // The key_timer value as one choice; combinations are shown as custom.
  _timerChoice(value) {
    if (value == null) return "frame";
    return ["frame", "ring", "fade", "none"].includes(String(value)) ? String(value) : "custom";
  }

  _schema(tx) {
    const sel = (name) => {
      const opts = tx.options[name];
      return { name, selector: { select: { mode: "dropdown", options: Object.entries(opts).map(([value, label]) => ({ value, label })) } } };
    };
    const num = (name, min, max, step, unit) => ({ name, selector: { number: { min, max, step, mode: "box", ...(unit ? { unit_of_measurement: unit } : {}) } } });
    const bool = (name) => ({ name, selector: { boolean: {} } });
    const text = (name) => ({ name, selector: { text: {} } });
    const timer = this._timerChoice(this._config.key_timer) === "custom"
      ? sel("key_timer")
      : { name: "key_timer", selector: { select: { mode: "dropdown", options: ["frame", "ring", "fade", "none"].map((value) => ({ value, label: tx.options.key_timer[value] })) } } };
    return [
      { type: "expandable", name: "", title: tx.groups.basic, expanded: true, schema: [text("title"), text("person"), sel("language"), sel("sort"), bool("overview"), bool("list"), num("rows", 1, 100, 1), num("values_max_age_days", 0, 30, 1, "d")] },
      { type: "expandable", name: "", title: tx.groups.look, schema: [sel("skin"), sel("mode_field_width"), bool("invert_modes"), { name: "invert_brightness", selector: { number: { min: 20, max: 100, step: 5, mode: "slider", unit_of_measurement: "%" } } }, bool("invert_history")] },
      { type: "expandable", name: "", title: tx.groups.sections, schema: [bool("next_user"), bool("pending"), bool("hide_empty_pending"), bool("chart"), bool("profile"), bool("info"), bool("grid"), bool("curves")] },
      { type: "expandable", name: "", title: tx.groups.times, schema: [num("display_hold", 1, 120, 1, "min"), num("history_hold", 5, 600, 5, "s"), num("choice_minutes", 0, 120, 1, "min"), num("refresh_seconds", 0, 3600, 1, "s")] },
      { type: "expandable", name: "", title: tx.groups.timer, schema: [timer, bool("key_blink")] },
      { type: "expandable", name: "", title: tx.groups.scale, schema: [text("directory")] },
      { type: "expandable", name: "", title: tx.groups.global, schema: [sel("reference"), bool("compare_references"), ...["who", "kh"].filter((r) => growthStatus(r) !== "absent").map((r) => bool(`growth_${r}`)), num("baby_max_months", 1, 60, 1, ""), num("blink_tolerance_kg", 0, 50, 0.5, "kg")] },
    ];
  }

  _data() {
    const d = { ...EDITOR_DEFAULTS, ...globalOptions.values, ...this._config };
    d.language = this._config.language || "auto";
    d.key_timer = this._timerChoice(this._config.key_timer);
    return d;
  }

  _render() {
    this._draw();
  }

  _globalNote() {
    const de = (this._hass?.locale?.language || this._hass?.language || "de").startsWith("de");
    const who = this._hass?.user?.name || "";
    return de
      ? ` Gilt für alle Waagen-Karten von ${who ? `Benutzer „${who}“` : "diesem Benutzer"} auf allen Geräten. Gespeichert in den Benutzerdaten von Home Assistant, nicht im YAML der Karte. Steht die Option im YAML einer Karte, gilt dort das YAML.`
      : ` Applies to all scale cards of ${who ? `user “${who}”` : "this user"} on all devices. Stored in Home Assistant's user data, not in the card's YAML. If the option is in a card's YAML, the YAML wins there.`;
  }

  _draw() {
    if (!this._config || !this._hass) return;
    loadGlobalOptions(this._hass);
    globalOptions.cards.add(this);
    growthProbe("who"); growthProbe("kh");
    const tx = this._text();
    if (!this._form) {
      this._form = document.createElement("ha-form");
      this._form.addEventListener("value-changed", (ev) => this._changed(ev.detail.value));
      this.appendChild(this._form);
    }
    this._form.hass = this._hass;
    this._form.data = this._data();
    this._form.schema = this._schema(tx);
    this._form.computeLabel = (item) => tx.labels[item.name] || item.name;
    this._form.computeHelper = (item) => (tx.helpers[item.name] || "") + (GLOBAL_KEYS.includes(item.name) ? this._globalNote() : "");
  }

  _changed(value) {
    const next = { ...this._config };
    const globals = { ...globalOptions.values };
    let globalChanged = false;
    for (const [key, val] of Object.entries(value || {})) {
      if (key === "key_timer" && val === "custom") continue;
      if (GLOBAL_KEYS.includes(key)) {
        // User-wide: into the user data, and out of this card's own options.
        const current = this._config[key] ?? globalOptions.values[key] ?? EDITOR_DEFAULTS[key];
        if (val !== current) {
          const dflt = EDITOR_DEFAULTS[key] !== undefined && EDITOR_DEFAULTS[key] === val;
          if (dflt || val === undefined || val === null || val === "") delete globals[key];
          else globals[key] = val;
          globalChanged = true;
          delete next[key];
        }
        continue;
      }
      const empty = val === undefined || val === null || val === "";
      const isDefault = EDITOR_DEFAULTS[key] !== undefined && EDITOR_DEFAULTS[key] === val;
      if (empty || isDefault) delete next[key];
      else next[key] = val;
    }
    if (globalChanged && this._hass) {
      saveGlobalOptions(this._hass, globals).catch((err) => console.warn("body-scale-card: saving user-wide options failed", err));
    }
    this._config = next;
    this.dispatchEvent(new CustomEvent("config-changed", { detail: { config: next }, bubbles: true, composed: true }));
  }
}
