import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { executeSchedulerTrigger } from '@/lib/agents/scheduler-agent';

export async function GET() {
  const scheduler = db.getScheduler();
  return NextResponse.json({ success: true, scheduler });
}

export async function POST(request: Request) {
  try {
    const { action, updates } = await request.json();

    if (action === 'RUN_NOW') {
      const result = await executeSchedulerTrigger('Manual user trigger');
      return NextResponse.json(result);
    }

    if (action === 'TOGGLE_PAUSE') {
      const current = db.getScheduler();
      const updated = db.updateScheduler({ paused: !current.paused });
      return NextResponse.json({ success: true, scheduler: updated });
    }

    if (action === 'UPDATE_CONFIG' && updates) {
      const updated = db.updateScheduler(updates);
      return NextResponse.json({ success: true, scheduler: updated });
    }

    return NextResponse.json({ success: false, message: 'Invalid scheduler action' }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
