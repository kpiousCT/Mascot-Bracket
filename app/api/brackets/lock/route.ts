import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase/client';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { adminPassword, locked } = body;

    // Verify admin password
    if (adminPassword !== process.env.ADMIN_PASSWORD) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Lock or unlock all brackets
    const { error } = await supabase
      .from('user_brackets')
      .update({ is_locked: locked })
      .neq('id', '00000000-0000-0000-0000-000000000000'); // Update all

    if (error) throw error;

    return NextResponse.json({
      success: true,
      message: locked ? 'All brackets locked' : 'All brackets unlocked'
    });
  } catch (error) {
    console.error('Error locking brackets:', error);
    return NextResponse.json(
      { error: 'Failed to lock brackets' },
      { status: 500 }
    );
  }
}
