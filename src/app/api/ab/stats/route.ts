import { NextResponse } from 'next/server';
import { seedDefaultExperiments, getStats, updateExperimentStatus } from '@/lib/ab-testing/db';
import { NextRequest } from 'next/server';

// GET /api/ab/stats — overview of all experiments
export async function GET() {
  try {
    seedDefaultExperiments();
    const stats = getStats();
    return NextResponse.json(stats);
  } catch (error) {
    console.error('A/B stats error:', error);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}

// PATCH /api/ab/stats — update experiment status
export async function PATCH(request: NextRequest) {
  try {
    const { id, status } = await request.json();

    if (!id || !status) {
      return NextResponse.json({ error: 'id and status required' }, { status: 400 });
    }

    if (!['running', 'paused', 'stopped'].includes(status)) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
    }

    updateExperimentStatus(id, status);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('A/B stats PATCH error:', error);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
