/**
 * STUB: what AISolar's lead-context answers for a magic link (?lt=), so the
 * /book-survey call ask can be built and shot without a live lead. Runs only
 * when intakeMode() is 'stub' (never on production). Fixture people, no real
 * data: a home with full details, a business with full details, and a link
 * with no mobile on file (the form opens instead of the one-tap card).
 */
export interface LinkContext {
  name: string | null;
  email: string | null;
  phone: string | null;
  eircode: string | null;
  address: string | null;
  county: string | null;
  monthlyBill: number | null;
  segment: 'domestic' | 'commercial' | null;
}

const FIXTURES: Record<string, LinkContext> = {
  ['a'.repeat(64)]: { name: 'Mary Kelly', email: 'mary.kelly@example.ie', phone: '087 123 4567', eircode: null, address: null, county: 'Galway', monthlyBill: 160, segment: 'domestic' },
  ['b'.repeat(64)]: { name: 'Sean Murphy', email: 'sean@murphyhardware.example.ie', phone: '+353 86 765 4321', eircode: null, address: null, county: 'Cork', monthlyBill: 900, segment: 'commercial' },
  ['c'.repeat(64)]: { name: 'Aoife Byrne', email: 'aoife.byrne@example.ie', phone: null, eircode: null, address: null, county: null, monthlyBill: null, segment: 'domestic' },
};

export function stubLinkContext(lt: string): LinkContext | null {
  return FIXTURES[lt] ?? null;
}
