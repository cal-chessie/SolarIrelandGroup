import type { CountyData } from './types';
import { ROSCOMMON } from './roscommon';
import { assertCountyGate } from './gate';

/** Every county with a service page. Add a data file, add it here. */
export const COUNTIES: readonly CountyData[] = [ROSCOMMON];

// The county gate runs on every build: an indexable county that fails it
// throws here and stops `bun run build`. See docs/county-page-playbook.md.
assertCountyGate(COUNTIES);

export function getCounty(slug: string): CountyData | undefined {
  return COUNTIES.find((c) => c.slug === slug);
}

export type { CountyData };
