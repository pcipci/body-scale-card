"""Shared rules of the two interfaces (scale S and history H).

Every record is flat: only text, numbers, true/false and null. A table is a
list of such records, nothing deeper. Times are ISO 8601 in UTC, dates are plain
dates, unknown is null (never 0). The checkers return a list of problems, empty
when the data follows the interface. Readers ignore what they do not know
(fields, capabilities); the checkers therefore only name what is missing or
wrong.
"""

from __future__ import annotations

import re
from typing import Any

# Units of the measurement vocabulary (columns of an entry; ``weight`` too).
METRIC_UNITS = {
    "weight": "kg",
    "body_mass_index": "kg/m2",
    "body_fat_percentage": "%",
    "body_water_percentage": "%",
    "skeletal_muscle_percentage": "%",
    "protein_percentage": "%",
    "subcutaneous_fat_percentage": "%",
    "muscle_mass": "kg",
    "bone_mass": "kg",
    "fat_free_mass": "kg",
    "basal_metabolic_rate": "kcal",
    "visceral_fat": "",
    "metabolic_age": "",
}
# The columns of an entry that carry body values (all optional).
BODY_COLUMNS = tuple(k for k in METRIC_UNITS if k != "weight")
METHOD_VALUES = ("standard", "alternative")
SEX_VALUES = ("male", "female")

# Error codes of every call.
ERROR_CODES = ("unknown_person", "unknown_measurement", "unknown_entry", "invalid_value", "not_supported")


class InterfaceError(Exception):
    """A call failed: ``code`` is one of ERROR_CODES, ``message`` says why."""

    def __init__(self, code: str, message: str = "") -> None:
        super().__init__(f"{code}: {message}" if message else code)
        self.code = code
        self.message = message


_TIME = re.compile(r"^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d+)?(Z|\+00:00)$")
_DATE = re.compile(r"^\d{4}-\d{2}-\d{2}$")
_SCALAR = (str, int, float, bool, type(None))


def is_time(value: Any) -> bool:
    return isinstance(value, str) and bool(_TIME.match(value))


def is_date(value: Any) -> bool:
    return isinstance(value, str) and bool(_DATE.match(value))


def is_number(value: Any) -> bool:
    return isinstance(value, (int, float)) and not isinstance(value, bool)


def _kind_ok(kind: str, value: Any) -> bool:
    if kind == "text":
        return isinstance(value, str)
    if kind == "number":
        return is_number(value)
    if kind == "bool":
        return isinstance(value, bool)
    if kind == "time":
        return is_time(value)
    if kind == "date":
        return is_date(value)
    if kind.startswith("enum:"):
        return value in kind[5:].split("|")
    raise ValueError(kind)


def check_record(record: Any, schema: dict[str, tuple[str, bool]], where: str) -> list[str]:
    """Check one flat record against ``schema`` = {field: (kind, required)}.

    Every field must be a scalar (flat), required fields must be present and not
    null, known fields must have the right kind (null is fine when optional).
    """
    if not isinstance(record, dict):
        return [f"{where}: a record (object) is expected"]
    problems = []
    for name, value in record.items():
        if not isinstance(value, _SCALAR):
            problems.append(f"{where}.{name}: not flat (only text, number, true/false, null)")
    for name, (kind, required) in schema.items():
        if record.get(name) is None:
            if required:
                problems.append(f"{where}.{name}: required")
            continue
        if isinstance(record[name], _SCALAR) and not _kind_ok(kind, record[name]):
            problems.append(f"{where}.{name}: must be {kind}")
    return problems


def check_table(rows: Any, schema: dict[str, tuple[str, bool]], where: str) -> list[str]:
    if rows is None:
        return []
    if not isinstance(rows, list):
        return [f"{where}: a table (list of records) is expected"]
    problems: list[str] = []
    for i, row in enumerate(rows):
        problems += check_record(row, schema, f"{where}[{i}]")
    return problems


def capability_set(text: Any) -> set[str]:
    """``capabilities`` is flat text, names separated by commas."""
    if not isinstance(text, str):
        return set()
    return {c.strip() for c in text.split(",") if c.strip()}
