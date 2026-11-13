import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import postcss, { type ChildNode } from 'postcss';
import { describe, expect, it } from 'vitest';

// analyser-door.css is generated from intake.css (scripts/gen-analyser-door-css.mjs).
// The Bill Analyser's door renders from it until the full intake.css loads on
// first reach. That is only invisible if every door rule is a verbatim copy
// of an intake.css rule, in the same order and inside the same at-rules: then
// intake.css, loading later, overrides each copy in place. This guards it.
const read = (f: string) => readFileSync(join(process.cwd(), 'src/components/intake', f), 'utf8');

/** Every rule and keyframes block, flattened with its at-rule context, in source order. */
function flatten(css: string): string[] {
  const out: string[] = [];
  const norm = (s: string) => s.replace(/\s+/g, ' ').trim();
  const walk = (nodes: ChildNode[], ctx: string) => {
    for (const n of nodes) {
      if (n.type === 'rule') {
        out.push(`${ctx}${norm(n.selector)}{${n.nodes.filter((d) => d.type === 'decl').map((d) => norm(d.toString())).join(';')}}`);
      } else if (n.type === 'atrule') {
        if (/keyframes$/i.test(n.name)) out.push(`${ctx}${norm(n.toString().replace(/\/\*[\s\S]*?\*\//g, ''))}`);
        else if (n.nodes) walk(n.nodes, `${ctx}@${n.name} ${norm(n.params)} > `);
      }
    }
  };
  walk(postcss.parse(css).nodes, '');
  return out;
}

describe('analyser-door.css', () => {
  const full = flatten(read('intake.css'));
  const door = flatten(read('analyser-door.css'));

  it('is a non-trivial subset of intake.css', () => {
    expect(door.length).toBeGreaterThan(50);
    expect(door.length).toBeLessThan(full.length);
  });

  it('copies intake.css rules verbatim and in order (regenerate it if this fails)', () => {
    let i = 0;
    const missing: string[] = [];
    for (const rule of door) {
      while (i < full.length && full[i] !== rule) i += 1;
      if (i === full.length) {
        missing.push(rule.slice(0, 160));
        break;
      }
      i += 1;
    }
    expect(missing).toEqual([]);
  });

  it('carries the door itself and the bottom-layer rules', () => {
    const css = read('analyser-door.css');
    for (const s of ['.si-an-door', '.si-an-road--primary', '.si-an-seg__thumb', '.si-an-priv__line', 'body[data-analyser-in-view]']) {
      expect(css).toContain(s);
    }
  });
});
