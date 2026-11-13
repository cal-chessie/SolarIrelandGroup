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
  // Official, dated facts only, each from the 13 Nov 2026 research
  // (docs/research/county-page-research-2026-11.md, section 3.2), our own words.
  // The old housingNote (unsourced, and a money claim typed into a data file)
  // and farmNote (true in every county) are gone; the farm text is national
  // and lives in the template.
  localFacts: [
    {
      text: 'In Census 2022, new-build homes in Roscommon were among the least likely in Ireland to use solar energy: 9%, against 11% in Leitrim and 13% in Kerry.',
      source: 'CSO, Census of Population 2022 Profile 2, Housing in Ireland: occupied dwellings',
      sourceUrl: 'https://www.cso.ie/en/releasesandpublications/ep/p-cpp2/censusofpopulation2022profile2-housinginireland/occupieddwellings/',
      date: '2022-04',
    },
    {
      text: 'Roscommon County Council adopted its Climate Action Plan 2024 to 2029 in January 2024, with a Decarbonising Zone in Roscommon Town.',
      source: 'Roscommon County Council, Climate Action Plan 2024 to 2029 and Decarbonising Zone',
      sourceUrl: 'https://www.roscommoncoco.ie/en/services/climate-action/roscommon-climate-action-plan/decarbonisation-zone-roscommon-town.html',
      date: '2024-01',
    },
    {
      text: 'Castlerea Town Team, a Sustainable Energy Community, published an Energy Master Plan for Castlerea in October 2022 with the support of Roscommon County Council.',
      source: 'SEAI Sustainable Energy Communities, Castlerea Energy Master Plan',
      sourceUrl: 'https://www.seai.ie/community-energy/sustainable-energy-communities/sec-map/uploads/reg_14_0_EMP157%20-%20Castlerea%20EMP%20Report%20V3.pdf',
      date: '2022-10',
    },
  ],
  // None yet. Only real installs, photos, sponsorships or press with written permission.
  proofItems: [],
  // None yet. The eight old FAQs were national text with the name dropped in;
  // they now live once in src/data/national-faqs.ts. Add Roscommon questions
  // only from Search Console, People Also Ask or the county development plan.
  localFaqs: [],
};
