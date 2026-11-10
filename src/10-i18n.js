/*
 * Module i18n: texts and languages
 *
 * Loads the texts of the card: German and English are built in, every other language is
 * fetched from body-scale-card.i18n.<code>.json next to the card (English fills missing keys).
 * Provides: uiText(lang), infoText(lang), editorText(lang), i18nListeners, I18N_NAMES.
 * The three placeholders below are filled by tools/build_card.py from translations/*.json.
 */

// German and English are embedded (the card always works). Every other language is
// loaded from body-scale-card.i18n.<code>.json next to this file; see translations/README.md.
const I18N_FN = /*FN*/;
const I18N_EMBEDDED = /*EMBED*/;
const I18N_NAMES = /*NAMES*/;

const cardFolder = (() => {
  // Folder of this script (works as module and as classic script).
  try {
    let src = document.currentScript && document.currentScript.src;
    if (!src) {
      const m = String(new Error().stack).match(/(https?:\/\/[^\s)]*?body-scale-card[^\s):]*\.js)/);
      if (m) src = m[1];
    }
    if (!src) src = ([...document.querySelectorAll("script[src]")].find((s) => /body-scale-card[^/]*\.js/.test(s.src)) || {}).src;
    return src ? new URL("./", src.split("?")[0]).href : null;
  } catch (e) { return null; }
})();

// All files of the card lie flat in one folder (HACS installs only the files directly in dist/).
const i18nBase = cardFolder && cardFolder + "body-scale-card.i18n.";

const i18nFill = (text, vars) => String(text).replace(/\{(\w+)\}/g, (m, k) => (vars[k] != null ? vars[k] : m));
const i18nMerge = (base, over) => {
  if (over === undefined || over === null) return base;
  if (Array.isArray(base) || Array.isArray(over) || typeof base !== "object" || typeof over !== "object" || base === null) return over;
  const out = { ...base };
  for (const k of Object.keys(over)) out[k] = i18nMerge(base[k], over[k]);
  return out;
};
// Texts with values become functions (the code calls t.until(x), it.percentile(...)).
const i18nBuild = (raw) => {
  const ui = { ...raw.ui }, info = { ...raw.info }, editor = raw.editor;
  for (const [k, params] of Object.entries(I18N_FN.ui)) {
    const tpl = ui[k];
    ui[k] = (...a) => i18nFill(tpl, Object.fromEntries(params.map((p, i) => [p, a[i]])));
  }
  const times = ui.times;
  ui.times = (a) => Object.fromEntries(Object.entries(times).map(([k, v]) => [k, i18nFill(v, a)]));
  for (const [k, params] of Object.entries(I18N_FN.info)) {
    const tpl = info[k];
    if (k === "percentile" || k === "heightPct") {
      info[k] = (p, ...rest) => {
        const ref = k === "percentile" ? rest[1] : rest[0];
        const other = k === "percentile" ? rest[2] : null;
        const c = k === "percentile" ? rest[0] : "";
        const key = ref === "kh" ? "kh" : "who", otherKey = ref === "kh" ? "who" : "kh";
        const more = other != null ? i18nFill(info.percentileOther, { name: info.refShort[otherKey], p: other }) : "";
        return i18nFill(tpl, { p, c, ref: info.refNames[key], other: more });
      };
    } else info[k] = (...a) => i18nFill(tpl, Object.fromEntries(params.map((p, i) => [p, a[i]])));
  }
  return { ui, info, editor };
};
const i18nCache = {};
const i18nPending = {};
const i18nListeners = new Set();
const i18nCode = (lang) => String(lang || "en").slice(0, 2).toLowerCase();
function i18nLoad(code) {
  if (i18nPending[code] !== undefined || !i18nBase || !/^[a-z]{2}$/.test(code)) return;
  i18nPending[code] = true;
  fetch(`${i18nBase}${code}.json`).then((r) => (r.ok ? r.json() : Promise.reject(new Error(r.status))))
    .then((json) => {
      I18N_EMBEDDED[code] = json;
      I18N_NAMES[code] = (json._meta && json._meta.language) || code;
      delete i18nCache[code];
      i18nListeners.forEach((fn) => { try { fn(); } catch (e) { console.warn("body-scale-card: redraw after language load failed", e); } });
    })
    .catch((e) => console.warn(`body-scale-card: no translation for "${code}" (${e && e.message}); using English`));
}
function i18n(lang) {
  const code = i18nCode(lang);
  if (i18nCache[code]) return i18nCache[code];
  const raw = I18N_EMBEDDED[code];
  if (!raw) { i18nLoad(code); return i18n("en"); }
  return (i18nCache[code] = i18nBuild(code === "en" ? raw : i18nMerge(I18N_EMBEDDED.en, raw)));
}
const uiText = (lang) => i18n(lang).ui;
const infoText = (lang) => i18n(lang).info;
const editorText = (lang) => i18n(lang).editor;
