"""BMI- and height-for-age of children and teenagers (WHO growth reference 2007).

Adult BMI bands and the scale's body-fat formulas do not apply under 18.
What does is the BMI (and height) relative to children of the same age
and sex. The WHO reference gives, per month of age from 5 to 19 years,
the LMS parameters of each distribution (de Onis et al. 2007, Bull World
Health Organ 85:660-7). The tables are in who_2007.json (licence and source
there); this module only reads them.
"""

from __future__ import annotations

import json
from math import erf, sqrt
from pathlib import Path

_DATA = json.loads(Path(__file__).with_name("who_2007.json").read_text())


def _table(rows):
    return tuple(tuple(r) for r in rows)


FIRST_MONTH = _DATA["first_month"]
LAST_MONTH = _DATA["last_month"]
_BOYS = _table(_DATA["bmi"]["male"])
_GIRLS = _table(_DATA["bmi"]["female"])
_BOYS_HEIGHT = _table(_DATA["height"]["male"])
_GIRLS_HEIGHT = _table(_DATA["height"]["female"])


def _lms_at(table, age_months: float) -> tuple[float, float, float]:
    low = int(age_months) - FIRST_MONTH
    high = min(low + 1, len(table) - 1)
    frac = age_months - int(age_months)
    return tuple(a + (b - a) * frac for a, b in zip(table[low], table[high]))


def _percentile(z: float) -> float:
    return round(50 * (1 + erf(z / sqrt(2))), 1)


def bmi_for_age(bmi: float, sex: str, age_months: float) -> tuple[float, float] | None:
    """Return ``(z_score, percentile)`` or ``None`` outside 5-19 years."""
    if bmi <= 0 or age_months < FIRST_MONTH or age_months > LAST_MONTH:
        return None
    l, m, s = _lms_at(_GIRLS if sex == "female" else _BOYS, age_months)
    z = ((bmi / m) ** l - 1) / (l * s)
    # Beyond +-3 SD the WHO extends the curve linearly in BMI units.
    if abs(z) > 3:
        sign = 1 if z > 0 else -1
        sd3 = m * (1 + l * s * 3 * sign) ** (1 / l)
        sd2 = m * (1 + l * s * 2 * sign) ** (1 / l)
        z = sign * 3 + (bmi - sd3) / abs(sd3 - sd2)
    return round(z, 2), _percentile(z)


def height_for_age(height_cm: float, sex: str, age_months: float) -> tuple[float, float] | None:
    """Return ``(z_score, percentile)`` or ``None`` outside 5-19 years."""
    if height_cm <= 0 or age_months < FIRST_MONTH or age_months > LAST_MONTH:
        return None
    l, m, s = _lms_at(_GIRLS_HEIGHT if sex == "female" else _BOYS_HEIGHT, age_months)
    z = ((height_cm / m) ** l - 1) / (l * s)
    return round(z, 2), _percentile(z)

def bmi_category(z: float) -> str:
    """WHO cut-offs for 5-19 years."""
    if z < -2:
        return "thinness"
    if z > 2:
        return "obesity"
    if z > 1:
        return "overweight"
    return "normal"
