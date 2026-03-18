import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/admin';

export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const body = await request.json();
    const { adminPassword, name, mascot_name } = body;

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

    // Check if the name already exists for a different team (warning only)
    let isDuplicate = false;
    if (name) {
      const { data: existingTeams } = await supabaseAdmin
        .from('teams')
        .select('id, name')
        .eq('name', name)
        .neq('id', id);

      if (existingTeams && existingTeams.length > 0) {
        isDuplicate = true;
      }
    }

    // Build update object with only provided fields
    const updateData: any = {};
    if (name !== undefined) updateData.name = name;
    if (mascot_name !== undefined) updateData.mascot_name = mascot_name;

    // Update the team
    const { data, error } = await supabaseAdmin
      .from('teams')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating team:', error);
      return NextResponse.json(
        { error: `Failed to update team: ${error.message}` },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data,
      isDuplicate
    });
  } catch (error: any) {
    console.error('Error updating team:', error);
    return NextResponse.json(
      { error: `Failed to update team: ${error.message || 'Unknown error'}` },
      { status: 500 }
    );
  }
}
