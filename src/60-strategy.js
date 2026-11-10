/*
 * Module strategy: the dashboard strategy
 *
 * custom:body-scale-card-dashboard builds an overview plus one view per person from the
 * integration's entities, so a dashboard needs no names at all.
 */

// Dashboard strategy: builds an overview plus one view per person from the
// integration's entities, so a dashboard needs no names at all:
//
//   strategy:
//     type: custom:body-scale-card-dashboard
//     language: de      # optional, passed to the cards
//     theme: my-theme   # optional, applied to every view
//     sort: name        # optional, default oldest first
// First letter of the name in a circle: the dashboard header shows one icon per view.
function initialIcon(name) {
  const letter = String(name || "").normalize("NFD").replace(/[^A-Za-z]/g, "").charAt(0).toLowerCase();
  return letter ? `mdi:alpha-${letter}-circle-outline` : null;
}

class BodyScaleDashboardStrategy extends HTMLElement {
  static async generate(config, hass) {
    // Only the card's helpers are needed, not an element: no constructor,
    // which would fail if another copy owns the "body-scale-card" tag.
    const probe = Object.create(BodyScaleCard.prototype);
    probe._config = { language: config.language, sort: config.sort, reference: config.reference, compare_references: config.compare_references, baby_max_months: config.baby_max_months };
    probe._hass = hass;
    const data = probe._discover();
    const lang = (config.language || hass.locale?.language || hass.language || "en").slice(0, 2);
    const t = uiText(lang);
    const common = {
      type: "custom:body-scale-card", title: "",
      ...Object.fromEntries(Object.entries(config).filter(([k, v]) =>
        !["type", "theme", "view_icons", "title", "strategy"].includes(k) && v !== undefined && v !== null)),
    };
    const { title: _noTitle, ...personCard } = common;
    const view = (extra) => ({ type: "sections", ...(config.theme ? { theme: config.theme } : {}), ...extra });
    const pathOf = (p) => `person-${p.id}`.toLowerCase().replace(/[^a-z0-9-]+/g, "-");
    // Generated in each viewer's browser: private people only for themselves.
    const visible = data ? data.people.filter((p) => p.visible) : [];
    // Overview: who weighs next, open measurements, one row per person linking to their view.
    const overview = view({
      title: config.title || t.overview,
      path: "overview",
      icon: "mdi:scale-bathroom",
      max_columns: 1,
      sections: [{ type: "grid", cards: [{
        ...common, overview: true, list: false, links: Object.fromEntries(visible.map((p) => [p.id, pathOf(p)])),
        grid_options: { columns: "full" },
      }] }],
    });
    if (!data) return { title: config.title, views: [overview] };
    const people = visible.map((p) => view({
      title: p.name,
      path: pathOf(p),
      icon: config.view_icons === "initials" ? initialIcon(p.name) || personIcon(probe._profileOf(p)) : personIcon(probe._profileOf(p)),
      max_columns: 1,
      sections: [{
        type: "grid",
        // No empty title here: the card shows the person's name as its heading.
        cards: [{
          ...personCard, person: p.id, next_user: false, hide_empty_pending: true, rows: 30,
          columns: ["weight", "body_mass_index", "body_fat_percentage", "muscle_mass", "body_water_percentage",
            "skeletal_muscle_percentage", "bone_mass", "basal_metabolic_rate"],
          grid_options: { columns: "full" },
        }],
      }],
    }));
    return { title: config.title, views: [overview, ...people] };
  }
}
