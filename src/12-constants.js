/*
 * Module constants: fixed lists and reference values
 *
 * Units, chart views and periods, default table columns, healthy ranges (body fat,
 * muscle, water), the value tiles and which metrics need impedance. No logic.
 */

const UNITS = {
  weight: "kg",
  body_fat_percentage: "%",
  body_water_percentage: "%",
  skeletal_muscle_percentage: "%",
  protein_percentage: "%",
  subcutaneous_fat_percentage: "%",
  muscle_mass: "kg",
  bone_mass: "kg",
  fat_free_mass: "kg",
  basal_metabolic_rate: "kcal",
  impedance: "Ω",
};

// Graph: two values, each with its own axis (`shared: true` would share one).
const CHART_VIEWS = {
  fat: { left: "weight", right: "body_fat_percentage", load: ["weight", "body_fat_percentage"] },
  // Own axis each, too: on one kg axis (20 vs 64 kg) a 1 kg change looks flat.
  composition: { left: "fat_free_mass", right: "fat_mass", load: ["weight", "fat_free_mass"] },
  percentile: { left: "weight", right: "bmi_percentile", load: ["weight", "bmi_percentile"] },
  height: { left: "height", right: "height_percentile", bands: "height_percentile", load: ["height", "height_percentile"] },
  bmi: { left: "body_mass_index", right: "bmi_percentile", bands: "bmi_percentile", load: ["body_mass_index", "bmi_percentile"] },
};
const CHART_UNITS = {
  weight: "kg", fat_mass: "kg", fat_free_mass: "kg", body_fat_percentage: "%",
  bmi_percentile: "P", height: "cm", height_percentile: "P", body_mass_index: "",
};
const CURVE_LABELS = [3, 10, 50, 90, 97];

const PERIODS = {
  month: { days: 30, period: "day" },
  year: { days: 365, period: "day" },
  all: { days: 365 * 30, period: "week" },
};

const DEFAULT_COLUMNS = [
  "weight",
  "body_mass_index",
  "body_fat_percentage",
  "muscle_mass",
  "body_water_percentage",
];

// Healthy body-fat ranges for adults by age (Gallagher et al. 2000,
// Am J Clin Nutr 72:694): [low below, healthy up to, overfat up to].
const FAT_BANDS = {
  male: [[39, 8, 20, 25], [59, 11, 22, 28], [200, 13, 25, 30]],
  female: [[39, 21, 33, 39], [59, 23, 34, 40], [200, 24, 36, 42]],
};
// Skeletal muscle (whole body) of adults by age, Omron Healthcare reference values:
// [age up to, low below, high from].
const SMM_BANDS = {
  male: [[39, 33.3, 39.4], [59, 33.1, 39.2], [200, 32.9, 39.0]],
  female: [[39, 24.3, 30.4], [59, 24.1, 30.2], [200, 23.9, 30.0]],
};
// Typical total body water of adults (consumer BIA reference values).
const WATER_BANDS = { male: [50, 65], female: [45, 60] };

const INFO_METRICS = [
  "body_mass_index",
  "body_fat_percentage",
  "body_water_percentage",
  "skeletal_muscle_percentage",
  "muscle_mass",
  "fat_free_mass",
  "bone_mass",
  "protein_percentage",
  "basal_metabolic_rate",
  "visceral_fat",
  "subcutaneous_fat_percentage",
  "metabolic_age",
  "impedance",
];
const TILE_ORDER = [
  "composition", "body_mass_index", "height", "body_fat_percentage", "visceral_fat", "muscle_mass", "skeletal_muscle_percentage",
  "body_water_percentage", "bone_mass", "subcutaneous_fat_percentage", "fat_free_mass", "protein_percentage",
  "metabolic_age", "basal_metabolic_rate", "impedance",
];
// One symbol per body value (tiles under the graph).
// How long a person key is held to open the person's view.
const HOLD_MS = 800;
// Height of the band above the plot that holds the graph's title and toggles.
const HEAD_H = 38;

const METRIC_ICONS = {
  body_mass_index: "body_scale:bmi", body_fat_percentage: "body_scale:body-fat", body_water_percentage: "mdi:water-percent",
  skeletal_muscle_percentage: "body_scale:knee", muscle_mass: "mdi:arm-flex", fat_free_mass: "mdi:human-male",
  bone_mass: "body_scale:bone-mass", protein_percentage: "mdi:hexagon-multiple-outline", basal_metabolic_rate: "body_scale:basal-metabolic",
  visceral_fat: "mdi:stomach", subcutaneous_fat_percentage: "body_scale:subcutaneous-fat", metabolic_age: "mdi:dna",
  impedance: "mdi:flash-outline",
};
// Estimates the manufacturer's app also shows; adults only, so no tile without a value.
// Values that change with the body-fat method.
const METHOD_VALUES = ["body_fat_percentage", "body_water_percentage", "skeletal_muscle_percentage", "muscle_mass", "fat_free_mass", "bone_mass", "protein_percentage", "basal_metabolic_rate", "visceral_fat", "subcutaneous_fat_percentage", "metabolic_age"];
const ESTIMATES = ["visceral_fat", "subcutaneous_fat_percentage", "metabolic_age"];

// The parts a source may offer: scale (S) and history (H).
const SCALE_CAPS = ["next_user", "pending", "guest", "set_entry", "set_height"];
const HISTORY_SERVICES = { entries: "get_entries", series: "get_series", write: "delete_entry", set_entry: "set_entry", set_height: "set_height" };
// Metrics a line can be asked for (the vocabulary of interface H).
// Values that do not depend on the impedance (the rest needs it for the body values).
const IMPEDANCE_FREE = ["weight", "body_mass_index", "height", "bmi_percentile", "height_percentile"];
const SERIES_METRICS = ["weight", "body_mass_index", "body_fat_percentage", "body_water_percentage", "skeletal_muscle_percentage", "protein_percentage", "subcutaneous_fat_percentage", "muscle_mass", "bone_mass", "fat_free_mass", "basal_metabolic_rate", "visceral_fat", "metabolic_age"];
