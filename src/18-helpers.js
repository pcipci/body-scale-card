/*
 * Module helpers: small shared functions
 *
 * Digits per metric, average bone mass, initials, person symbol, HTML escaping, and the
 * conversion of flat interface-H rows to the card's own row names.
 */

const metricDigits = (metric) => (["bmi_percentile", "height", "height_percentile"].includes(metric) ? 0 : metric === "weight" ? 2 : 1);
// Average bone mass by sex and weight (Tanita reference values for adults).
function averageBone(sex, weight) {
  if (sex === "female") return weight < 50 ? 1.95 : weight <= 75 ? 2.4 : 2.95;
  return weight < 65 ? 2.66 : weight <= 95 ? 3.29 : 3.69;
}

// Shortest distinct start of each name: one letter, more where names share it.
const initials = (names) =>
  names.map((name) => {
    const others = names.filter((o) => o !== name).map((o) => o.toLowerCase());
    let k = 1;
    while (k < name.length && others.some((o) => o.startsWith(name.slice(0, k).toLowerCase()))) k += 1;
    return name.slice(0, k);
  });

// Person symbol from the profile: child under 18, otherwise by sex.
const personIcon = (profile) =>
  profile.minor ? "mdi:human-child" : profile.sex === "female" ? "mdi:human-female" : profile.sex === "male" ? "mdi:human-male" : "mdi:account";

const esc = (value) =>
  String(value ?? "").replace(/[&<>"']/g, (c) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
  })[c]);

// One entry of interface H (a flat row): the card's own names are `measurement_id`
// for `entry_id` and `timestamp` for `at`.
function entryRow(row) {
  return { ...row, measurement_id: row.entry_id, timestamp: row.at };
}

// The other body-fat methods of the newest entry (`entry_variants`, flat rows)
// as the nested table the comparison shows: methods[standard|alternative][normal|athlete].
function variantMethods(variants) {
  const out = {};
  for (const v of variants || []) {
    const values = {};
    for (const [k, x] of Object.entries(v)) if (typeof x === "number") values[k] = x;
    ((out[v.method] = out[v.method] || {})[v.athlete ? "athlete" : "normal"]) = values;
  }
  return Object.keys(out).length ? out : null;
}
