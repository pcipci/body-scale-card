#!/usr/bin/env python3
"""Check translations/*.json against en.json: same keys, same list shapes, same {placeholders}.

Missing keys are allowed (the card falls back to English) and only reported as a note.
Wrong shapes, unknown keys and changed placeholders are errors. Exit code 1 on errors.
"""
import json
import pathlib
import re
import sys

TR = pathlib.Path(__file__).resolve().parent.parent / "translations"
PH = re.compile(r"\{(\w+)\}")


def walk(ref, val, path, errors, notes):
    if isinstance(ref, dict):
        if not isinstance(val, dict):
            errors.append(f"{path}: expected an object")
            return
        for k in val:
            if k not in ref:
                errors.append(f"{path}.{k}: key does not exist in en.json")
        for k in ref:
            if k not in val:
                notes.append(f"{path}.{k}: missing (English is used)")
            else:
                walk(ref[k], val[k], f"{path}.{k}", errors, notes)
    elif isinstance(ref, list):
        if not isinstance(val, list) or len(val) != len(ref):
            errors.append(f"{path}: expected a list of {len(ref)} items")
            return
        for i, (r, v) in enumerate(zip(ref, val)):
            walk(r, v, f"{path}[{i}]", errors, notes)
    elif isinstance(ref, str):
        if not isinstance(val, str):
            errors.append(f"{path}: expected text")
        elif set(PH.findall(ref)) != set(PH.findall(val)):
            errors.append(f"{path}: placeholders {sorted(set(PH.findall(ref)))} expected, found {sorted(set(PH.findall(val)))}")


def check(code, data, en):
    errors, notes = [], []
    meta = data.get("_meta", {})
    if not meta.get("language"):
        errors.append("_meta.language (the language in its own name) is missing")
    for sec in ("ui", "info", "editor"):
        if sec in data:
            walk(en[sec], data[sec], sec, errors, notes)
    # Key lists (legend, how, ...) are pairs/triples whose first entry is a fixed key: it must not be translated.
    for sec, name in (("ui", "chartLegend"), ("ui", "legend"), ("ui", "how")):
        if name in data.get(sec, {}):
            a = [x[0] for x in en[sec][name]]
            b = [x[0] for x in data[sec][name]]
            if a != b:
                errors.append(f"{sec}.{name}: the first entry of each row is a key and must stay as in en.json")
    return errors, notes


def main():
    en = json.loads((TR / "en.json").read_text(encoding="utf-8"))
    bad = 0
    for f in sorted(TR.glob("*.json")):
        data = json.loads(f.read_text(encoding="utf-8"))
        errors, notes = check(f.stem, data, en)
        print(f"{f.stem}: {len(errors)} errors, {len(notes)} missing")
        for e in errors:
            print("  ERROR", e)
        bad += len(errors)
    sys.exit(1 if bad else 0)


if __name__ == "__main__":
    main()
