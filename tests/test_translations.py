"""Translation files: same shape as en.json, and the card embeds de/en exactly as the files say."""
import json
import pathlib
import re
import subprocess
import sys

ROOT = pathlib.Path(__file__).resolve().parent.parent
TR = ROOT / "translations"


def test_all_translations_match_english():
    r = subprocess.run([sys.executable, str(ROOT / "tools" / "check_translations.py")], capture_output=True, text=True)
    assert r.returncode == 0, r.stdout


def test_card_embeds_current_de_en():
    src = (ROOT / "dist" / "body-scale-card.js").read_text(encoding="utf-8")
    m = re.search(r"const I18N_EMBEDDED = (\{.*?\});\nconst I18N_NAMES", src, re.S)
    embedded = json.loads(m.group(1))
    for code in ("de", "en"):
        assert embedded[code] == json.loads((TR / f"{code}.json").read_text(encoding="utf-8")), f"run python tools/build_card.py ({code})"
    names = json.loads(re.search(r"const I18N_NAMES = (\{.*?\});", src).group(1))
    assert set(names) == {f.stem for f in TR.glob("*.json")}


def test_languages_have_their_own_name():
    for f in TR.glob("*.json"):
        assert json.loads(f.read_text(encoding="utf-8"))["_meta"]["language"]


def test_no_text_left_in_code():
    src = (ROOT / "dist" / "body-scale-card.js").read_text(encoding="utf-8")
    assert "const TEXT = {" not in src and "const INFO = {" not in src and "const EDITOR_TEXT" not in src
