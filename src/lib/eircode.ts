/**
 * Eircode format validation (no external lookup).
 *
 * Routing key: letter + two digits (D6W is the one exception), then a
 * four-character unique identifier from the official Eircode alphabet
 * (0-9 and ACDEFHKNPRTVWXY - no B/G/I/J/L/M/O/Q/S/U/Z).
 *
 * House-level resolution ("which home is this") needs the ECAD or an
 * Autoaddress/Google Geocoding key - a paid, needs-Cal decision. Until
 * then we validate the format hard (catches typos before the survey) and
 * pass the code through to AISolar untouched.
 */
export function normaliseEircode(v: string): string {
  return v.toUpperCase().replace(/\s+/g, '');
}

export function isValidEircode(v: string): boolean {
  const s = normaliseEircode(v);
  return /^(D6W|[AC-FHKNPRTV-Y]\d{2})[0-9AC-FHKNPRTV-Y]{4}$/.test(s);
}

/** Pretty print: "d02x285" -> "D02 X285" */
export function formatEircode(v: string): string {
  const s = normaliseEircode(v);
  return s.length === 7 ? `${s.slice(0, 3)} ${s.slice(3)}` : v.toUpperCase();
}
