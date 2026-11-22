import { NextResponse } from 'next/server';
import { runOrchestratorPipeline } from '@/lib/agents/orchestrator';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const result = await runOrchestratorPipeline({
      campaignName: body.campaignName || 'On-Demand Multi-Agent Pipeline',
      niche: body.niche || 'Limousine and Chauffeur Services',
      subNiche: body.subNiche || '',
      city: body.city || 'Toronto',
      country: body.country || 'Canada',
      targetCount: Number(body.targetCount) || 10,
    });
    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || 'Pipeline execution failed' },
      { status: 500 }
    );
  }
}
