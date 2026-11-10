/*
 * Module register: register the elements
 *
 * Defines the custom elements (each on its own, so an older copy cannot block the others),
 * adds the card to the card picker and logs the version.
 */

// Each element on its own: an older copy of the card loaded first (e.g. a
// leftover dashboard resource) must not keep the strategy from registering.
const define = (name, cls) => {
  if (!customElements.get(name)) customElements.define(name, cls);
};
define("ll-strategy-dashboard-body-scale-card-dashboard", BodyScaleDashboardStrategy);
define("body-scale-card-editor", BodyScaleCardEditor);
define("body-scale-card", BodyScaleCard);
window.customCards = window.customCards || [];
if (!window.customCards.some((c) => c.type === "body-scale-card")) {
  window.customCards.push({
    type: "body-scale-card",
    name: "Body Scale Card",
    description: "Open measurements with one button per person, history graph and measurement table with move and delete.",
  });
}
console.info(`%c BODY-SCALE-CARD %c ${VERSION} `, "background:#03a9f4;color:#fff", "");
