/*
 * Body scale card: people, body composition and growth of a smart scale.
 *
 * Shows open (unassigned) measurements with one button per person, and a
 * table of each person's measurements with "move" and "delete" per row.
 * Every change asks for confirmation first. Entities are found
 * automatically; no configuration is required.
 *
 *   type: custom:body-scale-card      
 *   person: jane            # optional: only this person (user id or name)
 *   rows: 10                # optional: rows before "show more"
 *   pending: true           # optional: show open measurements
 *   next_user: true         # optional: "who weighs next" buttons (incl. guest)
 *   chart: true             # optional: history graph from long-term statistics
 *   language: de            # optional: card language (default: profile language)
 *   info: true              # optional: "understanding the values" section
 *   sort: age               # optional: oldest first (default) or "name"
 *   profile: true           # optional: age, height and method under the name
 *   grid: true              # optional: false removes the graph grid and its toggle
 *   curves: true            # optional: false never draws the children's percentile curves
 *   overview: false         # optional: one row per person instead of tabs and graphs
 *   links: {jane: person-jane}  # optional (with overview): view path per person, row opens it; holding a person key opens it too
 *   list: false             # optional (with overview): no rows, the scale's person keys lead to the views
 *   display_hold: 10        # optional: minutes until the scale display goes idle
 *   skin: device            # optional: "theme" draws the scale in the dashboard theme's colours
 *
 * This list is a short overview; every option with its default is in docs/CARD.md
 * and in the visual editor (module 70-editor).
 *
 * The same file provides the dashboard strategy custom:body-scale-card-dashboard (see
 * BodyScaleDashboardStrategy below).
 *   columns: [weight, body_mass_index, body_fat_percentage, muscle_mass]
 */

const VERSION = "0.1.0";
