"""Interface H (history): entries and lines over time.

Flat records, five calls. H does not know the scale: it stores finished entries
and answers questions about them. Any program can serve it (Home Assistant's
recorder, a SQL database, a file). See docs/SPEZIFIKATION_Schnittstellen_Waage_Verlauf.md,
section 4.
"""

from __future__ import annotations

from typing import Any, Protocol, runtime_checkable

from .common import BODY_COLUMNS, METHOD_VALUES, METRIC_UNITS, capability_set, check_record, check_table

HISTORY_INTERFACE = 1

CAPABILITIES = (
    "entries",  # get_entries
    "series",  # get_series
    "variants",  # entry_variants: the other body-fat methods for comparison
    "write",  # delete_entry
)

BUCKETS = ("hour", "day", "week", "month")
CLOTHED_FILTERS = ("any", "yes", "no")
IMPEDANCE_FILTERS = ("any", "with", "without")
SOURCES = ("statistics", "entries")
MAX_POINTS = 2000  # points of one get_series answer
MAX_ENTRIES = 1000  # entries of one get_entries answer
DEFAULT_ENTRIES = 100

_METHOD = "enum:" + "|".join(METHOD_VALUES)
INFO = {"history_interface": ("number", True), "capabilities": ("text", True), "name": ("text", True)}
ENTRY = {
    "entry_id": ("text", True),
    "person_id": ("text", True),
    "at": ("time", True),
    "weight": ("number", True),
    "impedance": ("number", False),
    "method": (_METHOD, False),
    "athlete": ("bool", False),
    "replaced": ("bool", False),
    "clothed": ("bool", False),  # missing = false (without clothes)
    **{k: ("number", False) for k in BODY_COLUMNS},
}
ENTRY_VARIANT = {
    "entry_id": ("text", True),
    "method": (_METHOD, True),
    "athlete": ("bool", False),
    **{k: ("number", False) for k in BODY_COLUMNS},
}
POINT = {
    "person_id": ("text", True),
    "metric": ("text", True),
    "at": ("time", True),
    "value": ("number", True),
    "n": ("number", False),
}
SERIES_INFO = {"source": ("enum:" + "|".join(SOURCES), True), "entries_from": ("time", False)}
METHOD_CHANGE = {
    "person_id": ("text", True),
    "at": ("time", True),
    "from_method": (_METHOD, True),
    "to_method": (_METHOD, True),
    "from_athlete": ("bool", False),
    "to_athlete": ("bool", False),
}


@runtime_checkable
class HistoryInterface(Protocol):
    """The calls of interface H."""

    def get_info(self) -> dict[str, Any]:
        """The flat record ``history``: history_interface, capabilities, name."""

    def get_entries(
        self,
        person_id: str,
        from_: str | None = None,
        to: str | None = None,
        limit: int = DEFAULT_ENTRIES,
        entry_id: str | None = None,
        variants: bool = False,
        clothed: str = "any",
        impedance: str = "any",
    ) -> dict[str, list[dict[str, Any]]]:
        """``entries`` (newest first, at most ``limit`` <= 1000) and ``entry_variants``.
        ``clothed`` is any / yes / no, ``impedance`` is any / with / without."""

    def get_series(
        self,
        person_id: str,
        metric: str,
        from_: str,
        to: str,
        bucket: str,
        tz: str = "UTC",
        clothed: str = "any",
        impedance: str = "any",
    ) -> dict[str, Any]:
        """``points`` (window mean per bucket, at most 2000), ``method_changes`` and the
        record ``series_info``. Without a filter a source may answer from long-term
        statistics; with a filter only from the single entries (``entries_from`` says
        from when they exist)."""

    def delete_entry(self, person_id: str, entry_id: str) -> None:
        """Delete one entry."""


def check_info(info: Any) -> list[str]:
    return check_record(info, INFO, "history")


def check_entry(entry: Any) -> list[str]:
    return check_record(entry, ENTRY, "entry")


def check_entries_answer(answer: Any) -> list[str]:
    """Problems of a ``get_entries`` answer."""
    if not isinstance(answer, dict):
        return ["answer: an object is expected"]
    problems = check_table(answer.get("entries"), ENTRY, "entries")
    problems += check_table(answer.get("entry_variants"), ENTRY_VARIANT, "entry_variants")
    rows = answer.get("entries") or []
    ats = [r.get("at") for r in rows if isinstance(r, dict) and isinstance(r.get("at"), str)]
    if ats != sorted(ats, reverse=True):
        problems.append("entries: newest first")
    if len(rows) > MAX_ENTRIES:
        problems.append(f"entries: at most {MAX_ENTRIES} per answer")
    ids = {r.get("entry_id") for r in rows if isinstance(r, dict)}
    for i, v in enumerate(answer.get("entry_variants") or []):
        if isinstance(v, dict) and v.get("entry_id") not in ids:
            problems.append(f"entry_variants[{i}].entry_id: not in entries")
    return problems


def check_series_answer(answer: Any) -> list[str]:
    """Problems of a ``get_series`` answer."""
    if not isinstance(answer, dict):
        return ["answer: an object is expected"]
    problems = check_table(answer.get("points"), POINT, "points")
    problems += check_table(answer.get("method_changes"), METHOD_CHANGE, "method_changes")
    problems += check_record(answer.get("series_info"), SERIES_INFO, "series_info")
    points = answer.get("points") or []
    if len(points) > MAX_POINTS:
        problems.append(f"points: at most {MAX_POINTS} per answer")
    for i, p in enumerate(points):
        if isinstance(p, dict) and p.get("metric") not in METRIC_UNITS:
            problems.append(f"points[{i}].metric: unknown metric")
    ats = [p.get("at") for p in points if isinstance(p, dict) and isinstance(p.get("at"), str)]
    if ats != sorted(ats):
        problems.append("points: oldest first")
    return problems


def has_capability(info: dict[str, Any], name: str) -> bool:
    return name in capability_set(info.get("capabilities"))
