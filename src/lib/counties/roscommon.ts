/**
 * County authority page data: Roscommon. The template for Dublin and Galway.
 *
 * Yield is PVGIS (EU Joint Research Centre), PVcalc v5.3, fetched 13 Nov 2026:
 * 1 kWp, crystalline silicon, 14% system loss, 35 degree tilt, due south,
 * PVGIS-SARAH3 radiation 2005 to 2023, horizon on. Point: Roscommon Town
 * (53.6325, -8.1897). The Dublin reference uses the same settings at
 * (53.3498, -6.2603). Re-fetch with the URL below before changing a number.
 */
export const COUNTY_INDEXABLE = false; // flip to true at go-live, and the sitemap picks it up

export const ROSCOMMON = {
  slug: 'roscommon',
  name: 'Roscommon',
  province: 'Connacht',
  countyTown: 'Roscommon Town',
  pvgis: {
    source: 'https://re.jrc.ec.europa.eu/pvg_tools/en/',
    api: 'https://re.jrc.ec.europa.eu/api/v5_3/PVcalc?lat=53.6325&lon=-8.1897&peakpower=1&loss=14&angle=35&aspect=0&outputformat=json',
    fetched: '13 Nov 2026',
    kwhPerKwp: 929,
    monthlyKwhPerKwp: [32.45, 48.87, 80.12, 108.1, 122.04, 113.9, 109.48, 103.49, 81.52, 61.36, 40.7, 26.58],
    dublinKwhPerKwp: 982,
  },
  towns: [
    'Roscommon Town', 'Boyle', 'Castlerea', 'Ballaghaderreen', 'Strokestown', 'Elphin',
    'Monksland', 'Roosky', 'Frenchpark', 'Ballinlough', 'Knockcroghery', 'Athleague',
  ],
} as const;
