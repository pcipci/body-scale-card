"""Interfaces S (scale) and H (history): checkers, examples, in-memory providers."""

from __future__ import annotations

import copy
import json
from pathlib import Path

import pytest

from interface.common import InterfaceError
from interface.fakes import FakeHistory, FakeScale
from interface.history import (
    MAX_ENTRIES,
    MAX_POINTS,
    HistoryInterface,
    check_entries_answer,
    check_entry,
    check_info,
    check_series_answer,
)
from interface.scale import ScaleInterface, check_state

EXAMPLES = Path(__file__).resolve().parent.parent / "interface" / "examples"


def _load(name):
    return json.loads((EXAMPLES / name).read_text())


def _world():
    h = FakeHistory()
    s = FakeScale(h)
    s.add_person("jane", "Jane", birthdate="1987-03-02", sex="female", method="standard")
    s.add_person("tom", "Tom", birthdate="2015-06-20", sex="male")
    s.set_height("jane", 168.5, "2025-04-02T07:00:00Z")
    return s, h


def test_examples_follow_the_interfaces():
    assert check_state(_load("state.json")) == []
    assert check_info(_load("info.json")) == []
    assert check_entries_answer(_load("entries.json")) == []
    assert check_series_answer(_load("series.json")) == []
    assert check_series_answer(_load("series_clothed.json")) == []


def test_providers_implement_the_protocols():
    s, h = _world()
    assert isinstance(s, ScaleInterface) and isinstance(h, HistoryInterface)


def test_flatness_is_enforced():
    state = _load("state.json")
    state["people"][0]["profile"] = {"sex": "female"}  # a record inside a record
    assert any("not flat" in p for p in check_state(state))
    bad = copy.deepcopy(_load("entries.json"))
    bad["entries"][0]["values"] = {"body_fat_percentage": 20}
    assert any("not flat" in p for p in check_entries_answer(bad))


def test_required_fields_types_and_times():
    state = _load("state.json")
    del state["scale"]["revision"]
    state["heights"][0]["at"] = "2025-04-02 07:00"  # no UTC time
    state["people"][0]["sex"] = "x"
    problems = check_state(state)
    assert any("scale.revision" in p for p in problems)
    assert any("heights[0].at" in p for p in problems)
    assert any("people[0].sex" in p for p in problems)
    assert check_state({}) and check_state(None)


def test_references_and_next_user_rules():
    state = _load("state.json")
    state["pending_candidates"][0]["measurement_id"] = "nope"
    state["next"]["selected"] = "ghost"
    state["next_choices"] = [c for c in state["next_choices"] if c["choice_id"] != "guest"]
    problems = check_state(state)
    assert any("unknown measurement" in p for p in problems)
    assert any("auto and guest" in p for p in problems)
    assert any("next.selected" in p for p in problems)


def test_unknown_fields_and_capabilities_are_not_errors():
    state = _load("state.json")
    state["scale"]["capabilities"] += ",something_new"
    state["people"][0]["shoe_size"] = 40
    assert check_state(state) == []


def test_calculation_is_on_the_scale_side_and_the_entry_lands_in_history():
    s, h = _world()
    entry_id = s.set_entry("jane", "2026-11-01T06:30:00Z", 71.4, 498)
    row = h.entries[entry_id]
    assert row["body_mass_index"] == pytest.approx(25.1, abs=0.05)  # 71.4 / 1.685^2
    assert check_entry(row) == []
    # an open measurement is assigned: calculated and stored, no longer pending
    mid = s.receive("2026-11-02T06:30:00Z", 71.0, 497, ("jane", "tom"))
    assert check_state(s.get_state()) == []
    s.assign_measurement(mid, "jane")
    assert s.get_state()["pending"] == [] and s.get_state()["pending_candidates"] == []
    assert len(h.get_entries("jane")["entries"]) == 2
    # moving = set_entry for the other person, then delete_entry at the first
    s.set_height("tom", 140, "2026-05-01T07:00:00Z")
    new_id = s.set_entry("tom", "2026-11-02T06:30:00Z", 71.0, 497)
    h.delete_entry("jane", f"jane:2026-11-02T06:30:00Z")
    assert [r["entry_id"] for r in h.get_entries("tom")["entries"]] == [new_id]
    assert len(h.get_entries("jane")["entries"]) == 1


def test_revision_changes_with_every_change():
    s, _h = _world()
    r = s.get_state()["scale"]["revision"]
    s.set_next_user("guest")
    assert s.get_state()["scale"]["revision"] > r and s.get_state()["next"]["selected"] == "guest"
    r = s.get_state()["scale"]["revision"]
    s.set_height("jane", 169.0)
    assert s.get_state()["scale"]["revision"] > r


def test_entries_newest_first_range_limit_and_paging():
    s, h = _world()
    for day in range(1, 9):
        s.set_entry("jane", f"2026-11-0{day}T06:30:00Z", 70 + day / 10)
    first = h.get_entries("jane", limit=3)
    assert [r["at"][:10] for r in first["entries"]] == ["2026-11-08", "2026-11-07", "2026-11-06"]
    assert check_entries_answer(first) == []
    # next block: from the day before the oldest one seen
    nxt = h.get_entries("jane", to="2026-11-05T23:59:59Z", limit=3)
    assert [r["at"][:10] for r in nxt["entries"]] == ["2026-11-05", "2026-11-04", "2026-11-03"]
    ranged = h.get_entries("jane", from_="2026-11-02T00:00:00Z", to="2026-11-03T23:59:59Z")
    assert len(ranged["entries"]) == 2
    with pytest.raises(InterfaceError) as err:
        h.get_entries("jane", limit=MAX_ENTRIES + 1)
    assert err.value.code == "invalid_value"


def test_series_buckets_method_changes_and_limits():
    s, h = _world()
    for day, weight in ((2, 71.0), (3, 70.0), (9, 69.0)):
        s.set_entry("jane", f"2026-11-0{day}T06:30:00Z", weight)
    h.entries["jane:2026-11-09T06:30:00Z"]["method"] = "alternative"
    answer = h.get_series("jane", "weight", "2026-11-01T00:00:00Z", "2026-11-30T00:00:00Z", "week")
    assert check_series_answer(answer) == []
    assert [(p["at"][:10], p["value"], p["n"]) for p in answer["points"]] == [("2026-11-02", 70.5, 2), ("2026-11-09", 69.0, 1)]  # weeks start on Monday
    assert answer["method_changes"] == [
        {"person_id": "jane", "at": "2026-11-09T06:30:00Z", "from_method": "standard", "to_method": "alternative"}
    ]
    day = h.get_series("jane", "body_mass_index", "2026-11-01T00:00:00Z", "2026-11-30T00:00:00Z", "day")
    assert len(day["points"]) == 3 and all(p["metric"] == "body_mass_index" for p in day["points"])
    # a day starts at local midnight when a time zone is given
    local = h.get_series("jane", "weight", "2026-11-01T00:00:00Z", "2026-11-30T00:00:00Z", "day", tz="Europe/Berlin")
    assert local["points"][0]["at"] == "2026-11-01T23:00:00Z"
    for bad in (("nothing", "day"), ("weight", "year")):
        with pytest.raises(InterfaceError) as err:
            h.get_series("jane", bad[0], "2026-11-01T00:00:00Z", "2026-11-30T00:00:00Z", bad[1])
        assert err.value.code == "invalid_value"


def test_series_refuses_too_many_points():
    from datetime import datetime, timedelta, timezone

    start = datetime(2020, 1, 1, tzinfo=timezone.utc)
    h = FakeHistory()
    for i in range(MAX_POINTS + 5):
        when = (start + timedelta(hours=i)).strftime("%Y-%m-%dT%H:%M:%SZ")
        h.put_entry({"entry_id": f"e{i}", "person_id": "jane", "at": when, "weight": 70.0})
    with pytest.raises(InterfaceError) as err:
        h.get_series("jane", "weight", "2020-01-01T00:00:00Z", "2021-01-01T00:00:00Z", "hour")
    assert err.value.code == "invalid_value"
    assert len(h.get_series("jane", "weight", "2020-01-01T00:00:00Z", "2021-01-01T00:00:00Z", "day")["points"]) < MAX_POINTS


def test_errors_have_codes():
    s, h = _world()
    for call, code in (
        (lambda: s.set_entry("nobody", "2026-11-01T06:30:00Z", 70), "unknown_person"),
        (lambda: s.set_entry("jane", "2026-11-01T06:30:00Z", 0), "invalid_value"),
        (lambda: s.assign_measurement("m99", "jane"), "unknown_measurement"),
        (lambda: s.set_next_user("ghost"), "unknown_person"),
        (lambda: h.delete_entry("jane", "nothing"), "unknown_entry"),
        (lambda: h.put_entry({"entry_id": "x"}), "invalid_value"),
    ):
        with pytest.raises(InterfaceError) as err:
            call()
        assert err.value.code == code


def test_scale_without_history_target_cannot_store():
    s = FakeScale(None)
    s.add_person("jane", "Jane")
    with pytest.raises(InterfaceError) as err:
        s.set_entry("jane", "2026-11-01T06:30:00Z", 70)
    assert err.value.code == "not_supported"


def test_clothed_defaults_to_without_and_is_set_by_replacing():
    s, h = _world()
    s.set_entry("jane", "2026-11-01T06:30:00Z", 71.4, 498)
    assert h.entries["jane:2026-11-01T06:30:00Z"]["clothed"] is False
    # a stored entry without the field counts as without clothes
    h.put_entry({"entry_id": "old", "person_id": "jane", "at": "2026-10-01T06:30:00Z", "weight": 72.0})
    assert [r["entry_id"] for r in h.get_entries("jane", clothed="no")["entries"]] == ["jane:2026-11-01T06:30:00Z", "old"]
    assert h.get_entries("jane", clothed="yes")["entries"] == []
    # changing it afterwards = set_entry again for the same time (within a second): one entry, not two
    s.set_entry("jane", "2026-11-01T06:30:00Z", 71.4, 498, clothed=True)
    assert len(h.get_entries("jane")["entries"]) == 2
    assert [r["entry_id"] for r in h.get_entries("jane", clothed="yes")["entries"]] == ["jane:2026-11-01T06:30:00Z"]
    # assigning an open measurement can set it at once
    mid = s.receive("2026-11-02T06:30:00Z", 72.5, None, ("jane",))
    s.assign_measurement(mid, "jane", clothed=True)
    assert h.entries["jane:2026-11-02T06:30:00Z"]["clothed"] is True


def test_impedance_and_clothed_filters_in_entries_and_series():
    s, h = _world()
    s.set_entry("jane", "2026-11-01T06:30:00Z", 71.0, 498)
    s.set_entry("jane", "2026-11-02T06:30:00Z", 72.0, None, clothed=True)
    s.set_entry("jane", "2026-11-03T06:30:00Z", 71.4, 500, clothed=True)
    ids = lambda **f: [r["at"][:10] for r in h.get_entries("jane", **f)["entries"]]
    assert ids(impedance="with") == ["2026-11-03", "2026-11-01"]
    assert ids(impedance="without") == ["2026-11-02"]
    assert ids(clothed="yes", impedance="with") == ["2026-11-03"]
    args = ("jane", "weight", "2026-11-01T00:00:00Z", "2026-11-30T00:00:00Z", "day")
    assert [p["value"] for p in h.get_series(*args, clothed="yes")["points"]] == [72.0, 71.4]
    assert [p["value"] for p in h.get_series(*args, clothed="no")["points"]] == [71.0]
    answer = h.get_series(*args, clothed="no")
    assert answer["series_info"] == {"source": "entries", "entries_from": "2026-11-01T06:30:00Z"}
    assert check_series_answer(answer) == []
    for bad in ({"clothed": "maybe"}, {"impedance": "some"}):
        with pytest.raises(InterfaceError) as err:
            h.get_entries("jane", **bad)
        assert err.value.code == "invalid_value"
