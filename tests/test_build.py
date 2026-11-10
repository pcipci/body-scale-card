"""The card is built from src/: the shipped file must be what the modules give."""
import pathlib
import re
import subprocess
import sys

ROOT = pathlib.Path(__file__).resolve().parent.parent


def test_dist_is_built_from_src():
    r = subprocess.run([sys.executable, str(ROOT / "tools" / "build_card.py"), "--check"], capture_output=True, text=True)
    assert r.returncode == 0, r.stderr + r.stdout


def test_every_module_explains_itself():
    mods = sorted((ROOT / "src").glob("*.js"))
    assert len(mods) >= 20
    for f in mods:
        text = f.read_text(encoding="utf-8")
        # banner = the option documentation; every other module starts with "Module <name>: <what>"
        assert text.startswith("/*"), f.name
        if f.name != "00-banner.js":
            assert re.match(r"/\*\n \* Module [\w-]+: ", text), f.name


def test_modules_stay_readable():
    for f in (ROOT / "src").glob("*.js"):
        # one module = one topic; the stylesheet and the generated growth tables are the long ones
        assert len(f.read_text(encoding="utf-8").splitlines()) < 700, f.name
