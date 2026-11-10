# Interfaces S (scale) and H (history)

Two independent interfaces for the Body Scale Card. S says who is there, what is
open and who weighs next; H stores finished entries and answers questions about
them over time. Both use flat records (only text, numbers, true/false, null; a
table is a list of such records) and few calls: S has seven, H has four.

| File | What |
|---|---|
| `common.py` | rules, vocabulary, error codes, the generic checkers |
| `scale.py` | interface S: records, the `ScaleInterface` calls, `check_state` |
| `history.py` | interface H: records, the `HistoryInterface` calls, `check_*` answers |
| `fakes.py` | in-memory S and H without Home Assistant (reference and test partner) |
| `examples/` | `state.json`, `entries.json`, `series.json`, `info.json` |

Specification (German): `docs/SPEZIFIKATION_Schnittstellen_Waage_Verlauf.md`.
Checkers return a list of problems, empty when the data follows the interface.
Readers ignore unknown fields and capabilities.
