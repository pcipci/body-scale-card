"""What the card source must (not) contain: names, interface use, capabilities."""

from pathlib import Path

SRC = (Path(__file__).resolve().parent.parent / "dist" / "body-scale-card.js").read_text()


def test_names():
    for name in ("body-scale-card", "body-scale-card-editor", "ll-strategy-dashboard-body-scale-card-dashboard"):
        assert f'"{name}"' in SRC
    assert "renpho-scale-card" not in SRC and "renpho-familie-card" not in SRC
    assert 'GLOBAL_STORE_KEY = "body_scale_card"' in SRC and 'OLD_STORE_KEY = "renpho_scale_card"' in SRC
    assert "window.customIcons.body_scale" in SRC and "body_scale_height" in SRC


def test_only_the_two_interfaces():
    assert "scale?.scale_interface === 1" in SRC and "attributes.contract" not in SRC and "entries_entity" not in SRC
    assert "translation_key" not in SRC and "platform ===" not in SRC and "DOMAIN" not in SRC
    assert "remove_measurement" not in SRC and "reassign_measurement" not in SRC
    assert '"delete_entry", { person_id: d.user, entry_id: d.mid }' in SRC
    # no recorder, no entity history: lines and method switches come from get_series
    assert "recorder/statistics_during_period" not in SRC and "history/history_during_period" not in SRC
    assert '"get_series"' in SRC and '"get_entries"' in SRC and "method_changes" in SRC


def test_parts_follow_capabilities():
    assert "_can(cap)" in SRC and 'has("pending")' in SRC and 'has("next_user")' in SRC and 'has("guest")' in SRC
    assert '_can("write")' in SRC and '_can("set_height")' in SRC and '_can("set_entry")' in SRC


def test_no_brand_in_texts():
    assert "Renpho-App" not in SRC and "Renpho app" not in SRC and "Renpho-Waage" not in SRC
