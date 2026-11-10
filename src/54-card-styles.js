/*
 * Module card-styles: CSS
 *
 * The stylesheet of the card as one template string (all themes, skins and the legend).
 */

mixin(BodyScaleCard, {
  // --------------------------------------------------------------- styles

  _styles() {
    return `<style>
      :host { display: block; }
      ha-card { padding-bottom: 8px; overflow: hidden; }
      .card-header { margin: 0; padding: 16px 16px 4px; font-size: 1.4em; font-weight: 400; }
      .card-header.icon-header { --mdc-icon-size: 48px; color: var(--secondary-text-color); line-height: 0; }
      .who-icons { display: inline-flex; vertical-align: -4px; --mdc-icon-size: 20px; color: var(--secondary-text-color); }
      .tag.step { display: inline-flex; align-items: center; gap: 2px; --mdc-icon-size: 14px; }
      .device-wrap { padding: 16px 16px 4px; display: flex; justify-content: center; }
      /* Default skin: black scale, red LED display. skin: theme takes the dashboard theme's colours. */
      .device { --led: #ff3b30; --glow: color-mix(in srgb, var(--led) 45%, transparent); --body: linear-gradient(145deg, #2b2b2e, #111); --edge: #444;
        --screen: #050505; --key: #1b1b1d; --key-edge: #3a3a3c; --key-on: #2a0b09; --foot: #555;
        width: 100%; max-width: 420px; aspect-ratio: 1 / 1; border-radius: 26px; padding: 14px; box-sizing: border-box; display: flex; flex-direction: column; gap: 10px;
        background: var(--body); box-shadow: inset 0 0 0 1px var(--edge); }
      .device.theme { --led: var(--primary-color); --glow: transparent; --body: var(--secondary-background-color, #f0f0f0); --edge: var(--divider-color, #ddd);
        --screen: var(--card-background-color, #fff); --key: var(--card-background-color, #fff); --key-edge: var(--divider-color, #ddd);
        --key-on: color-mix(in srgb, var(--primary-color) 14%, var(--card-background-color, #fff)); --foot: var(--divider-color, #ccc); }
      .device.theme .display { box-shadow: inset 0 0 0 1px var(--edge); }
      .device.theme .d-weight { color: var(--primary-color); }
      /* Display with the mode keys as slim bars below it, centred like on a real scale. */
      .device { container-type: inline-size; --key-label: #8e8e93; }
      .device-top { display: flex; flex-direction: column; gap: 3px; width: min(296px, 86%); align-self: center; container-type: inline-size; }
      /* Sizes: 54 weight / 20 lines / 14 small (phone 44 / 16 / 13); symbols 20, status symbols 22. */
      .display { --fs-big: 54px; --fs: 20px; --fs-s: 14px; --ic: 20px; --zone: 60px; position: relative; border-radius: 10px; background: var(--screen); color: var(--led);
        text-shadow: 0 0 5px var(--glow); padding: 8px 10px 4px; box-sizing: border-box; display: flex; flex-direction: column; gap: 5px; min-width: 0;
        font-family: "DejaVu Sans Mono", Menlo, Consolas, monospace; }
      .display ha-icon { --mdc-icon-size: var(--ic); width: var(--ic); height: var(--ic); filter: drop-shadow(0 0 3px var(--glow)); display: inline-flex; }
      .d-hist { display: flex; justify-content: space-between; font-size: var(--fs-s); line-height: 1; }
      .d-hist span { opacity: 0.4; min-width: 1.5em; text-align: center; padding: 3px 0; cursor: pointer; }
      .d-hist span.none { opacity: 0.15; cursor: default; }
      .d-hist span.cur { opacity: 1; font-weight: 700; text-shadow: 0 0 6px var(--glow), 0 0 2px var(--glow); box-shadow: inset 0 0 0 1px var(--led); border-radius: 4px; }
      .d-hist.off { opacity: 0.4; }
      .d-wrow { display: flex; align-items: flex-end; gap: 2px; min-width: 0; }
      .d-weight { font-size: var(--fs-big); font-weight: 700; line-height: 0.9; white-space: nowrap; letter-spacing: -1px; }
      .d-weight .dp { display: inline-block; width: 0.22em; text-align: center; }
      .d-weight .dp i { display: inline-block; width: 0.13em; height: 0.13em; border-radius: 1px; background: currentColor; box-shadow: 0 0 5px var(--glow); }
      .d-weight.dim, .d-side.dim > * { opacity: 0.28; }
      .d-side { display: flex; flex-direction: column; justify-content: flex-end; gap: 5px; align-self: stretch; flex: 1; min-width: 0; margin-left: 0; white-space: pre; line-height: 1; }
      .d-l { display: flex; justify-content: space-between; align-items: center; gap: 8px; }
      .d-l2 { align-items: flex-end; }
      .d-s { font-size: var(--fs-s); display: flex; align-items: center; gap: 4px; }
      .d-s ha-icon { --mdc-icon-size: 20px; width: 20px; height: 20px; }
      .d-u { opacity: 0.7; margin-left: 4px; }
      .d-kgl { display: flex; align-items: baseline; gap: 5px; font-size: var(--fs); height: var(--fs); }
      .d-tr { font-size: var(--fs-s); opacity: 0.75; }
      .d-zn { width: var(--zone); height: var(--fs); position: relative; display: flex; justify-content: flex-end; align-items: center; flex: none; }
      .d-dt { font-size: var(--fs); white-space: pre; letter-spacing: 0; }
      .d-row { display: flex; align-items: center; justify-content: space-between; font-size: var(--fs); height: var(--ic); letter-spacing: 1px; white-space: nowrap; min-width: 0; }
      .d-vv { display: flex; align-items: center; gap: 16px; min-width: 0; }
      .d-val { display: inline-flex; align-items: center; gap: 5px; letter-spacing: 0; }
      /* BMI cell of fixed width, so the fat symbol stays put between "25.1" and "P80". */
      .d-vv .d-val:first-child { min-width: calc(var(--ic) + 5px + 2.4em); }
      .d-ar { font-size: var(--fs-s); margin-left: 2px; }
      .d-sum { letter-spacing: 0; }
      .d-cl { display: flex; align-items: center; margin-left: auto; }
      .d-sl { display: inline-flex; width: calc(var(--zone) / 3); height: 20px; align-items: center; justify-content: center; }
      .meth { width: 20px; height: 20px; color: var(--led); filter: drop-shadow(0 0 3px var(--glow)); }
      .d-bot { display: grid; grid-template-columns: repeat(var(--m, 3), minmax(0, 1fr)); gap: 10px; height: 24px; margin: auto 0 0; padding-top: 0; }
      .d-m { display: flex; justify-content: center; justify-self: center; align-items: center; height: 24px; width: 44px; margin: 0; padding: 0; border-radius: 8px; opacity: 0.25; }
      .device.fw-wide .d-m { justify-self: stretch; width: auto; margin: 0 6px; }
      .d-m.on { opacity: 1; }
      .d-m ha-icon { --mdc-icon-size: 22px; width: 22px; height: 22px; }
      @keyframes rs-soft { 0%, 100% { opacity: 1; } 50% { opacity: 0.35; } }
      .val.old .val-value { opacity: 0.6; }
      .val-old { font-size: 0.75em; color: var(--secondary-text-color); }
      .d-cands { display: flex; gap: 14px; }
      .d-steps { display: inline-flex; align-items: center; }
      .d-steps .hs { display: inline-flex; align-items: center; gap: 1px; opacity: 0.28; }
      .d-steps .hs.now { opacity: 1; }
      .d-steps .ar { opacity: 0.5; margin: 0 5px; font-size: var(--fs-s); }
      .d-steps .pl { margin: 0 1px; font-size: var(--fs-s); }
      @container (max-width: 280px) {
        .display { --fs-big: 44px; --fs: 16px; --fs-s: 13px; --ic: 18px; --zone: 54px; }
        .d-dt { font-size: var(--fs-s); }
        .d-m ha-icon { --mdc-icon-size: 20px; width: 20px; height: 20px; }
      }
      .device .key.cand { opacity: 1; box-shadow: inset 0 0 0 1px var(--led), 0 0 8px var(--glow); }
      /* Unclear reading: names and keys light up in turn; still for reduced motion. */
      @media (prefers-reduced-motion: reduce) { .cyc { animation: none !important; } }
      /* Last minute: the lit key blinks. */
      .device .key.expiring > * { animation: rs-soft 1.6s ease-in-out infinite; }
      /* Inverted (invert_modes / invert_history): a filled field with a dark symbol. */
      @keyframes rs-pulse { 0%, 100% { background-color: color-mix(in srgb, var(--led) calc(var(--inv, 65) * 1%), var(--screen)); } 50% { background-color: color-mix(in srgb, var(--led) calc(var(--inv, 65) * 0.4%), var(--screen)); } }
      .device.inv-modes .d-m.mode, .device.inv-modes .d-m.on { box-shadow: none; text-shadow: none; color: var(--screen); }
      .device.inv-modes .d-m.mode { background: color-mix(in srgb, var(--led) calc(var(--inv, 65) * 0.4%), var(--screen)); opacity: 1; }
      .device.inv-modes .d-m.on { background: color-mix(in srgb, var(--led) calc(var(--inv, 65) * 1%), var(--screen)); opacity: 1; }
      .device.inv-modes .d-m.on ha-icon, .device.inv-modes .d-m.mode ha-icon { filter: none; }
      .device.inv-modes .d-m[data-end] { box-shadow: none; }
      .device.inv-modes .d-m.expiring { animation: rs-pulse 2s ease-in-out infinite; }
      .device.inv-hist .d-hist span.cur { background: var(--led); color: var(--screen); box-shadow: none; text-shadow: none; opacity: 1; }
      .lg-m { display: inline-flex; align-items: center; padding: 2px 8px; border-radius: 8px; }
      .lg-m.set { background: color-mix(in srgb, var(--lg-fg) 28%, transparent); }
      .lg-m.on { background: var(--lg-fg); }
      .lg-m ha-icon { color: var(--lg-bg) !important; }
      .lg-h { display: inline-block; padding: 0 5px; border-radius: 4px; background: var(--lg-fg); color: var(--lg-bg); }
      @keyframes rs-frame { 0%, 100% { box-shadow: inset 0 0 0 1px var(--led); } 50% { box-shadow: inset 0 0 0 1px transparent; } }
      .d-m[data-end] { box-shadow: inset 0 0 0 1px var(--led); opacity: 1; }
      .d-m.expiring { animation: rs-frame 0.9s ease-in-out infinite; }
      .person-keys .key .ring { position: absolute; inset: 0; width: 100%; height: 100%; pointer-events: none; }
      .person-keys .key .ring path { fill: none; stroke: var(--led); stroke-width: 3; filter: drop-shadow(0 0 3px var(--glow)); }
      /* Dim = off, frame = the mode that is set, lit = active now. */
      .device .mode-keys .key.cand::after { box-shadow: inset 0 0 0 1px var(--led), 0 0 8px var(--glow); }
      .d-m.mode { opacity: 0.4; box-shadow: inset 0 0 0 1px color-mix(in srgb, var(--led) 60%, transparent); }
      .d-m.mode.on, .d-m.cand { opacity: 1; }
      .d-m.cand { box-shadow: inset 0 0 0 1px var(--led); }
      .ck-k { fill: none; stroke: currentColor; stroke-width: 1.4; }
      .ck-k.dim { opacity: 0.35; }
      .ck-k.lit { filter: drop-shadow(0 0 2px currentColor); stroke-width: 1.8; }
      .ck-k.part { stroke-dasharray: 55 100; }
      .ck-k.thick { stroke-width: 3; }
      .ck-k.thin { stroke-width: 1; }
      .ck-k.half { opacity: 0.5; }
      .flow { display: block; width: 100%; max-width: 420px; height: auto; margin: 6px auto; }
      .fl-box { fill: var(--card-background-color, #fff); stroke: var(--secondary-text-color, #727272); stroke-width: 1.4; }
      .fl-t { fill: var(--primary-text-color, #212121); font: 600 12px sans-serif; text-anchor: middle; }
      .fl-a { fill: none; stroke: var(--secondary-text-color, #727272); stroke-width: 1.4; }
      .fl-head { fill: var(--secondary-text-color, #727272); }
      .fl-l { fill: var(--secondary-text-color, #727272); font: 11px sans-serif; }
      .device .key { border: 0; border-radius: 10px; background: var(--key); box-shadow: inset 0 0 0 1px var(--key-edge); color: var(--led); opacity: 0.6; cursor: pointer;
        display: flex; align-items: center; justify-content: center; padding: 0 4px; font: inherit; min-width: 0; }
      .device .key.on { font-weight: 700; opacity: 1; box-shadow: inset 0 0 0 1px var(--led), 0 0 8px var(--glow); text-shadow: 0 0 4px var(--glow); }
      .device .key:focus-visible { outline: 2px solid var(--led); outline-offset: 2px; }
      .mode-keys { display: flex; gap: 10px; }
      .device .mode-keys .key { flex: 1; height: 24px; padding: 0; border-radius: 0; background: none; box-shadow: none; opacity: 1; text-shadow: none; }
      .mode-keys .key::after { content: ""; display: block; width: 100%; height: 10px; border-radius: 5px; background: var(--key); box-shadow: inset 0 0 0 1px var(--key-edge); }
      /* Holding a person key: it fills with light, then opens the person's view. */
      .person-keys .key { position: relative; overflow: hidden; touch-action: manipulation; user-select: none; -webkit-user-select: none; -webkit-touch-callout: none; }
      .person-keys .key > span { position: relative; }
      .person-keys .key::before { content: ""; position: absolute; inset: 0; background: var(--led); opacity: 0.35; transform: scaleX(0); transform-origin: left; transition: transform 0.15s; }
      .person-keys .key.holding::before { transform: scaleX(1); transition: transform 0.8s linear; }
      .person-keys .key.held::before { transform: scaleX(1); opacity: 0.6; }
      /* Square scale: the keys sit at the bottom edge above the feet, like a device. */
      .person-keys { flex: 1; display: grid; grid-template-columns: repeat(var(--cols, var(--n)), minmax(0, 1fr)); gap: 12px 7px; align-content: end; padding-bottom: 6px; }
      .person-keys.one { grid-template-columns: minmax(0, calc((100% - 14px) / 3)); justify-content: center; }
      .person-keys:empty { display: none; }
      .person-keys .key { height: 38px; font-size: 15px; white-space: nowrap; overflow: hidden; }
      .person-keys .short { display: none; }
      .person-keys.short .full { display: none; }
      .person-keys.short .short { display: inline; font-family: "DejaVu Sans Mono", Menlo, Consolas, monospace; font-weight: 700; font-size: 17px; }
      .feet { display: flex; justify-content: space-between; padding: 0 22%; }
      .feet span { width: 32px; height: 5px; border-radius: 3px; background: var(--foot); }
      .chip.icon-only { display: inline-flex; align-items: center; gap: 2px; padding-left: 12px; padding-right: 12px; --mdc-icon-size: 20px; }
      section { padding: 8px 16px; }
      h2 { margin: 8px 0; font-size: 1em; font-weight: 500; color: var(--secondary-text-color); }
      .count { display: inline-block; min-width: 1.4em; padding: 0 6px; border-radius: 10px; text-align: center;
               background: var(--warning-color, #ffa600); color: #fff; font-size: 0.85em; }
      .muted { color: var(--secondary-text-color); }
      .small { font-size: 0.85em; margin-right: 4px; }
      .msg { padding: 16px; }
      .pending { padding: 10px 12px; margin-bottom: 8px; border-radius: 12px;
                 background: var(--secondary-background-color); }
      .pending-head { display: flex; flex-wrap: wrap; gap: 8px; align-items: center; justify-content: space-between; }
      .strong { font-weight: 500; }
      .tag { font-size: 0.8em; padding: 2px 8px; border-radius: 10px; color: var(--secondary-text-color);
             border: 1px solid var(--divider-color); }
      .tag.ok { color: var(--success-color, #43a047); border-color: var(--success-color, #43a047); }
      .chips { display: flex; flex-wrap: wrap; gap: 6px; align-items: center; margin-top: 8px; }
      button { font: inherit; cursor: pointer; }
      .chip { border: 1px solid var(--primary-color); color: var(--primary-color); background: transparent;
              border-radius: 16px; padding: 4px 12px; min-height: 32px; }
      .chip.hint { background: var(--primary-color); color: var(--text-primary-color, #fff); }
      .chip.muted-chip { border-color: var(--divider-color); color: var(--secondary-text-color); }
      .pending.guest { border-left: 4px solid var(--primary-color); }
      .profile { display: flex; flex-wrap: wrap; align-items: center; gap: 4px 18px; margin: 4px 0 8px; font-size: 0.92em; color: var(--secondary-text-color); }
      .pf { display: inline-flex; align-items: center; gap: 4px; --mdc-icon-size: 16px; }
      .pf > ha-icon:first-child { color: var(--secondary-text-color); }
      .method { display: inline-flex; align-items: center; gap: 2px; color: var(--secondary-text-color); }
      .method .scale-mark { width: 26px; height: 22px; display: block; }
      .method .m-lift { width: 17px; height: 17px; }
      .profile .stale { color: var(--warning-color, #ffa600); }
      .inline-link { border: none; background: none; padding: 0; font: inherit; color: inherit; cursor: pointer; }
      .profile .pen { --mdc-icon-size: 14px; vertical-align: -2px; }
      .inline-link .pen { color: var(--primary-color); }
      .table-actions { margin: 8px 0 4px; }
      .inline-link.stale { color: var(--warning-color, #ffa600); }
      .inline-link:hover { color: var(--primary-color); }
      .dlg-input { display: flex; align-items: center; gap: 8px; margin: 4px 0 0; }
      .dlg-input input { flex: 1; min-width: 0; font: inherit; font-size: 1.2em; padding: 8px 10px; border-radius: 8px;
        border: 1px solid var(--divider-color, #ccc); background: var(--card-background-color, #fff); color: var(--primary-text-color); }
      .summary { display: flex; margin: 6px 0 12px; container-type: inline-size; }
      .kpi { display: flex; align-items: center; gap: 6px; white-space: nowrap; overflow: hidden; font-size: 1.1em; font-weight: 600; line-height: 1.2; padding: 2px 16px; }
      .kpi + .kpi { border-left: 1px solid var(--divider-color, #e0e0e0); }
      .kpi .small { font-size: 0.6em; font-weight: 400; }
      .kpi .strong { font-weight: inherit; }
      .kpi-label { display: flex; align-items: center; flex: none; height: 20px; --mdc-icon-size: 20px; }
      .kpi-label .cal { width: 26px; height: 19px; }
      /* Narrow phones: smaller values so all three stay on one line. */
      @container (max-width: 380px) { .kpi { font-size: 1em; padding: 2px 10px; gap: 4px; } }
      @container (max-width: 320px) { .kpi { font-size: 0.9em; padding: 2px 7px; } .kpi-label .cal { width: 22px; height: 16px; } }
      .kpi:first-child { padding-left: 0; }
      .seg .cal { width: 26px; height: 19px; display: block; }
      .card-header.with-glance { display: flex; align-items: center; gap: 12px; }
      .title-text { flex: none; }
      .glance { display: flex; gap: 4px; margin-left: auto; min-width: 0; overflow: hidden; justify-content: flex-end; }
      .glance-row { display: flex; margin: 6px 0 2px; }
      .glance-row .glance { margin-left: 0; justify-content: flex-start; }
      .glance .g { flex: none; height: 26px; min-width: 26px; border: 0; border-radius: 13px; padding: 0; display: inline-flex; align-items: center; justify-content: center;
        gap: 2px; --mdc-icon-size: 16px; font: inherit; font-size: 13px; font-weight: 600; cursor: pointer; }
      .glance .g-count { display: none; padding: 0 8px 0 5px; }
      .glance.compact .g.ok:not(.g-count) { display: none; }
      .glance.compact .g-count { display: inline-flex; }
      .g.low { color: var(--info-color, #039be5); background: rgba(3, 155, 229, 0.14); }
      .g.ok { color: var(--success-color, #43a047); background: rgba(67, 160, 71, 0.14); }
      .g.high { color: var(--warning-color, #ffa600); background: rgba(255, 166, 0, 0.16); }
      .g.veryHigh { color: var(--error-color, #db4437); background: rgba(219, 68, 55, 0.14); }
      .chart-box { margin: 4px 0 12px; }
      .chart-controls { display: flex; flex-wrap: wrap; align-items: center; gap: 6px 8px; margin: 0 0 6px; min-height: 34px; }
      .overview { display: flex; flex-direction: column; }
      .ov-row { display: flex; align-items: center; gap: 10px; width: 100%; padding: 10px 2px; border: none;
        border-top: 1px solid var(--divider-color); background: none; font: inherit; color: var(--primary-text-color); text-align: left; }
      button.ov-row { cursor: pointer; }
      button.ov-row:hover { background: var(--secondary-background-color); }
      .ov-row .who { color: var(--secondary-text-color); --mdc-icon-size: 22px; }
      .ov-name { flex: 1; min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
      .ov-name .pen { --mdc-icon-size: 14px; color: var(--secondary-text-color); vertical-align: -2px; }
      .ov-weight { font-weight: 500; font-variant-numeric: tabular-nums; }
      .ov-delta { width: 3.2em; text-align: right; font-size: 0.85em; color: var(--secondary-text-color); font-variant-numeric: tabular-nums; }
      .ov-row .chev { color: var(--secondary-text-color); --mdc-icon-size: 20px; }
      .chart-title { flex: 1; min-width: 0; display: flex; flex-direction: column; flex-wrap: nowrap; align-items: flex-start; gap: 0 14px; line-height: 1.25; max-height: ${HEAD_H}px; overflow: hidden; }
      .ct-sub { font-size: 0.75em; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
      .seg { display: inline-flex; flex: none; border: 1px solid var(--primary-color); border-radius: 18px; overflow: hidden; }
      .seg button { border: none; background: none; color: var(--primary-color); font: inherit; font-size: 0.9em;
        height: 32px; min-width: 42px; padding: 0 10px; display: inline-flex; align-items: center; justify-content: center;
        gap: 2px; cursor: pointer; --mdc-icon-size: 20px; }
      .seg button + button { border-left: 1px solid var(--primary-color); }
      .seg button.on { background: var(--primary-color); color: var(--text-primary-color, #fff); }
      .seg.toggles { border-color: var(--divider-color); }
      .seg.toggles button { color: var(--secondary-text-color); min-width: 38px; padding: 0 8px; }
      .seg.toggles button + button { border-left-color: var(--divider-color); }
      .seg.toggles button.on { color: var(--primary-color); background: rgba(var(--rgb-primary-color, 3, 169, 244), 0.12); }
      .seg button:disabled { opacity: 0.35; cursor: default; background: none; }
      .seg .badge { font-size: 9px; font-weight: 700; }
      .chart-hint { margin: 2px 4px 0; }
  .link-btn { background: none; border: 0; padding: 0 0 0 6px; font: inherit; color: var(--primary-color); text-decoration: underline; cursor: pointer; }
      .chart-keys dt { white-space: nowrap; }
      .chart-keys dt ha-icon { --mdc-icon-size: 18px; }
      .chart-keys .lg-head { margin-top: 6px; }
      button.icon.on { color: var(--primary-color); }
      .small-chip { min-height: 28px; padding: 2px 10px; font-size: 0.9em; }
      .spacer { flex: 1; }
      .chart { width: 100%; height: auto; display: block; }
      .chart-area { position: relative; }
      .chart-box { container-type: inline-size; }
      /* Narrow phones: slimmer buttons so view and period stay on one line. */
      @container (max-width: 360px) { .chart-controls .seg button { min-width: 0; padding: 0 7px; } }
      .chart-head { position: absolute; top: 0; left: 0; right: 0; height: ${HEAD_H}px; display: flex; align-items: center; gap: 8px; pointer-events: none; }
      .chart-head .chart-title { padding-left: 4px; }
      .chart-toggles { display: flex; gap: 6px; pointer-events: auto; }
      .chart-toggles button { border: 1px solid var(--divider-color, #e0e0e0); background: none; color: var(--secondary-text-color); border-radius: 8px; width: 28px; height: 28px; padding: 0; cursor: pointer;
        display: inline-flex; align-items: center; justify-content: center; position: relative; --mdc-icon-size: 16px; }
      .chart-toggles button.on { color: var(--primary-color); border-color: var(--primary-color); }
      .chart-toggles button:disabled { opacity: 0.35; cursor: default; }
      .chart-toggles .ref-key { width: auto; min-width: 34px; padding: 0 6px; font-size: 11px; font-weight: 700; letter-spacing: .3px; }
      .ref-compare { display: flex; flex-wrap: wrap; gap: 6px 14px; }
      .ref-rate b { margin-right: 4px; }
      .ref-rate.normal { color: var(--success-color, #43a047); }
      .ref-rate.overweight { color: var(--warning-color, #ffa600); }
      .ref-rate.obesity { color: var(--error-color, #db4437); }
      .ref-rate.thinness { color: var(--info-color, #039be5); }
      .chart-toggles .ref-key.picked { box-shadow: inset 0 -2px 0 var(--body-scale-card-second-color, #ff9800); }
      .chart-toggles .badge { position: absolute; bottom: -2px; right: -4px; font-size: 8px; font-weight: 700; }
      .chart .line { fill: none; stroke: var(--primary-color); stroke-width: 2; }
      .chart .line.right { stroke: var(--body-scale-card-second-color, #ff9800); }
      .chart .line.old { opacity: 0.4; }
      .chart .method-switch { stroke: var(--secondary-text-color); stroke-width: 1; stroke-dasharray: 3 3; opacity: 0.7; }
      .chart .method-tag rect { fill: var(--card-background-color, var(--ha-card-background, #fff)); stroke: var(--secondary-text-color); stroke-width: 1; }
      .chart .method-tag text { font-size: 10px; fill: var(--secondary-text-color); font-family: "DejaVu Sans Mono", Menlo, Consolas, monospace; }
      .chart .line, .chart .guide { vector-effect: non-scaling-stroke; }
      .chart .dot.right { fill: var(--body-scale-card-second-color, #ff9800); }
      .chart .last.right { stroke: var(--body-scale-card-second-color, #ff9800); }
      .chart .axis.right { fill: var(--body-scale-card-second-color, #ff9800); }
      .legend { display: inline-flex; align-items: center; gap: 6px; min-width: 0; white-space: nowrap; }
      .legend-label { font-size: 0.8em; color: var(--secondary-text-color); }
      .legend-value { font-weight: 500; font-variant-numeric: tabular-nums; }
      .legend-ref { display: inline-flex; align-items: center; gap: 1px; font-size: 0.7em; color: var(--secondary-text-color); letter-spacing: 0.3px; --mdc-icon-size: 12px; }
      .legend-ref ha-icon { width: 12px; height: 12px; }
      .stack-ffm { fill: var(--primary-color); opacity: 0.45; }
      .stack-fat { fill: var(--body-scale-card-second-color, #ff9800); opacity: 0.55; }
      .stack-ffm.est, .stack-fat.est { opacity: 0.18; }
      .chart .line.est { opacity: 0.4; stroke-dasharray: 3 4; }
      .comp-bars { margin: 8px 0 6px; display: grid; gap: 10px; }
      .comp-row { display: grid; gap: 3px; }
      .comp-cap { font-size: 0.8em; color: var(--secondary-text-color); }
      .comp-bar { display: flex; gap: 2px; height: 30px; border-radius: 8px; overflow: hidden; }
      .seg-c { position: relative; min-width: 0; display: flex; align-items: center; justify-content: center; gap: 4px; color: #fff; overflow: hidden; font-size: 0.85em; }
      .seg-c ha-icon { position: relative; flex: none; --mdc-icon-size: 18px; width: 18px; height: 18px; }
      .seg-c b { position: relative; font-weight: 600; font-variant-numeric: tabular-nums; white-space: nowrap; }
      .fat-parts { position: absolute; inset: 0; display: flex; }
      .fat-parts i { display: block; min-width: 0; }
      .c-fat { background: var(--body-scale-card-second-color, #ff9800); }
      .c-sub { background: color-mix(in srgb, var(--body-scale-card-second-color, #ff9800) 78%, #000); }
      .c-restfat { background: color-mix(in srgb, var(--body-scale-card-second-color, #ff9800) 60%, #fff); }
      .c-muscle { background: var(--primary-color, #03a9f4); }
      .c-bone { background: #9e9e9e; }
      .c-water { background: color-mix(in srgb, var(--primary-color, #03a9f4) 70%, #fff); }
      .c-protein { background: #43a047; }
      .c-rest { background: #bdbdbd; color: #333; }
      .comp-info { display: grid; grid-template-columns: 14px minmax(0, 1fr); gap: 4px 8px; margin: 6px 0; font-size: 0.9em; }
      .comp-info dt { display: flex; padding-top: 4px; }
      .comp-info .sw { width: 12px; height: 12px; border-radius: 3px; display: block; }
      .comp-info .sw.c-none { background: none; border: 1px solid var(--secondary-text-color); }
      .comp-info dd { margin: 0; line-height: 1.35; overflow-wrap: anywhere; }
      .swatch { width: 14px; height: 3px; border-radius: 2px; background: var(--primary-color); flex: none; }
      .legend.right .swatch { background: var(--body-scale-card-second-color, #ff9800); }
      .swatch.ghost { visibility: hidden; }
      .toggle-chip { display: inline-flex; align-items: center; gap: 4px; --mdc-icon-size: 16px; }
      .chart .dotted { stroke-dasharray: 2 3; opacity: 0.8; }
      .chart .zone-low { fill: var(--info-color, #039be5); opacity: 0.08; }
      .chart .zone-ok { fill: var(--success-color, #43a047); opacity: 0.10; }
      .chart .zone-high { fill: var(--warning-color, #ffa600); opacity: 0.10; }
      .chart .zone-veryhigh { fill: var(--error-color, #db4437); opacity: 0.10; }
      .chart .band-line { fill: none; stroke: var(--body-scale-card-second-color, #ff9800); stroke-width: 1.2; stroke-dasharray: 1.5 4; stroke-linecap: round; opacity: 0.7; vector-effect: non-scaling-stroke; }
      .chart .guide { stroke: var(--body-scale-card-second-color, #ff9800); stroke-width: 1.2; stroke-dasharray: 1.5 4; stroke-linecap: round; opacity: 0.6; }
      .chart .guide.mid { opacity: 0.85; }
      .chart .band-median { fill: none; stroke: var(--body-scale-card-second-color, #ff9800); stroke-width: 1.5; stroke-dasharray: 1.5 4; stroke-linecap: round; opacity: 0.9; vector-effect: non-scaling-stroke; }
      .chart .band-label { fill: var(--body-scale-card-second-color, #ff9800); }
      .icon-chip { padding: 2px 6px; --mdc-icon-size: 18px; line-height: 0; }
      .tab ha-icon { --mdc-icon-size: 18px; margin-right: 4px; vertical-align: -3px; }
      .chart .area { fill: var(--primary-color); opacity: 0.08; }
      .chart .grid { stroke: var(--divider-color); stroke-width: 1; }
      .chart .axis { fill: var(--secondary-text-color); font-size: 11px; }
      .chart .dot { fill: var(--primary-color); }
      .chart .last { fill: var(--card-background-color, #fff); stroke: var(--primary-color); stroke-width: 2; }
      .chart-empty { padding: 24px 0; text-align: center; }
      .tabs { display: flex; gap: 4px; overflow-x: auto; border-bottom: 1px solid var(--divider-color); margin-bottom: 8px; }
      .tab { border: none; background: none; padding: 8px 12px; color: var(--secondary-text-color);
             border-bottom: 2px solid transparent; white-space: nowrap; }
      .tab.active { color: var(--primary-color); border-bottom-color: var(--primary-color); font-weight: 500; }
      .table-wrap { overflow-x: auto; }
      table { width: 100%; border-collapse: collapse; font-size: 0.95em; }
      th { text-align: left; font-weight: 500; color: var(--secondary-text-color); padding: 6px 4px;
           border-bottom: 1px solid var(--divider-color); white-space: nowrap; }
      td { padding: 6px 4px; border-bottom: 1px solid var(--divider-color); white-space: nowrap; }
      tr:last-child td { border-bottom: none; }
      .num { text-align: right; font-variant-numeric: tabular-nums; }
      .unit { font-weight: 400; font-size: 0.85em; }
      .when { color: var(--primary-text-color); }
      .delta { font-size: 0.8em; color: var(--secondary-text-color); }
      .htable th { --mdc-icon-size: 18px; }
      .htable th.num { text-align: right; }
      .htable .add-h { color: var(--primary-color); box-shadow: inset 0 0 0 1px var(--primary-color); }
      .htable tr.draft td { background: color-mix(in srgb, var(--primary-color) 10%, transparent); }
      .htable .stepper { display: inline-flex; align-items: center; gap: 4px; }
      .htable .hval { display: inline-flex; align-items: baseline; gap: 4px; font-weight: 600; }
      .htable .hval input { width: 4.2em; text-align: right; font: inherit; color: inherit; background: transparent; border: 0; border-bottom: 1px solid var(--primary-color); padding: 2px 0; outline: none; -moz-appearance: textfield; }
      .htable .hval input:focus { border-bottom-width: 2px; }
      .htable .hval input::-webkit-inner-spin-button, .htable .hval input::-webkit-outer-spin-button { -webkit-appearance: none; margin: 0; }
      .htable .icon.ok { color: var(--primary-color); }
      .htable .error { color: var(--error-color, #db4437); font-size: 12px; text-align: right; white-space: normal; }
      .actions { text-align: right; width: 1%; }
      .icon { border: none; background: none; padding: 4px; border-radius: 50%; color: var(--secondary-text-color);
              --mdc-icon-size: 20px; line-height: 0; }
      .icon:hover { background: var(--secondary-background-color); color: var(--primary-color); }
      .icon.danger:hover { color: var(--error-color, #db4437); }
      .link { border: none; background: none; color: var(--primary-color); padding: 8px 0; }
      @media (max-width: 480px) { .wide { display: none; } }
      .backdrop { position: fixed; inset: 0; z-index: 10; background: rgba(0,0,0,0.45);
                  display: flex; align-items: center; justify-content: center; padding: 16px; }
      .dialog { background: var(--card-background-color, #fff); color: var(--primary-text-color);
                border-radius: 16px; padding: 20px; max-width: 420px; width: 100%;
                box-shadow: 0 8px 32px rgba(0,0,0,0.3); }
      .dialog p { margin: 0 0 12px; line-height: 1.4; }
      .error { color: var(--error-color, #db4437); }
      .buttons { display: flex; justify-content: flex-end; gap: 8px; margin-top: 16px; }
      .btn { border: none; background: none; color: var(--primary-color); padding: 8px 14px; border-radius: 18px; font-weight: 500; }
      .btn.primary { background: var(--primary-color); color: var(--text-primary-color, #fff); }
      .btn.primary.danger { background: var(--error-color, #db4437); }
      .btn[disabled] { opacity: 0.5; cursor: default; }
      .info { margin-top: 12px; border-top: 1px solid var(--divider-color); }
      .info-toggle { display: flex; align-items: center; gap: 8px; width: 100%; border: none; background: none;
                     padding: 12px 0; color: var(--primary-text-color); font-weight: 500; text-align: left; }
      .info-toggle.sub { padding-left: 4px; padding-right: 4px; font-size: 0.95em; }
      .info-toggle ha-icon { color: var(--secondary-text-color); --mdc-icon-size: 20px; }
      .info-body { display: flex; flex-direction: column; gap: 12px; padding-bottom: 8px; }
      .explain { padding: 12px 14px; border-radius: 12px; background: var(--secondary-background-color); }
      .explain h3, .tile h3 { margin: 0 0 6px; font-size: 1em; font-weight: 500; }
      .explain p { margin: 6px 0; line-height: 1.45; font-size: 0.95em; }
      .algos { font-size: 0.95em; }
      .algos { display: grid; grid-template-columns: max-content 1fr; gap: 6px 12px; margin: 8px 0; }
      .algos dt { font-weight: 500; }
      .algos dd { margin: 0; line-height: 1.4; }
      @media (max-width: 480px) { .algos { grid-template-columns: 1fr; } .algos dd { margin-bottom: 6px; } }
      :host { --lg-fg: #ff3b30; --lg-bg: #050505; --lg-glow: rgba(255, 59, 48, 0.45); }
      :host(.skin-theme) { --lg-fg: var(--primary-color); --lg-bg: var(--secondary-background-color, #f0f0f0); --lg-glow: transparent; }
      .legend-list { display: grid; grid-template-columns: max-content minmax(0, 1fr); gap: 6px 14px; align-items: center; margin: 4px 0 8px; --mdc-icon-size: 20px; }
      .legend-list dt { display: flex; gap: 4px; align-items: center; justify-content: center; color: var(--lg-fg); background: var(--lg-bg); text-shadow: 0 0 5px var(--lg-glow); padding: 3px 8px; border-radius: 6px; white-space: nowrap; min-height: 26px; box-sizing: border-box; }
      .legend-list dd { margin: 0; font-size: 0.92em; white-space: normal; overflow-wrap: anywhere; }
      .legend-list ha-icon { color: var(--lg-fg); }
      .legend-sub { margin: 12px 0 4px; font-size: 0.95em; font-weight: 500; }
      .legend-list.chart-keys dt { background: none; text-shadow: none; color: var(--primary-text-color); }
      .legend-list.chart-keys ha-icon { color: var(--primary-text-color); }
      .chart-legend { margin-top: 12px; }
      .ck { width: 30px; height: 12px; }
      .ck-line { fill: none; stroke: var(--primary-color); stroke-width: 2; stroke-linecap: round; }
      .ck-est { opacity: 0.45; stroke-dasharray: 3 4; }
      .ck-old { opacity: 0.35; }
      .ck-pct { fill: none; stroke: var(--body-scale-card-second-color, #ff9800); stroke-width: 2; stroke-dasharray: 1.5 4; stroke-linecap: round; }
      .ck-tag { font: 700 10px "DejaVu Sans Mono", Menlo, Consolas, monospace; padding: 2px 6px; border-radius: 4px; border: 1px solid var(--secondary-text-color); color: var(--secondary-text-color); }
      .legend-list.how dt { background: none; text-shadow: none; color: var(--primary-text-color); }
      .legend-list.how ha-icon { color: var(--secondary-text-color); }
      .legend-list .meth { width: 20px; height: 20px; color: var(--lg-fg); }
      table.algo { width: auto; min-width: 260px; margin: 4px 0; }
      .val-detail table.algo { min-width: 0; width: 100%; }
      table.algo th, table.algo td { border-bottom: 1px solid var(--divider-color); }
      table.algo tr:last-child th, table.algo tr:last-child td { border-bottom: none; }
      table.algo td.on { font-weight: 600; box-shadow: inset 0 0 0 1.5px var(--primary-color, #03a9f4); border-radius: 8px; }
      .algo-note { margin: 2px 0 0; }
      table.algo td.st-low { color: var(--info-color, #039be5); }
      table.algo td.st-ok { color: var(--success-color, #43a047); }
      table.algo td.st-high { color: var(--warning-color, #ffa600); }
      table.algo td.st-veryHigh { color: var(--error-color, #db4437); }
      table.algo td.on:not([class*="st-"]) { color: var(--primary-color); }
      .pill { margin-left: 6px; padding: 1px 6px; border-radius: 8px; font-size: 0.75em;
              background: var(--primary-color); color: var(--text-primary-color, #fff); }
      .vals { display: grid; grid-template-columns: repeat(auto-fill, minmax(150px, 1fr)); gap: 8px; margin: 8px 0 12px; }
      .val { display: flex; align-items: center; gap: 10px; padding: 8px 10px; border-radius: 12px; text-align: left;
        border: 1px solid var(--divider-color); background: none; font: inherit; color: inherit; cursor: pointer; min-width: 0; }
      .val.open { border-color: var(--primary-color); }
      .val-icon { flex: none; width: 36px; height: 36px; border-radius: 50%; display: flex; align-items: center; justify-content: center;
        --mdc-icon-size: 20px; color: var(--secondary-text-color); background: var(--secondary-background-color, rgba(127,127,127,.1)); }
      .val.low .val-icon { color: var(--info-color, #039be5); background: rgba(3, 155, 229, 0.12); }
      .val.ok .val-icon { color: var(--success-color, #43a047); background: rgba(67, 160, 71, 0.12); }
      .val.high .val-icon { color: var(--warning-color, #ffa600); background: rgba(255, 166, 0, 0.14); }
      .val.veryHigh .val-icon { color: var(--error-color, #db4437); background: rgba(219, 68, 55, 0.12); }
      .val-text { display: flex; flex-direction: column; min-width: 0; line-height: 1.25; }
      .val-name { font-size: 0.75em; color: var(--secondary-text-color); hyphens: auto; overflow-wrap: break-word; }
      .val-value { font-weight: 500; font-variant-numeric: tabular-nums; }
      .val-status { font-size: 0.75em; display: flex; flex-wrap: wrap; gap: 0 8px; }
      .val-delta { font-weight: 400; color: var(--secondary-text-color); white-space: nowrap;
        --mdc-icon-size: 14px; }
      .val-delta ha-icon { vertical-align: -2px; }
      .val.low .val-rating { color: var(--info-color, #039be5); }
      .val.ok .val-rating { color: var(--success-color, #43a047); }
      .val.high .val-rating { color: var(--warning-color, #ffa600); }
      .val.veryHigh .val-rating { color: var(--error-color, #db4437); }
      .vals { position: relative; }
      .val-detail { position: absolute; left: 0; right: 0; z-index: 3; padding: 4px 12px 10px; border-radius: 12px; border: 1px solid var(--primary-color);
        background: var(--card-background-color, var(--ha-card-background, #fff)); box-shadow: 0 6px 24px rgba(0,0,0,.35); }
      .val-detail::before { content: ""; position: absolute; inset: 0; border-radius: inherit; background: var(--secondary-background-color, rgba(127,127,127,.06)); opacity: .5; pointer-events: none; }
      .val-detail > * { position: relative; }
      .pop-arrow { position: absolute !important; left: var(--arrow, 50%); bottom: -7px; width: 12px; height: 12px; margin-left: -6px; transform: rotate(45deg);
        background: var(--card-background-color, var(--ha-card-background, #fff)); border: solid var(--primary-color); border-width: 0 1px 1px 0; }
      .val-detail.below .pop-arrow { bottom: auto; top: -7px; border-width: 1px 0 0 1px; }
      .val-detail .kg-line { margin: 6px 0 0; font-size: 1.05em; }
      .val-detail .methods-pop { margin-top: 6px; }
      .val-detail p { margin: 6px 0 0; line-height: 1.4; font-size: 0.9em; }
      .tiles { display: grid; grid-template-columns: repeat(auto-fill, minmax(240px, 1fr)); gap: 10px; }
      .tile { padding: 12px 14px; border-radius: 12px; border: 1px solid var(--divider-color); }
      .tile p { margin: 6px 0 0; line-height: 1.4; font-size: 0.9em; }
      .tile-head { display: flex; justify-content: space-between; align-items: baseline; gap: 8px; }
      .tile-value { font-size: 1.15em; font-variant-numeric: tabular-nums; }
      .bar { margin: 10px 0 2px; }
      .bands { position: relative; display: flex; height: 18px; border-radius: 9px; overflow: visible; font-size: 0.7em; }
      .band { display: flex; align-items: center; justify-content: center; overflow: hidden; white-space: nowrap;
              color: #fff; opacity: 0.85; }
      .band:first-child { border-radius: 9px 0 0 9px; }
      .band:last-of-type { border-radius: 0 9px 9px 0; }
      .band.low { background: var(--info-color, #039be5); }
      .band.ok { background: var(--success-color, #43a047); }
      .band.high { background: var(--warning-color, #ffa600); }
      .band.veryHigh { background: var(--error-color, #db4437); }
      .marker { position: absolute; top: -4px; bottom: -4px; width: 4px; margin-left: -2px; border-radius: 2px;
                background: var(--primary-text-color); box-shadow: 0 0 0 2px var(--card-background-color, #fff); }
      .ticks { position: relative; height: 14px; font-size: 0.7em; color: var(--secondary-text-color); }
      .tick { position: absolute; transform: translateX(-50%); top: 2px; }
      .note { display: flex; gap: 10px; align-items: flex-start; padding: 10px 12px; border-radius: 12px;
              background: var(--secondary-background-color); line-height: 1.4; }
      .note ha-icon { color: var(--secondary-text-color); --mdc-icon-size: 20px; flex: none; }
      .note.warn { border-left: 4px solid var(--warning-color, #ffa600); }
      .disclaimer { margin: 0; }
    </style>`;
  },
});
