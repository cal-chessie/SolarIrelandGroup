import type { CountyData } from './types';

/**
 * Roscommon. PVGIS (EU Joint Research Centre) PVcalc v5.3, fetched 13 Nov 2026:
 * 1 kWp, crystalline silicon, 14% loss, 35 degree tilt, due south, SARAH3
 * 2005 to 2023, horizon on. Re-fetch with `api` before changing a number.
 */
export const ROSCOMMON: CountyData = {
  slug: 'roscommon',
  name: 'Roscommon',
  province: 'Connacht',
  indexable: false,
  updated: '2026-11-13',
  wikipedia: 'https://en.wikipedia.org/wiki/County_Roscommon',
  pvgis: {
    place: 'Roscommon Town',
    lat: 53.6325,
    lon: -8.1897,
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
  townsIntro: 'We install across the whole county, from Boyle in the north to Monksland on the edge of Athlone.',
  housingNote:
    'Roscommon has many bungalows and farmhouses with wide, unshaded roofs, and a lot of homes where someone is in during the day. Those homes use more of their own power, and power used at home is worth about twice what export earns.',
  farmNote:
    'A dairy or a drying shed runs in daylight, so a farm uses most of what its panels make. Farms can choose between TAMS, run by the Department of Agriculture, and the SEAI business grant. TAMS pays a higher rate but ranks and selects applications; the SEAI grant does not.',
};
