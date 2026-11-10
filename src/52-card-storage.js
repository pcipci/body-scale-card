/*
 * Module card-storage: remembering tabs and switches
 *
 * Keeps the selected person, view, period and the on/off switches per browser.
 */

mixin(BodyScaleCard, {
  // ---------------------------------------------------------- persistence

  _tabKey() {
    return `body-scale-card:${this._config.title || ""}:tab`;
  },
  _restoreTab(people) {
    try {
      const id = window.localStorage.getItem(this._tabKey());
      return people.find((p) => p.id === id) ? id : null;
    } catch (e) {
      return null;
    }
  },
  _restoreFlag(name) {
    try {
      return window.localStorage.getItem(`body-scale-card:${name}`) === "1";
    } catch (e) {
      return false;
    }
  },
  _restoreFlagOff(name) {
    return this._restoreFlag(`${name}-off`);
  },
  _saveFlag(name, on) {
    try {
      window.localStorage.setItem(`body-scale-card:${name}`, on ? "1" : "0");
    } catch (e) {
      /* private mode: not remembered */
    }
  },
  _saveTab(id) {
    try {
      window.localStorage.setItem(this._tabKey(), id);
    } catch (e) {
      /* private mode: the tab is simply not remembered */
    }
  },
});
