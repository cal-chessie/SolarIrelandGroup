import { NextRequest, NextResponse } from 'next/server';
import { forwardLeadToAisolar } from '@/lib/aisolar';

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

    console.log('[Contact Form] New submission received:', {
      name: name.trim(),
      email: email.trim(),
      phone: body.phone?.trim() || 'N/A',
      county: body.county?.trim() || 'N/A',
      messageLength: message.trim().length,
      timestamp: new Date().toISOString(),
    });

    // Forward into the AISOLAR platform pipeline (never blocks the user).
    await forwardLeadToAisolar({
      source: 'website_contact',
      name: name.trim(),
      email: email.trim(),
      phone: body.phone?.trim() || undefined,
      county: body.county?.trim() || undefined,
      message: message.trim(),
    });

    // Send the lead by email via Postmark (if configured).
    // Without POSTMARK_SERVER_TOKEN the submission is only logged — leads WILL be lost.
    const postmarkToken = process.env.POSTMARK_SERVER_TOKEN;
    const leadTo = process.env.CONTACT_EMAIL_TO || 'cal@solarireland.com';
    const leadFrom = process.env.CONTACT_EMAIL_FROM || leadTo;
    if (postmarkToken) {
      const pmRes = await fetch('https://api.postmarkapp.com/email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
          'X-Postmark-Server-Token': postmarkToken,
        },
        body: JSON.stringify({
          From: leadFrom,
          To: leadTo,
          ReplyTo: email.trim(),
          Subject: `New website enquiry from ${name.trim()}`,
          TextBody: [
            `Name: ${name.trim()}`,
            `Email: ${email.trim()}`,
            `Phone: ${body.phone?.trim() || 'N/A'}`,
            `County: ${body.county?.trim() || 'N/A'}`,
            '',
            message.trim(),
          ].join('\n'),
          MessageStream: 'outbound',
        }),
      });
      if (!pmRes.ok) {
        console.error('[Contact Form] Postmark send failed:', pmRes.status, await pmRes.text());
        return NextResponse.json(
          { error: 'Something went wrong sending your message. Please try again or WhatsApp us.' },
          { status: 502 }
        );
      }
    } else {
      console.warn('[Contact Form] POSTMARK_SERVER_TOKEN not set — lead only logged, not emailed.');
    }

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
