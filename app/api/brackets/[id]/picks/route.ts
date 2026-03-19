import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/admin';

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

    // Use admin client to bypass RLS policies
    const picksWithBracketId = picks.map((pick) => ({
      bracket_id: id,
      game_id: pick.game_id,
      selected_team_id: pick.selected_team_id,
    }));

    const { error: upsertError } = await supabaseAdmin
      .from('bracket_picks')
      .upsert(picksWithBracketId, {
        onConflict: 'bracket_id,game_id',
        ignoreDuplicates: false
      });

    if (upsertError) {
      console.error('Error upserting picks:', upsertError);
      throw upsertError;
    }

    // Fetch updated picks
    const { data: updatedPicks, error: fetchError } = await supabaseAdmin
      .from('bracket_picks')
      .select('*')
      .eq('bracket_id', id);

    if (fetchError) {
      console.error('Error fetching picks:', fetchError);
      throw fetchError;
    }

    return NextResponse.json({ picks: updatedPicks || [] });
  } catch (error: any) {
    console.error('Error updating bracket picks:', error);
    return NextResponse.json(
      { error: `Failed to update bracket picks: ${error.message || 'Unknown error'}` },
      { status: 500 }
    );
  }
}
