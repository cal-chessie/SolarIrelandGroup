/**
 * The full intake stylesheet as a module, so a component can load it on
 * demand: `import('@/components/intake/intakeStyles')`. The chunk resolves
 * once the stylesheet has loaded.
 *
 * BillAnalyser rests on analyser-door.css (generated from intake.css by
 * scripts/gen-analyser-door-css.mjs) and loads this the moment the visitor
 * reaches for the analyser, so the home page's first load no longer carries
 * the whole intake app's CSS.
 */
import './intake.css';

export {};
