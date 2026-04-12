import { NextResponse } from 'next/server';
import { seedDefaultExperiments, getExperimentResults, getAllExperiments } from '@/lib/ab-testing/db';

export async function GET() {
  try {
    seedDefaultExperiments();
    const experiments = getAllExperiments();
    const results = experiments.map((exp: Record<string, unknown>) =>
      getExperimentResults(exp.id as string)
    ).filter(Boolean);
    return NextResponse.json(results);
  } catch (error) {
    console.error('A/B experiments error:', error);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
