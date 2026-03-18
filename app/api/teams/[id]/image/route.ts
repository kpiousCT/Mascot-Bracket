import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase/client';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const adminPassword = formData.get('adminPassword') as string;

    // Verify admin password
    if (adminPassword !== process.env.ADMIN_PASSWORD) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // Get the file extension
    const fileExt = file.name.split('.').pop();
    const fileName = `${id}.${fileExt}`;
    const filePath = `/mascots/${fileName}`;

    // Save file to public/mascots directory
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Write to file system
    const fs = require('fs');
    const path = require('path');
    const publicPath = path.join(process.cwd(), 'public', 'mascots', fileName);
    fs.writeFileSync(publicPath, buffer);

    // Update team's mascot_image_url in database
    const { error } = await supabase
      .from('teams')
      .update({ mascot_image_url: filePath })
      .eq('id', id);

    if (error) throw error;

    return NextResponse.json({
      success: true,
      imageUrl: filePath,
    });
  } catch (error) {
    console.error('Error uploading mascot image:', error);
    return NextResponse.json(
      { error: 'Failed to upload image' },
      { status: 500 }
    );
  }
}
