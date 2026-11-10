/**
 * Bill uploads (M9, 9 Nov review).
 *
 * Vercel refuses a request body over 4.5 MB with its own 413 before the
 * route runs, so the site's 5 MB check never fired and the homeowner saw a
 * generic failure. The cap is 4.4 MB, checked in the browser first, then on
 * the server. Pure: shared by the page and the routes.
 */
export const MAX_UPLOAD_BYTES = Math.floor(4.4 * 1024 * 1024);

/** What the homeowner reads when the file is too big. */
export const TOO_BIG_LINE = 'Send a photo of the bill, or a smaller PDF (under 4 MB).';

export type SniffedType = 'application/pdf' | 'image/jpeg' | 'image/png' | 'image/heic';

const HEIC_BRANDS = new Set(['heic', 'heix', 'hevc', 'hevx', 'heim', 'heis', 'mif1', 'msf1']);

/** The type the first bytes say, for a file the browser sent with no type. Null when it is none of ours. */
export function sniffType(b: Uint8Array): SniffedType | null {
  if (b.length >= 4 && b[0] === 0x25 && b[1] === 0x50 && b[2] === 0x44 && b[3] === 0x46) return 'application/pdf'; // %PDF
  if (b.length >= 3 && b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff) return 'image/jpeg';
  if (b.length >= 8 && b[0] === 0x89 && b[1] === 0x50 && b[2] === 0x4e && b[3] === 0x47 && b[4] === 0x0d && b[5] === 0x0a && b[6] === 0x1a && b[7] === 0x0a) return 'image/png';
  if (b.length >= 12 && String.fromCharCode(b[4], b[5], b[6], b[7]) === 'ftyp' && HEIC_BRANDS.has(String.fromCharCode(b[8], b[9], b[10], b[11]))) return 'image/heic';
  return null;
}

/**
 * A server-side check of an uploaded bill's type: the declared type when it
 * is one we take, else (an empty or octet-stream type only) what the magic bytes say.
 */
export async function billFileType(file: File, allowed: Set<string>): Promise<string | null> {
  let declared = (file.type || '').toLowerCase();
  // A multipart part with no type arrives as octet-stream: that is "no type", so the bytes decide.
  if (declared === 'application/octet-stream') declared = '';
  if (declared) return allowed.has(declared) ? declared : null;
  const head = new Uint8Array(await file.slice(0, 16).arrayBuffer());
  const sniffed = sniffType(head);
  return sniffed && allowed.has(sniffed) ? sniffed : null;
}
