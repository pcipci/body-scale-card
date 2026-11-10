# Source of the Body Scale Card

The card is **one file for Home Assistant** (`dist/body-scale-card.js`), but it is **written as modules**
in this folder. `python tools/build_card.py` joins them in the order of their file names. The number at the
start of a name is the load order. **Never edit `dist/body-scale-card.js` by hand**; change a module, build,
commit both (a test checks that `dist/` is what the modules give).

| Module | What is in it |
|---|---|
| `00-banner` | documentation of all card options and the version |
| `10-i18n` | loads the texts (German/English built in, other languages from `body-scale-card.i18n.<code>.json` next to the card) |
| `12-constants` | fixed lists: units, chart views, periods, columns, healthy ranges, value tiles |
| `14-chart-math` | axis ticks, date ticks, smooth line |
| `16-icons` | the own icon set `body_scale:` and small SVG marks |
| `18-helpers` | small shared functions (escaping, initials, person icon, interface rows) |
| `20-growth` | children's percentile maths and the loader of the table files (`body-scale-card.growth.*.json` next to the card, not part of the card file) |
| `22-global-options` | settings shared by all cards of a user (Home Assistant user data) |
| `30-card-core` | the card element: config, lifecycle, hass updates, language, main `_render()` |
| `32-card-data` | reading interfaces S and H, caches, filters, ordering people |
| `34-card-format` | numbers, dates, labels |
| `36-card-profile` | profile, growth and percentile helpers, summary |
| `40-card-scale` | the scale device: display, keys, timers, history digits |
| `42-card-legend` | legends, "How the scale works", scale info |
| `44-card-values` | value tiles, explanations, method table |
| `46-card-chart` | the history graph and the composition chart |
| `48-card-table` | people tabs, overview, open measurements, tables, dialogs |
| `50-card-events` | click handling and all actions |
| `52-card-storage` | remembering tab, view and switches in the browser |
| `54-card-styles` | the stylesheet |
| `60-strategy` | dashboard strategy `custom:body-scale-card-dashboard` |
| `70-editor` | the visual editor |
| `90-register` | registers the elements, card picker entry, version log |

## How the card class is put together

`30-card-core` declares `class BodyScaleCard` with its core methods. Every `card-*` module after it adds its
methods with `mixin(BodyScaleCard, { ... })`. For the browser it is the same as one big class: a method is found by
name, wherever its file is, and `this._something()` works across modules. To find a method: search for its name in
`src/`, or look at the module table above.

## Where to change what

- A new text: `translations/en.json` (and `de.json`), then `python tools/build_card.py`.
- A new card option: document it in `00-banner`, read it with `this._opt(...)` / `this._config`, add it to the editor (`70-editor`) and to the texts (`editor` part of the translations).
- A new chart view: `12-constants` (views), `46-card-chart` (drawing), the texts.
- A change to the look: `54-card-styles`.
- A new module: a new file with a free number; start it with `/* Module <name>: <what> */` (a test checks this).
