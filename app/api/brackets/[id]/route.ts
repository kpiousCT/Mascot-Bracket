import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase/client';

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
    await supabase
      .from('bracket_picks')
      .delete()
      .eq('bracket_id', id);

    // Delete leaderboard score
    await supabase
      .from('leaderboard_scores')
      .delete()
      .eq('bracket_id', id);

    // Delete the bracket
    const { error } = await supabase
      .from('user_brackets')
      .delete()
      .eq('id', id);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting bracket:', error);
    return NextResponse.json(
      { error: 'Failed to delete bracket' },
      { status: 500 }
    );
  }
}
