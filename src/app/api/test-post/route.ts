import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  const body = await request.json();
  return NextResponse.json({
    success: true,
    received: body,
    timestamp: new Date().toISOString()
  });
}

export async function GET() {
  return NextResponse.json({ status: 'test-post route is working' });
}
