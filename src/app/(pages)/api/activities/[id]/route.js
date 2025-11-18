import { NextResponse } from 'next/server';
import db from '@/lib/db';
import { getUserFromRequest } from '@/lib/auth';

export async function GET(request, { params }) {
  try {
    const { id } = params;

    const activity = await db.get(
      'SELECT * FROM activities WHERE id = ?',
      [id]
    );

    if (!activity) {
      return NextResponse.json(
        { error: 'Aktywność nie znaleziona' },
        { status: 404 }
      );
    }

    // Jeśli użytkownik jest zalogowany, dodaj informacje o postępie
    const user = getUserFromRequest(request);
    
    if (user) {
      const progress = await db.get(
        'SELECT * FROM user_progress WHERE user_id = ? AND activity_id = ?',
        [user.userId, id]
      );

      activity.userProgress = progress || null;
    }

    return NextResponse.json(activity);

  } catch (error) {
    console.error('Get activity error:', error);
    return NextResponse.json(
      { error: 'Błąd pobierania aktywności' },
      { status: 500 }
    );
  }
}