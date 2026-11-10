"""BMI- and height-for-age after Kromeyer-Hauschild (German reference).

The percentile curves German paediatricians use (Kromeyer-Hauschild et al.
2001, Monatsschrift Kinderheilkunde 149:807-818), as LMS parameters per age
in years from 0 to 18 (monthly steps), taken from the R package childsds. The
tables are in kromeyer_hauschild_2001.json (licence and source there); this
module only reads them.
"""

from __future__ import annotations

import json
from pathlib import Path

_DATA = json.loads(Path(__file__).with_name("kromeyer_hauschild_2001.json").read_text())


def _table(rows):
    return tuple(tuple(r) for r in rows)


# (age_years, L, M, S)
BMI_BOYS = _table(_DATA["bmi"]["male"])
BMI_GIRLS = _table(_DATA["bmi"]["female"])
HEIGHT_BOYS = _table(_DATA["height"]["male"])
HEIGHT_GIRLS = _table(_DATA["height"]["female"])
