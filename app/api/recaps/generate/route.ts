import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { generateDailyRecap } from '@/lib/recap/generator';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { date, adminPassword } = body;

    // Verify admin password
    if (adminPassword !== process.env.ADMIN_PASSWORD) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!date) {
      return NextResponse.json(
        { error: 'date parameter required (YYYY-MM-DD)' },
        { status: 400 }
      );
    }

    const recapDate = new Date(date);
    const recap = await generateDailyRecap(recapDate);

    // Insert or update recap
    const { data, error } = await supabaseAdmin
      .from('daily_recaps')
      .upsert({
        recap_date: recap.recap_date,
        games_completed_today: recap.games_completed_today,
        total_games_completed: recap.total_games_completed,
        biggest_upset: recap.biggest_upset,
        biggest_upset_seed_diff: recap.biggest_upset_seed_diff,
        biggest_rank_change: recap.biggest_rank_change,
        new_eliminations: recap.new_eliminations,
        eliminated_brackets: recap.eliminated_brackets,
        summary_text: recap.summary_text,
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({
      success: true,
      recap: data,
    });
  } catch (error) {
    console.error('Error generating recap:', error);
    return NextResponse.json(
      { error: 'Failed to generate recap', details: String(error) },
      { status: 500 }
    );
  }
}
