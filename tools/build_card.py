#!/usr/bin/env python3
"""Build dist/body-scale-card.js from the modules in src/.

    python tools/build_card.py          # write dist/body-scale-card.js
    python tools/build_card.py --check  # exit 1 if dist/ is not what the sources give

The modules are joined in the order of their file names (00-, 10-, 20-, ...), so
the numbers are the load order. Nothing else happens except filling the three
placeholders of src/10-i18n.js from translations/*.json: German and English are
built into the card, the other languages are loaded at run time.

Home Assistant loads this one file. Next to it, flat in dist/ (HACS installs only the
files directly in dist/, no subfolders), the build puts the data the card fetches on demand:
  body-scale-card.i18n.<code>.json     every language except the built-in German/English
  body-scale-card.growth.<table>.json  the children's growth tables (own licences)
"""
import json
import pathlib
import sys

ROOT = pathlib.Path(__file__).resolve().parent.parent
SRC = ROOT / "src"
DIST = ROOT / "dist"
CARD = DIST / "body-scale-card.js"
TR = ROOT / "translations"
GROWTH_SRC = ROOT / "growth"

# Texts that carry values: key -> parameter names in call order (see translations/README.md)
FN = {
    "ui": {"until": ["t"], "confirmDiscard": ["m"], "confirmBaby": ["w", "n"], "carriedFrom": ["when"], "days": ["n"],
           "years": ["n"], "filterHint": ["date"], "growthHint": ["ref", "licence"], "heightOld": ["n"], "heightAsk": ["name"], "confirmDelHeight": ["h", "p"],
           "allGood": ["n"], "confirmAssign": ["m", "p"], "confirmMove": ["m", "f", "t"], "confirmRemove": ["m", "p"],
           "pickTarget": ["m"]},
    "info": {"avgForWeight": ["v"], "realAge": ["n"], "mifflin": ["v"], "percentile": ["p", "c", "ref", "other"],
             "heightPct": ["p", "ref"]},
}


def build() -> str:
    langs, names = {}, {}
    for f in sorted(TR.glob("*.json")):
        data = json.loads(f.read_text(encoding="utf-8"))
        names[f.stem] = data.get("_meta", {}).get("language", f.stem)
        if f.stem in ("de", "en"):
            langs[f.stem] = data
    dump = lambda o: json.dumps(o, ensure_ascii=False, separators=(",", ":"))  # noqa: E731
    parts = []
    for f in sorted(SRC.glob("*.js")):
        text = f.read_text(encoding="utf-8")
        if f.name == "10-i18n.js":
            text = text.replace("/*FN*/", dump(FN)).replace("/*EMBED*/", dump(langs)).replace("/*NAMES*/", dump(names))
        parts.append(text.rstrip("\n") + "\n")
    return "\n".join(parts)


def side_files() -> dict:
    """The files next to the card in dist/: languages and growth tables, flat names."""
    out = {}
    for f in sorted(TR.glob("*.json")):
        if f.stem not in ("de", "en"):
            out[f"body-scale-card.i18n.{f.stem}.json"] = f.read_text(encoding="utf-8")
    for f in sorted(GROWTH_SRC.glob("*.json")):
        out[f"body-scale-card.growth.{f.name}"] = f.read_text(encoding="utf-8")
    return out


def main() -> None:
    text = build()
    side = side_files()
    have = {p.name for p in DIST.glob("body-scale-card.*.json")}
    if "--check" in sys.argv:
        if not CARD.exists() or CARD.read_text(encoding="utf-8") != text:
            raise SystemExit("dist/body-scale-card.js is not up to date: run python tools/build_card.py")
        for name, body in side.items():
            p = DIST / name
            if not p.exists() or p.read_text(encoding="utf-8") != body:
                raise SystemExit(f"dist/{name} is not up to date: run python tools/build_card.py")
        if have - set(side):
            raise SystemExit(f"dist/ has stale files {sorted(have - set(side))}: run python tools/build_card.py")
        print("dist is up to date")
        return
    CARD.write_text(text, encoding="utf-8")
    for name in have - set(side):
        (DIST / name).unlink()
    for name, body in side.items():
        (DIST / name).write_text(body, encoding="utf-8")
    print(f"wrote {CARD.relative_to(ROOT)} from {len(list(SRC.glob('*.js')))} modules, {len(text.splitlines())} lines, and {len(side)} data files")


if __name__ == "__main__":
    main()
