import { NextResponse } from 'next/server';
import { generateAnalyticsReport } from '@/lib/agents/reporting-agent';

export async function GET() {
  try {
    const report = await generateAnalyticsReport();
    return NextResponse.json({ success: true, report });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
