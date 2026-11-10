# Translations of the Body Scale Card

Every language is one JSON file in this folder: `de.json`, `en.json`, `ru.json`, `fr.json`, `es.json`, `it.json`, ...
German and English are built into the card (it always works); every other file is loaded when a user's Home Assistant
language (or the card option `language:`) asks for it. A key that is missing in a file falls back to **English**, so a
partial translation is fine and can grow over time. Files marked `"machine_translated": true` were translated by a
machine and are waiting for a native speaker to correct them.

## Add a language

1. Copy `en.json` to `<code>.json` with the two-letter code (`nl.json`, `pl.json`, `tr.json`, ...).
2. Set `_meta.language` to the language **in its own name** (`"Nederlands"`) and `machine_translated` to `true` or `false`.
3. Translate the values. Do **not** change keys, and do not translate the first entry of the rows in `chartLegend`,
   `legend` and `how` (`["views", "Text"]`: `views` is a key).
4. Keep every `{placeholder}` exactly as it is (you may move it inside the sentence). `{n}`, `{t}`, `{p}` ... are
   filled in by the card.
5. Texts with `<b>...</b>` in `info.how` keep their tags.
6. Run the check: `python tools/check_translations.py` (wrong shapes, unknown keys and changed placeholders are errors).
7. Run `python tools/build_card.py` (embeds de/en and the language list into the card and writes the other languages
   as `dist/body-scale-card.i18n.<code>.json` next to the card). The new language then
   appears in the card editor's language list.
8. Test it: set `language: <code>` in the card, reload the browser with Ctrl+F5.

## Parts of a file

| Part | What |
|---|---|
| `_meta` | `language` (own name), `machine_translated` |
| `ui` | texts of the card: scale, legend, chart, table, dialogs |
| `info` | explanations of the values ("Understanding the values"), ranges, children's percentiles |
| `editor` | labels and help texts of the visual card editor |

Texts with values: `ui.until`, `confirm*`, `days`, `years`, `filterHint`, `heightOld`, `heightAsk`, `allGood`, `pickTarget`,
`carriedFrom` and `info.avgForWeight`, `realAge`, `mifflin`, `percentile`, `heightPct`. `info.percentile` has `{ref}` (name of the
reference, from `info.refNames`) and `{other}` (the sentence `info.percentileOther`, only when both references are shown).
`ui.times` holds the four time labels with `{T}`, `{H}`, `{Y}` (minutes, minutes, seconds).

## Hints

- Short words matter: table headings (`ui.cols`) and the scale labels have little room.
- Keep ranges and medical statements as in English; if a rule differs in your country, say so only in the explanation text.
- When a new version of the card adds texts, they show in English until your file has them; `check_translations.py`
  lists what is missing.
