import { NextRequest, NextResponse } from 'next/server';
import { seedDefaultExperiments, trackConversion } from '@/lib/ab-testing/db';

// POST /api/ab/convert — record a conversion event
export async function POST(request: NextRequest) {
  try {
    seedDefaultExperiments();

    const { experimentId, visitorId, type, metadata } = await request.json();

    if (!experimentId || !visitorId || !type) {
      return NextResponse.json(
        { error: 'experimentId, visitorId, and type are required' },
        { status: 400 }
      );
    }

    const success = trackConversion(experimentId, visitorId, type, metadata || {});

    if (!success) {
      return NextResponse.json({ error: 'No assignment found for this visitor' }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('A/B convert error:', error);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
