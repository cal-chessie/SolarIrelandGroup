/**
 * The full intake stylesheet as a module, so a component can load it on
 * demand: `import('@/components/intake/intakeStyles')`. The chunk resolves
 * once the stylesheet has loaded.
 *
 * Used by the exit quiz (ExitIntent) on pages without the Bill Analyser.
 * BillAnalyser no longer loads it late: on its pages intake.css is route CSS
 * from the first paint (14 Nov 2026, see BillAnalyser.tsx).
 */
import './intake.css';

export {};
