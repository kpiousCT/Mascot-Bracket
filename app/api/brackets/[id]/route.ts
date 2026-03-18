import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/admin';

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const body = await request.json();
    const { adminPassword } = body;

    // Verify admin password
    if (!process.env.ADMIN_PASSWORD) {
      console.error('ADMIN_PASSWORD environment variable is not set');
      return NextResponse.json(
        { error: 'Server configuration error: ADMIN_PASSWORD not set' },
        { status: 500 }
      );
    }

    if (adminPassword !== process.env.ADMIN_PASSWORD) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { id } = await context.params;

    // Delete picks first (foreign key constraint)
    const { error: picksError } = await supabaseAdmin
      .from('bracket_picks')
      .delete()
      .eq('bracket_id', id);

    if (picksError) {
      console.error('Error deleting picks:', picksError);
      return NextResponse.json(
        { error: `Failed to delete picks: ${picksError.message}` },
        { status: 500 }
      );
    }

    // Delete leaderboard score
    const { error: leaderboardError } = await supabaseAdmin
      .from('leaderboard_scores')
      .delete()
      .eq('bracket_id', id);

    if (leaderboardError) {
      console.error('Error deleting leaderboard:', leaderboardError);
      return NextResponse.json(
        { error: `Failed to delete leaderboard: ${leaderboardError.message}` },
        { status: 500 }
      );
    }

    // Delete the bracket
    const { error: bracketError } = await supabaseAdmin
      .from('user_brackets')
      .delete()
      .eq('id', id);

    if (bracketError) {
      console.error('Error deleting bracket:', bracketError);
      return NextResponse.json(
        { error: `Failed to delete bracket: ${bracketError.message}` },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error deleting bracket:', error);
    return NextResponse.json(
      { error: `Failed to delete bracket: ${error.message || 'Unknown error'}` },
      { status: 500 }
    );
  }
}
