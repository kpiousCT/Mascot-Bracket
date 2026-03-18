import { NextRequest, NextResponse } from 'next/server';
import { saveBracketPicks, getBracketPicks } from '@/lib/db/client';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { picks } = body;

    if (!picks || !Array.isArray(picks)) {
      return NextResponse.json(
        { error: 'picks array is required' },
        { status: 400 }
      );
    }

    await saveBracketPicks(id, picks);
    const updatedPicks = await getBracketPicks(id);

    return NextResponse.json({ picks: updatedPicks });
  } catch (error) {
    console.error('Error updating bracket picks:', error);
    return NextResponse.json(
      { error: 'Failed to update bracket picks' },
      { status: 500 }
    );
  }
}
