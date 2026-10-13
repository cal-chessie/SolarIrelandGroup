/**
 * Eircode routing keys: the first three characters name a postal area.
 *
 * Used when the address lookup is down (ux-spec 8: "the area from the routing
 * key filled in: Dublin 6"). Area only, never a street. Deliberately a short,
 * confident list rather than all 139 keys: an unknown key simply leaves the
 * address and county for the homeowner to fill, which is better than a wrong
 * town. Extend it from the official Eircode routing key list, never by guess.
 */
const DUBLIN: Record<string, string> = {
  D01: 'Dublin 1', D02: 'Dublin 2', D03: 'Dublin 3', D04: 'Dublin 4', D05: 'Dublin 5',
  D06: 'Dublin 6', D6W: 'Dublin 6W', D07: 'Dublin 7', D08: 'Dublin 8', D09: 'Dublin 9',
  D10: 'Dublin 10', D11: 'Dublin 11', D12: 'Dublin 12', D13: 'Dublin 13', D14: 'Dublin 14',
  D15: 'Dublin 15', D16: 'Dublin 16', D17: 'Dublin 17', D18: 'Dublin 18', D20: 'Dublin 20',
  D22: 'Dublin 22', D24: 'Dublin 24',
};

const TOWNS: Record<string, { area: string; county: string }> = {
  A91: { area: 'Dundalk', county: 'Louth' },
  A92: { area: 'Drogheda', county: 'Louth' },
  A94: { area: 'Blackrock', county: 'Dublin' },
  A98: { area: 'Bray', county: 'Wicklow' },
  C15: { area: 'Navan', county: 'Meath' },
  E41: { area: 'Thurles', county: 'Tipperary' },
  E45: { area: 'Nenagh', county: 'Tipperary' },
  F23: { area: 'Castlebar', county: 'Mayo' },
  F42: { area: 'Roscommon', county: 'Roscommon' },
  F91: { area: 'Sligo', county: 'Sligo' },
  F92: { area: 'Letterkenny', county: 'Donegal' },
  H12: { area: 'Cavan', county: 'Cavan' },
  H18: { area: 'Monaghan', county: 'Monaghan' },
  H91: { area: 'Galway', county: 'Galway' },
  K67: { area: 'Swords', county: 'Dublin' },
  N37: { area: 'Athlone', county: 'Westmeath' },
  N91: { area: 'Mullingar', county: 'Westmeath' },
  R32: { area: 'Portlaoise', county: 'Laois' },
  R35: { area: 'Tullamore', county: 'Offaly' },
  R93: { area: 'Carlow', county: 'Carlow' },
  R95: { area: 'Kilkenny', county: 'Kilkenny' },
  T12: { area: 'Cork', county: 'Cork' },
  T23: { area: 'Cork', county: 'Cork' },
  V92: { area: 'Tralee', county: 'Kerry' },
  V93: { area: 'Killarney', county: 'Kerry' },
  V94: { area: 'Limerick', county: 'Limerick' },
  V95: { area: 'Ennis', county: 'Clare' },
  X91: { area: 'Waterford', county: 'Waterford' },
  Y35: { area: 'Wexford', county: 'Wexford' },
};

export function routingArea(eircode: string): { area: string; county: string } | null {
  const key = eircode.toUpperCase().replace(/\s+/g, '').slice(0, 3);
  if (DUBLIN[key]) return { area: DUBLIN[key], county: 'Dublin' };
  return TOWNS[key] ?? null;
}
