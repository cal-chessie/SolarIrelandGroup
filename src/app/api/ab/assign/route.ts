import { NextRequest, NextResponse } from 'next/server';
import { assignVariant, seedDefaultExperiments } from '@/lib/ab-testing/db';

// POST /api/ab/assign — get variant assignments for a visitor
export async function POST(request: NextRequest) {
  try {
    seedDefaultExperiments();

    const { visitorId } = await request.json();

    if (!visitorId || typeof visitorId !== 'string') {
      return NextResponse.json({ error: 'visitorId required' }, { status: 400 });
    }

    // Get all running experiments
    const { getAllExperiments } = await import('@/lib/ab-testing/db');
    const experiments = getAllExperiments() as Array<{ id: string; status: string }>;

    const results: Record<string, { variantId: string; variantName: string }> = {};

    for (const exp of experiments) {
      if (exp.status === 'running') {
        const assignment = assignVariant(exp.id, visitorId);
        results[exp.id] = {
          variantId: assignment.variantId,
          variantName: assignment.variantName,
        };
      }
    }

    return NextResponse.json(results);
  } catch (error) {
    console.error('A/B assign error:', error);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
