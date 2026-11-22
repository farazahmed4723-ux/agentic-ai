import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  const settings = db.getSettings();
  // Safe mask or return settings (API key visible for editing)
  return NextResponse.json({ success: true, settings });
}

export async function PUT(request: Request) {
  try {
    const updates = await request.json();
    const updated = db.updateSettings(updates);
    db.addLog({
      agentName: 'System Settings',
      agentRole: 'Configuration Manager',
      action: 'Updated Settings',
      status: 'info',
      details: 'System settings and integration keys updated by administrator.',
    });
    return NextResponse.json({ success: true, settings: updated });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}
