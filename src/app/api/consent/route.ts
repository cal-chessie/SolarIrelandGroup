import { NextResponse } from 'next/server';

/**
 * POST /api/consent
 *
 * Persists cookie consent records to Supabase for GDPR audit trail.
 * Falls back silently if Supabase is not configured.
 */

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { consent_state, source_page, user_agent } = body;

    // Validate required fields
    if (!consent_state || typeof consent_state !== 'object') {
      return NextResponse.json(
        { error: 'consent_state is required' },
        { status: 400 }
      );
    }

    // Try to persist to Supabase (graceful fallback if not configured)
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (supabaseUrl && supabaseAnonKey) {
      const { createClient } = await import('@supabase/supabase-js');
      const supabase = createClient(supabaseUrl, supabaseAnonKey);

      // Generate a session ID from the request
      const sessionId =
        request.headers.get('x-session-id') ||
        request.headers.get('x-forwarded-for') ||
        crypto.randomUUID();

      await supabase.from('cookie_consent_records').insert({
        session_id: sessionId,
        consent_state: consent_state,
        source_page: source_page || '/',
        user_agent: user_agent || null,
      });
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('[consent] Failed to persist consent:', error);
    return NextResponse.json(
      { error: 'Failed to persist consent' },
      { status: 500 }
    );
  }
}
