/*
 * Module card-core: the card element
 *
 * The custom element: configuration, lifecycle, hass updates, language and the main
 * _render(). Everything else of the card is added by the card-* modules after this
 * one with mixin(); a method is found by name, whatever file it lives in.
 */

class BodyScaleCard extends HTMLElement {
  // An option: the card's own YAML first, then the user-wide setting.
  _opt(name) {
    const own = this._config?.[name];
    if (own !== undefined && own !== null && own !== "") return own;
    return GLOBAL_KEYS.includes(name) ? globalOptions.values[name] : undefined;
  }

  static getStubConfig() {
    return {};
  }

  static getConfigElement() {
    return document.createElement("body-scale-card-editor");
  }

  setConfig(config) {
    this._config = {
      rows: 10,
      pending: true,
      columns: DEFAULT_COLUMNS,
      ...(config || {}),
    };
    this._expanded = false;
    this._signature = null;
    this._armRefresh();
    if (!this.shadowRoot) this.attachShadow({ mode: "open" });
    if (this._hass) this._render();
  }

  connectedCallback() {
    globalOptions.cards.add(this);
    if (this._popClose) return;
    this._popClose = (ev) => {
      if (!this._openMetric) return;
      if (ev.type === "keydown") {
        if (ev.key !== "Escape") return;
      } else if (ev.composedPath().some((el) => el.classList && (el.classList.contains("val-detail") || el.classList.contains("val") || el.classList.contains("g")))) {
        return;
      }
      this._openMetric = null;
      this._render();
    };
    window.addEventListener("click", this._popClose, true);
    window.addEventListener("keydown", this._popClose);
    // A page that was in the background or asleep draws itself again when it
    // comes back, so several open pages (phone, tablet, computer) agree.
    this._wake = () => {
      if (document.visibilityState !== "hidden" && this._hass && this._config) this._render();
    };
    document.addEventListener("visibilitychange", this._wake);
    window.addEventListener("focus", this._wake);
    window.addEventListener("pageshow", this._wake);
    this._armRefresh();
  }

  disconnectedCallback() {
    globalOptions.cards.delete(this);
    if (!this._popClose) return;
    window.removeEventListener("click", this._popClose, true);
    window.removeEventListener("keydown", this._popClose);
    document.removeEventListener("visibilitychange", this._wake);
    window.removeEventListener("focus", this._wake);
    window.removeEventListener("pageshow", this._wake);
    clearTimeout(this._keyTimer);
    clearTimeout(this._keyEnd);
    clearTimeout(this._optTimer);
    clearTimeout(this._histTimer);
    clearInterval(this._refresh);
    this._keyRO?.disconnect();
    this._popClose = null;
  }

  // Optional fixed refresh (refresh_seconds, 0 = off): the card draws itself again
  // from the newest state this page has, unless a dialog or pop-up is open.
  _armRefresh() {
    clearInterval(this._refresh);
    const s = Number(this._config?.refresh_seconds);
    if (!(s > 0) || !this.isConnected) return;
    this._refresh = setInterval(() => {
      if (document.visibilityState === "hidden" || this._dialog || this._openMetric || !this._hass || !this._config) return;
      this._render();
    }, Math.max(2, s) * 1000);
  }

  set hass(hass) {
    this._hass = hass;
    loadGlobalOptions(hass);
    const signature = this._computeSignature();
    if (signature !== this._signature) {
      this._signature = signature;
      this._render();
    }
  }

  getCardSize() {
    return 6;
  }

  get _t() {
    return uiText(this._lang);
  }

  get _lang() {
    // `language: de` in the card config overrides the user's profile language.
    return this._config?.language || this._hass?.locale?.language || this._hass?.language || "de";
  }

  _computeSignature() {
    if (!this._hass) return null;
    const dir = this._directoryState();
    if (!dir) return `|${this._lang}`;
    // Everything the card shows comes from the directory entity (entries are
    // fetched again when its `revision` changes).
    return `${dir.entity_id}:${dir.last_updated}:${dir.last_changed}|${this._lang}`;
  }

  // -------------------------------------------------------------- render

  _render() {
    if (!this.shadowRoot || !this._hass || !this._config) return;
    const t = this._t;
    const data = this._discover();
    this._data = data;
    if (!data) {
      this.shadowRoot.innerHTML = `${this._styles()}<ha-card><div class="msg">${esc(t.notFound)}</div></ha-card>`;
      return;
    }
    let people = data.people.filter((p) => p.visible);
    const only = this._config.person;
    if (only) {
      const key = String(only).toLowerCase();
      people = people.filter((p) => p.id.toLowerCase() === key || p.name.toLowerCase() === key);
    }
    if (!people.find((p) => p.id === this._selected)) {
      this._selected = this._restoreTab(people) || people[0]?.id;
    }
    // "Enter height →" in the reminder opens the card with ?body_scale_height=<user>.
    const ask = new URLSearchParams(window.location.search).get("body_scale_height");
    if (ask && this._can("set_height") && people.find((p) => p.id === ask) && !this._dialog) {
      this._selected = ask;
      const url = new URL(window.location.href);
      url.searchParams.delete("body_scale_height");
      window.history.replaceState(window.history.state, "", url);
      setTimeout(() => this._openHeight(ask), 0);
    }
    const title = this._config.title ?? (only && people[0] ? people[0].name : null);

    let html = `${this._styles()}<ha-card>`;
    // Without a title of its own the card shows a scale symbol instead of a word.
    // One person: their values at a glance beside the name.
    const glanceInHeader = !!(title && only && people.length === 1 && this._config.info !== false);
    if (title) html += `<h1 class="card-header ${glanceInHeader ? "with-glance" : ""}"><span class="title-text">${esc(title)}</span>${glanceInHeader ? this._renderGlance(people[0], t) : ""}</h1>`;
    else if (this._config.title === undefined && (this._config.next_user === false || !data.next)) {
      html += `<h1 class="card-header icon-header" title="${esc(t.title)}"><ha-icon icon="mdi:scale-bathroom"></ha-icon></h1>`;
    }
    // Who weighs next and the guest / baby-pet results belong together (overview only).
    if (this._config.next_user !== false) {
      const dev = this._renderNext(data, t);
      html += dev + (dev ? this._renderLegend(t) + this._renderHow(t) + (this._config.info !== false ? this._renderScaleInfo(t) : "") : "");
    } else {
      this._shownPending = null;
    }
    if (this._config.pending !== false) html += this._renderPending(data, t);
    html += this._renderPeople(people, t, !only, glanceInHeader);
    html += `</ha-card><div class="dialog-host"></div>`;
    this.classList.toggle("skin-theme", this._config.skin === "theme");
    this.shadowRoot.innerHTML = html;
    this._bind();
    this._fitKeys();
    this._armKeyTimer();
    this._runGlide();
    if (this._dialog) this._renderDialog();
  }
}

// Adds the methods of one card-* module to the card. Like class methods they are not
// enumerable; getters and setters keep working.
function mixin(cls, methods) {
  for (const [key, d] of Object.entries(Object.getOwnPropertyDescriptors(methods))) {
    d.enumerable = false;
    Object.defineProperty(cls.prototype, key, d);
  }
}
