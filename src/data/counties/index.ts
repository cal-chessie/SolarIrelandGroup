import type { CountyData } from './types';
import { ROSCOMMON } from './roscommon';

/** Every county with a service page. Add a data file, add it here. */
export const COUNTIES: readonly CountyData[] = [ROSCOMMON];

export function getCounty(slug: string): CountyData | undefined {
  return COUNTIES.find((c) => c.slug === slug);
}

export type { CountyData };
