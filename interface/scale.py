"""Interface S (scale): who is there, what is open, who weighs next.

Flat records, six calls. The scale side is the only one that calculates body
values: ``set_entry`` turns weight, impedance and the person's profile into a
finished entry and stores it (today in the integration itself; a separate history program is a later extension).
See docs/SPEZIFIKATION_Schnittstellen_Waage_Verlauf.md, section 3.
"""

from __future__ import annotations

from typing import Any, Protocol, runtime_checkable

from .common import METHOD_VALUES, SEX_VALUES, capability_set, check_record, check_table

SCALE_INTERFACE = 1

# Optional parts. The card shows a part only when it is listed here.
CAPABILITIES = (
    "next_user",  # next / next_choices, set_next_user
    "pending",  # pending, pending_candidates, assign_measurement, discard_measurement
    "guest",  # guest: the last reading that was not saved for a person
    "set_entry",  # set_entry (also baby / pet mode and moving an entry)
    "set_height",  # set_height, delete_height
)

SCALE = {
    "scale_interface": ("number", True),
    "capabilities": ("text", True),
    "revision": ("number", True),
    "name": ("text", True),
    "manufacturer": ("text", False),
}
PERSON = {
    "person_id": ("text", True),
    "name": ("text", True),
    "birthdate": ("date", False),
    "sex": ("enum:" + "|".join(SEX_VALUES), False),
    "method": ("enum:" + "|".join(METHOD_VALUES), False),
    "athlete": ("bool", False),
    "private": ("bool", False),
    "owner": ("text", False),
}
HEIGHT = {"person_id": ("text", True), "at": ("time", True), "cm": ("number", True)}
PENDING = {
    "measurement_id": ("text", True),
    "at": ("time", True),
    "weight": ("number", True),
    "impedance": ("number", False),
}
PENDING_CANDIDATE = {"measurement_id": ("text", True), "person_id": ("text", True), "suggested": ("bool", False)}
GUEST = {"at": ("time", True), "weight": ("number", True), "impedance": ("number", False)}
NEXT = {
    "selected": ("text", True),
    "valid_until": ("time", False),
    "auto_selected_at": ("time", False),
    "timeout_minutes": ("number", False),  # default waiting time of a choice
}
NEXT_CHOICE = {
    "choice_id": ("text", True),
    "kind": ("enum:auto|guest|person", True),
    "label": ("text", True),
}


@runtime_checkable
class ScaleInterface(Protocol):
    """The calls of interface S. Offer what the capabilities promise."""

    def get_state(self) -> dict[str, Any]:
        """One flat record ``scale`` and the tables ``people``, ``heights``, ``pending``,
        ``pending_candidates``, ``next_choices``, and the records ``guest`` and ``next``
        (null when not offered or empty)."""

    def set_next_user(self, choice: str, minutes: int | None = None) -> None:
        """Choose who weighs next: ``auto``, ``guest`` or a person_id."""

    def assign_measurement(self, measurement_id: str, person_id: str, clothed: bool = False) -> None:
        """Give an open measurement to a person (calculates and stores the entry)."""

    def discard_measurement(self, measurement_id: str) -> None:
        """Drop an open measurement."""

    def set_entry(
        self, person_id: str, at: str, weight: float, impedance: float | None = None, clothed: bool = False
    ) -> str:
        """Calculate the body values from weight, impedance and the profile, store the
        entry and return its entry_id. An entry of the same person at the same time
        (within a second) is replaced, which is how ``clothed`` is changed afterwards."""

    def set_height(self, person_id: str, cm: float, at: str | None = None) -> None:
        """Add a height (``at`` set: correct that entry)."""

    def delete_height(self, person_id: str, at: str) -> None:
        """Remove one height entry."""


def check_state(state: Any) -> list[str]:
    """Problems of a ``get_state`` answer; empty when it follows the interface."""
    if not isinstance(state, dict):
        return ["state: an object is expected"]
    problems = check_record(state.get("scale"), SCALE, "scale")
    people = state.get("people")
    if not isinstance(people, list) or not people:
        problems.append("people: a table with at least one person is required")
        people = []
    problems += check_table(people, PERSON, "people")
    problems += check_table(state.get("heights"), HEIGHT, "heights")
    problems += check_table(state.get("pending"), PENDING, "pending")
    problems += check_table(state.get("pending_candidates"), PENDING_CANDIDATE, "pending_candidates")
    problems += check_table(state.get("next_choices"), NEXT_CHOICE, "next_choices")
    if state.get("guest") is not None:
        problems += check_record(state["guest"], GUEST, "guest")
    if state.get("next") is not None:
        problems += check_record(state["next"], NEXT, "next")

    ids = [p.get("person_id") for p in people if isinstance(p, dict)]
    if len(ids) != len(set(ids)):
        problems.append("people: person_id must be unique")
    known = set(ids)
    for table in ("heights", "pending_candidates"):
        for i, row in enumerate(state.get(table) or []):
            if isinstance(row, dict) and row.get("person_id") not in known:
                problems.append(f"{table}[{i}].person_id: unknown person")
    pending_ids = {r.get("measurement_id") for r in state.get("pending") or [] if isinstance(r, dict)}
    for i, row in enumerate(state.get("pending_candidates") or []):
        if isinstance(row, dict) and row.get("measurement_id") not in pending_ids:
            problems.append(f"pending_candidates[{i}].measurement_id: unknown measurement")

    caps = capability_set((state.get("scale") or {}).get("capabilities")) if isinstance(state.get("scale"), dict) else set()
    if "next_user" in caps:
        choices = state.get("next_choices") or []
        kinds = {c.get("choice_id"): c.get("kind") for c in choices if isinstance(c, dict)}
        if kinds.get("auto") != "auto" or kinds.get("guest") != "guest":
            problems.append("next_choices: with next_user the choices auto and guest are required")
        if not isinstance(state.get("next"), dict):
            problems.append("next: required with next_user")
        elif state["next"].get("selected") not in kinds:
            problems.append("next.selected: must be one of the next_choices")
        for c in choices:
            if isinstance(c, dict) and c.get("kind") == "person" and c.get("choice_id") not in known:
                problems.append(f"next_choices: {c.get('choice_id')} is not a person")
    return problems
