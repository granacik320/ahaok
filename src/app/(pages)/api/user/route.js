import { NextResponse } from 'next/server';
import db from '@/lib/db';
import { getUserFromRequest } from '@/lib/auth';

export async function GET(request) {
  try {
    const user = getUserFromRequest(request);
    
    if (!user) {
      return NextResponse.json(
        { error: 'Nieautoryzowany dostęp' },
        { status: 401 }
      );
    }

    const userData = await db.get(
      'SELECT id, email, name, created_at FROM users WHERE id = ?',
      [user.userId]
    );

    if (!userData) {
      return NextResponse.json(
        { error: 'Użytkownik nie znaleziony' },
        { status: 404 }
      );
    }

    const preferences = await db.get(
      'SELECT difficulty_levels, regions, activity_types FROM user_preferences WHERE user_id = ?',
      [user.userId]
    );

    return NextResponse.json({
      ...userData,
      preferences: preferences ? {
        difficultyLevels: JSON.parse(preferences.difficulty_levels || '[]'),
        regions: JSON.parse(preferences.regions || '[]'),
        activityTypes: JSON.parse(preferences.activity_types || '[]')
      } : null
    });

  } catch (error) {
    console.error('Get user error:', error);
    return NextResponse.json(
      { error: 'Błąd pobierania danych użytkownika' },
      { status: 500 }
    );
  }
}

export async function PUT(request) {
  try {
    const user = getUserFromRequest(request);
    
    if (!user) {
      return NextResponse.json(
        { error: 'Nieautoryzowany dostęp' },
        { status: 401 }
      );
    }

    const { name, preferences } = await request.json();

    if (name) {
      await db.run(
        'UPDATE users SET name = ? WHERE id = ?',
        [name, user.userId]
      );
    }

    if (preferences) {
      await db.run(
        `INSERT INTO user_preferences (user_id, difficulty_levels, regions, activity_types)
         VALUES (?, ?, ?, ?)
         ON CONFLICT(user_id) DO UPDATE SET
         difficulty_levels = excluded.difficulty_levels,
         regions = excluded.regions,
         activity_types = excluded.activity_types`,
        [
          user.userId,
          JSON.stringify(preferences.difficultyLevels || []),
          JSON.stringify(preferences.regions || []),
          JSON.stringify(preferences.activityTypes || [])
        ]
      );
    }

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Update user error:', error);
    return NextResponse.json(
      { error: 'Błąd aktualizacji danych użytkownika' },
      { status: 500 }
    );
  }
}