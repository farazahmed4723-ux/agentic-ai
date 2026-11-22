import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  const nodes = db.getNodes();
  return NextResponse.json({ success: true, nodes });
}

export async function PUT(request: Request) {
  try {
    const { id, updates } = await request.json();
    if (!id) {
      return NextResponse.json({ success: false, message: 'Node id required' }, { status: 400 });
    }
    const updated = db.updateNode(id, updates);
    if (!updated) {
      return NextResponse.json({ success: false, message: 'Node not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true, node: updated });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
