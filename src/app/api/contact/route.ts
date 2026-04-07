import { NextRequest, NextResponse } from 'next/server';

/* ═══════════════════════════════════════════════════════════════
   CONTACT FORM API ROUTE
   Accepts POST with form data and stores it for processing.
   ═══════════════════════════════════════════════════════════════ */

interface ContactFormData {
  name: string;
  email: string;
  phone: string;
  county: string;
  message: string;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as ContactFormData;

    // Basic server-side validation
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

    // In production, this would send to a CRM, email service, or webhook.
    // For now, we log and acknowledge receipt.
    console.log('[Contact Form] New submission received:', {
      name: name.trim(),
      email: email.trim(),
      phone: body.phone?.trim() || 'N/A',
      county: body.county?.trim() || 'N/A',
      messageLength: message.trim().length,
      timestamp: new Date().toISOString(),
    });

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
