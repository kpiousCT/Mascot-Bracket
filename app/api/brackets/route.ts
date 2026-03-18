import { NextRequest, NextResponse } from 'next/server';
import {
  createUserBracket,
  getUserBracketByName,
  getUserBrackets,
  getBracketPicks,
} from '@/lib/db/client';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const userName = searchParams.get('userName');

    if (userName) {
      // Get specific user's bracket
      const bracket = await getUserBracketByName(userName);
      if (!bracket) {
        return NextResponse.json(
          { error: 'Bracket not found' },
          { status: 404 }
        );
      }

      const picks = await getBracketPicks(bracket.id);
      return NextResponse.json({ ...bracket, picks });
    } else {
      // Get all brackets
      const brackets = await getUserBrackets();
      return NextResponse.json(brackets);
    }
  } catch (error) {
    console.error('Error fetching brackets:', error);
    return NextResponse.json(
      { error: 'Failed to fetch brackets' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userName } = body;

    if (!userName || typeof userName !== 'string') {
      return NextResponse.json(
        { error: 'userName is required' },
        { status: 400 }
      );
    }

    // Check if bracket already exists
    const existing = await getUserBracketByName(userName);
    if (existing) {
      const picks = await getBracketPicks(existing.id);
      return NextResponse.json({ ...existing, picks });
    }

    // Create new bracket
    const bracket = await createUserBracket(userName);
    return NextResponse.json({ ...bracket, picks: [] }, { status: 201 });
  } catch (error) {
    console.error('Error creating bracket:', error);
    return NextResponse.json(
      { error: 'Failed to create bracket' },
      { status: 500 }
    );
  }
}
