import { NextRequest, NextResponse } from 'next/server';
import { forwardLead, isRateLimited, isHoneypotTripped } from '@/lib/leadBridge';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

interface ContactFormData {
  name: string;
  email: string;
  phone: string;
  county: string;
  message: string;
}

export async function POST(request: NextRequest) {
  try {
    if (isRateLimited(request)) {
      return NextResponse.json({ error: 'Too many requests. Please try again shortly.' }, { status: 429 });
    }

    const body = await request.json() as ContactFormData & Record<string, unknown>;

    // Honeypot: accept-and-drop bot submissions silently.
    if (isHoneypotTripped(body)) {
      return NextResponse.json({ success: true, message: 'Thank you!' });
    }

    const { name, email, message } = body;

    if (!name || typeof name !== 'string' || name.trim().length < 2) {
      return NextResponse.json(
        { error: 'Please provide a valid name.' },
        { status: 400 }
      );
    }

    if (!email || typeof email !== 'string' || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json(
        { error: 'Please provide a valid email address.' },
        { status: 400 }
      );
    }

    if (!message || typeof message !== 'string' || message.trim().length < 10) {
      return NextResponse.json(
        { error: 'Please provide a message (at least 10 characters).' },
        { status: 400 }
      );
    }

    // Contact submissions are leads too - forward through the same AISolar
    // bridge as every other intake (with SIG-side fallback so none are lost).
    const result = await forwardLead({
      brand: 'solar-ireland',
      source: 'website_contact',
      name: name.trim().slice(0, 120),
      email: email.trim().toLowerCase().slice(0, 254),
      phone: body.phone?.trim().slice(0, 40) || undefined,
      county: body.county?.trim().slice(0, 60) || undefined,
      message: message.trim().slice(0, 2000),
      meta: { page: '/contact' },
    });

    if (!result.ok) {
      return NextResponse.json(
        { error: 'We could not send that just now. Please email sales@solarirelandgroup.ie or WhatsApp us.' },
        { status: 502 }
      );
    }

    console.log('[Contact Form] Lead forwarded', { leadId: result.leadId ?? null, fallback: result.fallback ?? false });

    return NextResponse.json({
      success: true,
      message: 'Thank you! Your message has been received. We\'ll get back to you within 24 hours.',
    });
  } catch (error) {
    console.error('[Contact Form] Error processing submission:', error);
    return NextResponse.json(
      { error: 'Something went wrong. Please try again later.' },
      { status: 500 }
    );
  }
}
