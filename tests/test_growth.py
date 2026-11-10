"""The growth tables (JSON) and the card's own percentile maths."""

from __future__ import annotations

import json
from pathlib import Path

import pytest

ROOT = Path(__file__).resolve().parent.parent


def _card_source() -> str:
    return (ROOT / "dist" / "body-scale-card.js").read_text()


def test_tables_carry_source_and_licence():
    for name in ("who_2007", "kromeyer_hauschild_2001"):
        data = json.loads((ROOT / "growth" / f"{name}.json").read_text())
        assert data["_source"] and data["_license"] and data["_format"]
        assert set(data["bmi"]) == {"male", "female"} and set(data["height"]) == {"male", "female"}


def test_tables_are_separate_files_not_in_the_card():
    """The card carries no table; dist/ has exactly the JSON of growth/ as flat files."""
    card = _card_source()
    assert "[[-0.7151,15.2679" not in card and "1.305722" not in card
    for name in ("who_2007", "kromeyer_hauschild_2001"):
        assert (ROOT / "dist" / f"body-scale-card.growth.{name}.json").read_text() == (ROOT / "growth" / f"{name}.json").read_text()


def test_card_without_tables_gives_nothing():
    import shutil
    import subprocess

    node = shutil.which("node")
    if node is None:
        pytest.skip("node not installed")
    card = _card_source()
    code = card[card.index("// ---- BEGIN growth") : card.index("// ---- END growth")]
    script = code + "\nconsole.log(JSON.stringify([growthPercentile('who','bmi',18,'male',100), growthCurves('kh','bmi','male',0,100,1).length, growthLms('who','height','female',100)]));"
    assert json.loads(subprocess.run([node, "-e", script], capture_output=True, text=True, check=True).stdout) == [None, 0, None]


def test_card_growth_matches_python():
    """The card's own percentile maths gives what growth.py gives."""
    import json
    import shutil
    import subprocess

    import pytest

    from growth import growth

    node = shutil.which("node")
    if node is None:
        pytest.skip("node not installed")
    card = _card_source()
    code = card[card.index("// ---- BEGIN growth") : card.index("// ---- END growth")]
    values = {"bmi": [11, 13, 15, 17, 19, 22, 26, 32, 40], "height": [60, 80, 100, 120, 140, 160, 175, 190]}
    cases = []
    for ref in ("who", "kh"):
        for kind, vs in values.items():
            for sex in ("male", "female"):
                for months in (0, 1, 7, 30, 59, 60, 61, 84, 119, 150, 200, 227, 228, 229):
                    for value in vs:
                        cases.append([ref, kind, value, sex, months])
    tables = {
        "who": json.loads((ROOT / "growth" / "who_2007.json").read_text()),
        "kh": json.loads((ROOT / "growth" / "kromeyer_hauschild_2001.json").read_text()),
    }
    script = (
        code
        + "\nGROWTH.who = " + json.dumps(tables["who"]) + "; GROWTH.kh = " + json.dumps(tables["kh"]) + ";"
        + "\nconst cases = "
        + json.dumps(cases)
        + ";\nconst out = cases.map(([r, k, v, s, m]) => { const x = growthPercentile(r, k, v, s, m); return x && { z: x.z, p: x.p, c: growthCategory(r, x.z) }; });"
        + "\nconst curves = [['who','bmi','male'],['who','height','female'],['kh','bmi','female'],['kh','height','male']].map(([r,k,s]) => growthCurves(r,k,s,0,230,1));"
        + "\nconsole.log(JSON.stringify({ out, curves, age: [growthAgeMonths('2015-06-20', Date.parse('2026-11-04T12:00:00')), growthAgeMonths('2015-11-05', Date.parse('2026-11-04T12:00:00')), growthAgeMonths('2026-12-01', Date.parse('2026-11-04T12:00:00'))] }));"
    )
    got = json.loads(subprocess.run([node, "-e", script], capture_output=True, text=True, check=True).stdout)
    checked = 0
    for (ref, kind, value, sex, months), g in zip(cases, got["out"]):
        want = growth.percentile(ref, kind, value, sex, months)
        if want is None:
            assert g is None, (ref, kind, value, sex, months)
            continue
        assert g is not None, (ref, kind, value, sex, months)
        assert g["z"] == pytest.approx(want[0], abs=0.011), (ref, kind, value, sex, months)
        assert g["p"] == pytest.approx(want[1], abs=0.11), (ref, kind, value, sex, months)
        if abs(g["z"] - want[0]) < 0.001:
            assert g["c"] == growth.category(ref, want[0]), (ref, kind, value, sex, months)
        checked += 1
    assert checked > 500
    for (ref, kind, sex), rows in zip((("who", "bmi", "male"), ("who", "height", "female"), ("kh", "bmi", "female"), ("kh", "height", "male")), got["curves"]):
        want = growth.curves(ref, kind, sex, 0, 230, 1)
        assert len(rows) == len(want) and len(rows) > 100, (ref, kind, sex)
        for a, b in zip(rows, want):
            assert a[0] == b[0]
            assert a[1:] == pytest.approx(b[1:], abs=0.011)
    # Whole months like age_in_months (before / after the birthday, birth date in the future).
    assert got["age"] == [136, 131, None]




def test_kromeyer_hauschild_and_curves():
    from growth import growth

    # KH median BMI for boys at 10 y is about 17.0; WHO puts it near P60.
    z, pct = growth.percentile("kh", "bmi", 16.9, "male", 120)
    assert abs(z) < 0.05 and 47 < pct < 53
    assert growth.percentile("who", "bmi", 16.9, "male", 120)[1] > 55
    # German cut-offs: above P90 overweight, above P97 obesity.
    assert growth.category("kh", 1.4) == "overweight"
    assert growth.category("who", 1.4) == "overweight"
    assert growth.category("kh", 1.0) == "normal"
    assert growth.category("who", 1.1) == "overweight"
    # KH covers 0-18 years, WHO 5-19 years.
    assert growth.percentile("kh", "height", 75, "female", 12) is not None
    assert growth.percentile("who", "height", 75, "female", 12) is None
    assert growth.percentile("kh", "bmi", 20, "male", 230) is None
    rows = growth.curves("kh", "height", "female", 120, 132, 6)
    assert [r[0] for r in rows] == [120, 126, 132]
    assert all(r[1] < r[2] < r[3] < r[4] < r[5] for r in rows)
    assert rows[0][3] < rows[-1][3]


def test_who_bmi_for_age():
    from growth.who_growth import bmi_category, bmi_for_age

    # The median is the 50th percentile; WHO median BMI for boys at 10 y = 16.4.
    z, pct = bmi_for_age(16.4, "male", 120)
    assert abs(z) < 0.05 and 48 < pct < 52
    assert bmi_category(bmi_for_age(30, "male", 150)[0]) == "obesity"
    assert bmi_category(bmi_for_age(12, "female", 100)[0]) == "thinness"
    assert bmi_for_age(20, "male", 240) is None
    from growth.who_growth import height_for_age

    # WHO median height for girls at 12 y is about 151 cm.
    z, pct = height_for_age(151.2, "female", 144)
    assert abs(z) < 0.1 and 45 < pct < 55
