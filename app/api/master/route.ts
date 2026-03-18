import { NextRequest, NextResponse } from 'next/server';
import {
  getMasterBracket,
  updateMasterBracketGame,
  recalculateScores,
} from '@/lib/db/client';

export async function GET() {
  try {
    const masterBracket = await getMasterBracket();
    return NextResponse.json(masterBracket);
  } catch (error) {
    console.error('Error fetching master bracket:', error);
    return NextResponse.json(
      { error: 'Failed to fetch master bracket' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { gameId, winningTeamId, adminPassword } = body;

    // Verify admin password
    if (adminPassword !== process.env.ADMIN_PASSWORD) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!gameId || !winningTeamId) {
      return NextResponse.json(
        { error: 'gameId and winningTeamId are required' },
        { status: 400 }
      );
    }

    // Update master bracket
    await updateMasterBracketGame(gameId, winningTeamId);

    // Recalculate all scores (triggered by database trigger, but can be called manually)
    // await recalculateScores();

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating master bracket:', error);
    return NextResponse.json(
      { error: 'Failed to update master bracket' },
      { status: 500 }
    );
  }
}
