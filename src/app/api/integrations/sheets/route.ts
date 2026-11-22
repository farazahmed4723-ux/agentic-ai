import { NextResponse } from 'next/server';
import { syncGoogleSheets, generateLeadsCsv, SHEETS_TABS } from '@/lib/integrations/sheets';
import { db } from '@/lib/db';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const format = searchParams.get('format');

  if (format === 'csv') {
    const leads = db.getLeads();
    const csvContent = generateLeadsCsv(leads);
    return new NextResponse(csvContent, {
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': 'attachment; filename="ai-by-faraz-leads.csv"',
      },
    });
  }

  const sheetsSync = db.getSheetsSync();
  const settings = db.getSettings();

  return NextResponse.json({
    success: true,
    tabs: SHEETS_TABS,
    sheetUrl: sheetsSync.sheetUrl,
    syncedTabsCount: sheetsSync.syncedTabsCount,
    lastSyncedAt: sheetsSync.lastSyncedAt,
    status: sheetsSync.status,
    googleSheetId: settings.googleSheetId,
  });
}

export async function POST() {
  try {
    const res = await syncGoogleSheets();
    return NextResponse.json(res);
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
