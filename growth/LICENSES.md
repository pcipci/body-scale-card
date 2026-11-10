# Licences of the growth tables

The tables are data, kept apart from the card code in their own files. Each file carries its source and licence in the keys `_source` and `_license` at the top.

| File | Source | Licence |
|---|---|---|
| `who_2007.json` | WHO growth reference 2007 (de Onis et al., Bull World Health Organ 85:660-667), 5 to 19 years | CC BY-NC-SA 3.0 IGO |
| `kromeyer_hauschild_2001.json` | Kromeyer-Hauschild et al. 2001 (Monatsschrift Kinderheilkunde 149:807-818), tables from the R package `childsds` | GPL-3.0-or-later (as in `childsds`); rights of the original publication not separately clarified |

Notes (not legal advice):

* The card code is GPL-3.0-or-later (see `../LICENSE`).
* `dist/body-scale-card.js` contains **no table** any more. The tables are shipped as separate files `dist/body-scale-card.growth.*.json` and loaded by the card only after the user allowed it (editor option or the "Enable" button in a child's chart). Whoever redistributes `dist/body-scale-card.growth.who_2007.json` has to respect the terms of the WHO data (attribution, non-commercial, share-alike); the card file itself can be redistributed under the GPL alone, and a package without the WHO file works (no WHO percentiles).
* The WHO terms (NC) and the GPL are different regimes; keeping the data in separate files with their own notice makes clear which terms apply to what.
