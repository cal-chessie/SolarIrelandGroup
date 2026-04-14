import { NextResponse } from "next/server";
import { MOCK_DASHBOARD_DATA } from "@/lib/admin-mock-data";

export const dynamic = "force-dynamic";

export async function GET() {
  // Attempt to fetch from Supabase Edge Function
  // If unavailable, return mock data
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (supabaseUrl && supabaseAnonKey) {
      const response = await fetch(
        `${supabaseUrl}/functions/v1/admin-dashboard-api`,
        {
          headers: {
            Authorization: `Bearer ${supabaseAnonKey}`,
            "Content-Type": "application/json",
          },
          signal: AbortSignal.timeout(5000),
        }
      );

      if (response.ok) {
        const data = await response.json();
        return NextResponse.json(data);
      }
    }
  } catch {
    // Supabase not available, fall through to mock data
  }

  // Return mock data as fallback
  return NextResponse.json({
    ...MOCK_DASHBOARD_DATA,
    meta: {
      ...MOCK_DASHBOARD_DATA.meta,
      generated_at: new Date().toISOString(),
      source: "mock",
    },
  });
}
