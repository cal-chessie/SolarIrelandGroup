import { NextRequest, NextResponse } from 'next/server';
import { seedDefaultExperiments, getExperimentResults } from '@/lib/ab-testing/db';

// GET /api/ab/results?experiment=hero-cta-text
export async function GET(request: NextRequest) {
  try {
    seedDefaultExperiments();

    const { searchParams } = new URL(request.url);
    const experimentId = searchParams.get('experiment');

    if (!experimentId) {
      return NextResponse.json({ error: 'experiment query param required' }, { status: 400 });
    }

    const results = getExperimentResults(experimentId);
    if (!results) {
      return NextResponse.json({ error: 'Experiment not found' }, { status: 404 });
    }

    return NextResponse.json(results);
  } catch (error) {
    console.error('A/B results error:', error);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
