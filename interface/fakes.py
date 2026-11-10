"""In-memory stand-ins for S and H, without Home Assistant.

They are the reference for what a provider must do and the test partner for the
card and for real providers. ``FakeScale`` calculates the one body value it can
(BMI from the person's height) to show where calculation happens: on the scale
side, before the entry goes to the history target.
"""

from __future__ import annotations

from collections import defaultdict
from datetime import datetime, timedelta, timezone
from typing import Any
from zoneinfo import ZoneInfo

from .common import BODY_COLUMNS, METRIC_UNITS, InterfaceError
from .history import (
    BUCKETS,
    CLOTHED_FILTERS,
    DEFAULT_ENTRIES,
    HISTORY_INTERFACE,
    IMPEDANCE_FILTERS,
    MAX_ENTRIES,
    MAX_POINTS,
    check_entry,
)
from .scale import SCALE_INTERFACE


def _parse(text: str) -> datetime:
    return datetime.fromisoformat(text.replace("Z", "+00:00")).astimezone(timezone.utc)


def _iso(when: datetime) -> str:
    return when.astimezone(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")


def _passes(row: dict[str, Any], clothed: str, impedance: str) -> bool:
    if clothed not in CLOTHED_FILTERS or impedance not in IMPEDANCE_FILTERS:
        raise InterfaceError("invalid_value", "clothed: any|yes|no, impedance: any|with|without")
    if clothed != "any" and bool(row.get("clothed", False)) != (clothed == "yes"):
        return False
    has = row.get("impedance") is not None
    return impedance == "any" or has == (impedance == "with")


def _bucket_start(when: datetime, bucket: str, tz: ZoneInfo) -> datetime:
    local = when.astimezone(tz)
    if bucket == "hour":
        local = local.replace(minute=0, second=0, microsecond=0)
    elif bucket == "day":
        local = local.replace(hour=0, minute=0, second=0, microsecond=0)
    elif bucket == "week":
        local = (local - timedelta(days=local.weekday())).replace(hour=0, minute=0, second=0, microsecond=0)
    else:
        local = local.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
    return local.astimezone(timezone.utc)


class FakeHistory:
    """Interface H in memory."""

    def __init__(self, name: str = "Fake history", capabilities: str = "entries,series,variants,write") -> None:
        self.name = name
        self.capabilities = capabilities
        self.entries: dict[str, dict[str, Any]] = {}
        self.variants: dict[str, list[dict[str, Any]]] = {}

    def get_info(self) -> dict[str, Any]:
        return {"history_interface": HISTORY_INTERFACE, "capabilities": self.capabilities, "name": self.name}

    def put_entry(self, entry: dict[str, Any], variants: list[dict[str, Any]] | None = None) -> None:
        """Test helper: how the fake scale stores (not part of interface H)."""
        problems = check_entry(entry)
        if problems:
            raise InterfaceError("invalid_value", "; ".join(problems))
        self.entries[entry["entry_id"]] = dict(entry)
        if variants:
            self.variants[entry["entry_id"]] = [dict(v) for v in variants]

    def delete_entry(self, person_id: str, entry_id: str) -> None:
        row = self.entries.get(entry_id)
        if row is None or row["person_id"] != person_id:
            raise InterfaceError("unknown_entry", entry_id)
        del self.entries[entry_id]
        self.variants.pop(entry_id, None)

    def get_entries(
        self, person_id, from_=None, to=None, limit=DEFAULT_ENTRIES, entry_id=None, variants=False,
        clothed="any", impedance="any",
    ):
        if not 1 <= limit <= MAX_ENTRIES:
            raise InterfaceError("invalid_value", f"limit must be 1 to {MAX_ENTRIES}")
        rows = [r for r in self.entries.values() if r["person_id"] == person_id and _passes(r, clothed, impedance)]
        if entry_id is not None:
            rows = [r for r in rows if r["entry_id"] == entry_id]
        if from_ is not None:
            rows = [r for r in rows if _parse(r["at"]) >= _parse(from_)]
        if to is not None:
            rows = [r for r in rows if _parse(r["at"]) <= _parse(to)]
        rows = sorted(rows, key=lambda r: r["at"], reverse=True)[:limit]
        out: dict[str, list[dict[str, Any]]] = {"entries": [dict(r) for r in rows], "entry_variants": []}
        if variants and rows:
            out["entry_variants"] = [dict(v) for v in self.variants.get(rows[0]["entry_id"], [])]
        return out

    def get_series(self, person_id, metric, from_, to, bucket, tz="UTC", clothed="any", impedance="any"):
        if metric not in METRIC_UNITS:
            raise InterfaceError("invalid_value", f"unknown metric {metric}")
        if bucket not in BUCKETS:
            raise InterfaceError("invalid_value", f"bucket must be one of {', '.join(BUCKETS)}")
        zone = ZoneInfo(tz)
        sums: dict[datetime, list[float]] = defaultdict(list)
        mine = sorted((r for r in self.entries.values() if r["person_id"] == person_id), key=lambda r: r["at"])
        rows = [r for r in mine if _passes(r, clothed, impedance)]
        changes = []
        previous = None
        for row in rows:
            when = _parse(row["at"])
            method = row.get("method")
            if method and previous and method != previous and _parse(from_) <= when <= _parse(to):
                changes.append({"person_id": person_id, "at": row["at"], "from_method": previous, "to_method": method})
            previous = method or previous
            if _parse(from_) <= when <= _parse(to) and row.get(metric) is not None:
                sums[_bucket_start(when, bucket, zone)].append(float(row[metric]))
        if len(sums) > MAX_POINTS:
            raise InterfaceError("invalid_value", f"more than {MAX_POINTS} points; use a larger bucket")
        points = [
            {"person_id": person_id, "metric": metric, "at": _iso(start), "value": round(sum(v) / len(v), 3), "n": len(v)}
            for start, v in sorted(sums.items())
        ]
        # An in-memory history only knows single entries, so it always answers from them.
        info = {"source": "entries", "entries_from": mine[0]["at"] if mine else None}
        return {"points": points, "method_changes": changes, "series_info": info}


class FakeScale:
    """Interface S in memory, with an optional history target (interface H)."""

    def __init__(self, history: FakeHistory | None = None, name: str = "Fake scale") -> None:
        self.history = history
        self.name = name
        self.people: dict[str, dict[str, Any]] = {}
        self.heights: list[dict[str, Any]] = []
        self.pending: list[dict[str, Any]] = []
        self.candidates: list[dict[str, Any]] = []
        self.guest: dict[str, Any] | None = None
        self.selected = "auto"
        self.revision = 1
        self._counter = 0

    # -- setup helpers (not part of the interface)
    def add_person(self, person_id: str, name: str, **fields: Any) -> None:
        self.people[person_id] = {"person_id": person_id, "name": name, **fields}
        self.revision += 1

    def receive(self, at: str, weight: float, impedance: float | None = None, candidates: tuple[str, ...] = ()) -> str:
        """A reading that no one is sure about (as from Bluetooth)."""
        self._counter += 1
        mid = f"m{self._counter}"
        self.pending.append({"measurement_id": mid, "at": at, "weight": weight, "impedance": impedance})
        self.candidates += [
            {"measurement_id": mid, "person_id": c, "suggested": i == 0} for i, c in enumerate(candidates)
        ]
        self.revision += 1
        return mid

    # -- interface S
    def get_state(self) -> dict[str, Any]:
        caps = "next_user,pending,guest,set_entry,set_height"
        choices = [
            {"choice_id": "auto", "kind": "auto", "label": "Automatic"},
            {"choice_id": "guest", "kind": "guest", "label": "Guest"},
            *({"choice_id": p, "kind": "person", "label": v["name"]} for p, v in self.people.items()),
        ]
        return {
            "scale": {"scale_interface": SCALE_INTERFACE, "capabilities": caps, "revision": self.revision, "name": self.name},
            "people": [dict(p) for p in self.people.values()],
            "heights": [dict(h) for h in self.heights],
            "pending": [dict(p) for p in self.pending],
            "pending_candidates": [dict(c) for c in self.candidates],
            "guest": dict(self.guest) if self.guest else None,
            "next": {"selected": self.selected, "valid_until": None, "auto_selected_at": None},
            "next_choices": choices,
        }

    def set_next_user(self, choice: str, minutes: int | None = None) -> None:
        if choice not in ("auto", "guest") and choice not in self.people:
            raise InterfaceError("unknown_person", choice)
        self.selected = choice
        self.revision += 1

    def assign_measurement(self, measurement_id: str, person_id: str, clothed: bool = False) -> None:
        row = next((p for p in self.pending if p["measurement_id"] == measurement_id), None)
        if row is None:
            raise InterfaceError("unknown_measurement", measurement_id)
        self.set_entry(person_id, row["at"], row["weight"], row["impedance"], clothed)
        self.discard_measurement(measurement_id)

    def discard_measurement(self, measurement_id: str) -> None:
        if not any(p["measurement_id"] == measurement_id for p in self.pending):
            raise InterfaceError("unknown_measurement", measurement_id)
        self.pending = [p for p in self.pending if p["measurement_id"] != measurement_id]
        self.candidates = [c for c in self.candidates if c["measurement_id"] != measurement_id]
        self.revision += 1

    def set_entry(
        self, person_id: str, at: str, weight: float, impedance: float | None = None, clothed: bool = False
    ) -> str:
        person = self.people.get(person_id)
        if person is None:
            raise InterfaceError("unknown_person", person_id)
        if not weight or weight <= 0:
            raise InterfaceError("invalid_value", "weight must be positive")
        when = _parse(at)
        heights = sorted((h for h in self.heights if h["person_id"] == person_id and _parse(h["at"]) <= when), key=lambda h: h["at"])
        entry: dict[str, Any] = {
            "entry_id": f"{person_id}:{_iso(when)}",
            "person_id": person_id,
            "at": _iso(when),
            "weight": round(float(weight), 2),
            "impedance": impedance,
            "method": person.get("method", "standard"),
            "athlete": bool(person.get("athlete", False)),
            "replaced": False,
            "clothed": bool(clothed),
        }
        if heights:
            entry["body_mass_index"] = round(weight / (heights[-1]["cm"] / 100) ** 2, 1)
        for column in BODY_COLUMNS:
            entry.setdefault(column, None)
        if self.history is None:
            raise InterfaceError("not_supported", "no history target")
        # An entry of this person within a second of this time is replaced.
        for old in [e for e in self.history.entries.values() if e["person_id"] == person_id and abs((_parse(e["at"]) - when).total_seconds()) < 1]:
            del self.history.entries[old["entry_id"]]
        self.history.put_entry(entry)
        self.revision += 1
        return entry["entry_id"]

    def set_height(self, person_id: str, cm: float, at: str | None = None) -> None:
        if person_id not in self.people:
            raise InterfaceError("unknown_person", person_id)
        if not 30 <= cm <= 250:
            raise InterfaceError("invalid_value", "cm must be 30 to 250")
        stamp = at or _iso(datetime.now(timezone.utc))
        self.heights = [h for h in self.heights if not (h["person_id"] == person_id and h["at"] == stamp)]
        self.heights.append({"person_id": person_id, "at": stamp, "cm": float(cm)})
        self.revision += 1

    def delete_height(self, person_id: str, at: str) -> None:
        before = len(self.heights)
        self.heights = [h for h in self.heights if not (h["person_id"] == person_id and h["at"] == at)]
        if len(self.heights) == before:
            raise InterfaceError("not_supported", "no such height entry")
        self.revision += 1
