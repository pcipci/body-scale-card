"""Percentiles of children's BMI and height against a growth reference.

Two references: the international WHO 2007 reference (5-19 years,
``who_growth``) and the German Kromeyer-Hauschild curves (0-18 years,
``kh_growth``). Both are LMS tables; every value is computed from the exact
age in months, so nothing is looked up in a fixed percentile table.
"""

from __future__ import annotations

from math import exp

from . import kh_growth, who_growth

REFERENCE_WHO = "who"
REFERENCE_KH = "kh"
REFERENCES = (REFERENCE_WHO, REFERENCE_KH)

# Percentile curves drawn on the card and their z-scores.
CURVE_PERCENTILES = (3, 10, 50, 90, 97)
_CURVE_Z = (-1.8808, -1.2816, 0.0, 1.2816, 1.8808)


def _kh_lms(table, months: float):
    years = months / 12
    if years < table[0][0] or years > table[-1][0]:
        return None
    for (a0, *p0), (a1, *p1) in zip(table, table[1:]):
        if a0 <= years <= a1:
            f = (years - a0) / (a1 - a0) if a1 > a0 else 0
            return tuple(x + (y - x) * f for x, y in zip(p0, p1))
    return tuple(table[-1][1:])


def lms(reference: str, kind: str, sex: str, months: float):
    """(L, M, S) or ``None`` outside the reference's age range."""
    female = sex == "female"
    if reference == REFERENCE_KH:
        table = {
            ("bmi", False): kh_growth.BMI_BOYS, ("bmi", True): kh_growth.BMI_GIRLS,
            ("height", False): kh_growth.HEIGHT_BOYS, ("height", True): kh_growth.HEIGHT_GIRLS,
        }[(kind, female)]
        return _kh_lms(table, months)
    if months < who_growth.FIRST_MONTH or months > who_growth.LAST_MONTH:
        return None
    table = {
        ("bmi", False): who_growth._BOYS, ("bmi", True): who_growth._GIRLS,
        ("height", False): who_growth._BOYS_HEIGHT, ("height", True): who_growth._GIRLS_HEIGHT,
    }[(kind, female)]
    return who_growth._lms_at(table, months)


def _value_at(l: float, m: float, s: float, z: float) -> float:
    return m * (1 + l * s * z) ** (1 / l) if l else m * exp(s * z)


def percentile(
    reference: str, kind: str, value: float, sex: str, months: float
) -> tuple[float, float] | None:
    """``(z_score, percentile)`` of ``value`` or ``None`` outside the range."""
    if value <= 0:
        return None
    if reference == REFERENCE_WHO:
        fn = who_growth.bmi_for_age if kind == "bmi" else who_growth.height_for_age
        return fn(value, sex, months)
    params = lms(reference, kind, sex, months)
    if params is None:
        return None
    l, m, s = params
    z = ((value / m) ** l - 1) / (l * s) if l else 0.0
    return round(z, 2), who_growth._percentile(z)


def category(reference: str, z: float) -> str:
    """WHO cut-offs (-2 / +1 / +2 SD) or the German ones (P10 / P90 / P97)."""
    if reference == REFERENCE_KH:
        if z < -1.2816:
            return "thinness"
        if z > 1.8808:
            return "obesity"
        if z > 1.2816:
            return "overweight"
        return "normal"
    return who_growth.bmi_category(z)


def curves(
    reference: str, kind: str, sex: str, from_months: int, to_months: int, step: int = 3
) -> list[list[float]]:
    """``[months, P3, P10, P50, P90, P97]`` rows for the card's background."""
    rows = []
    for months in range(max(0, from_months), to_months + 1, step):
        params = lms(reference, kind, sex, months)
        if params is not None:
            rows.append([months, *(round(_value_at(*params, z), 2) for z in _CURVE_Z)])
    return rows
