import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/admin';

export async function GET() {
  try {
    const { data, error } = await supabaseAdmin
      .from('daily_recaps')
      .select('*')
      .order('recap_date', { ascending: false })
      .limit(30); // Last 30 days

    if (error) throw error;

    return NextResponse.json(data || []);
  } catch (error) {
    console.error('Error fetching recaps:', error);
    return NextResponse.json(
      { error: 'Failed to fetch recaps' },
      { status: 500 }
    );
  }
}
