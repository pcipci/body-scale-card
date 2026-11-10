/*
 * Module global-options: settings shared by all cards of a user
 *
 * Reference, compare, baby age, blink tolerance and the consent to load the growth data are kept in Home Assistant user data
 * (frontend/set_user_data) and written by the editor. The card's own YAML wins over them.
 */

// Options that hold for every card of a user: kept in Home Assistant's user data
// (frontend/set_user_data, key "body_scale_card"), written by the editor. A card's
// own YAML wins over it.
const GLOBAL_KEYS = ["reference", "compare_references", "baby_max_months", "blink_tolerance_kg", "growth_who", "growth_kh"];
const GLOBAL_STORE_KEY = "body_scale_card";
// Key of the settings before the card was renamed; taken over once.
const OLD_STORE_KEY = "renpho_scale_card";
const globalOptions = { values: {}, loaded: false, loading: false, cards: new Set() };
// A translation arrived (loaded from its file): draw the open cards again.
i18nListeners.add(() => globalOptions.cards.forEach((c) => { if (c._config && c._hass) c._render(); }));

function loadGlobalOptions(hass) {
  if (globalOptions.loaded || globalOptions.loading || !hass?.callWS) return;
  globalOptions.loading = true;
  Promise.resolve(hass.callWS({ type: "frontend/get_user_data", key: GLOBAL_STORE_KEY }))
    .then(async (res) => {
      let values = (res && res.value) || {};
      if (!Object.keys(values).length) {
        // Nothing saved under the new key yet: take over the old settings once.
        const old = await Promise.resolve(hass.callWS({ type: "frontend/get_user_data", key: OLD_STORE_KEY })).catch(() => null);
        if (old && old.value && Object.keys(old.value).length) {
          values = old.value;
          hass.callWS({ type: "frontend/set_user_data", key: GLOBAL_STORE_KEY, value: values }).catch(() => {});
        }
      }
      globalOptions.values = values;
      globalOptions.loaded = true;
    })
    .catch(() => { globalOptions.loaded = true; })
    .finally(() => {
      globalOptions.loading = false;
      globalOptions.cards.forEach((c) => c._render?.());
    });
}

async function saveGlobalOptions(hass, values) {
  globalOptions.values = { ...values };
  globalOptions.cards.forEach((c) => c._render?.());
  await hass.callWS({ type: "frontend/set_user_data", key: GLOBAL_STORE_KEY, value: globalOptions.values });
}
