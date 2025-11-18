import { NextResponse } from 'next/server';
import db from '@/lib/db';
import { verifyToken } from '@/lib/auth';

export async function POST(request) {
  try {
    // Weryfikuj token
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Brak autoryzacji' },
        { status: 401 }
      );
    }

    const token = authHeader.split(' ')[1];
    const decoded = verifyToken(token);

    if (!decoded) {
      return NextResponse.json(
        { error: 'Nieprawidłowy token' },
        { status: 401 }
      );
    }

    const { difficultyLevels, regions, activityTypes } = await request.json();

    // Zapisz preferencje i oznacz onboarding jako ukończony
    await db.run(
      `INSERT INTO user_preferences (user_id, difficulty_levels, regions, activity_types, onboarding_completed)
       VALUES (?, ?, ?, ?, 1)
       ON CONFLICT(user_id) DO UPDATE SET
         difficulty_levels = excluded.difficulty_levels,
         regions = excluded.regions,
         activity_types = excluded.activity_types,
         onboarding_completed = 1`,
      [
        decoded.userId,
        JSON.stringify(difficultyLevels || []),
        JSON.stringify(regions || []),
        JSON.stringify(activityTypes || [])
      ]
    );

    // Pobierz pasujące aktywności na podstawie preferencji
    let query = 'SELECT * FROM activities WHERE 1=1';
    const params = [];

    if (difficultyLevels && difficultyLevels.length > 0) {
      const placeholders = difficultyLevels.map(() => '?').join(',');
      query += ` AND difficulty IN (${placeholders})`;
      params.push(...difficultyLevels);
    }

    if (regions && regions.length > 0) {
      const placeholders = regions.map(() => '?').join(',');
      query += ` AND region IN (${placeholders})`;
      params.push(...regions);
    }

    if (activityTypes && activityTypes.length > 0) {
      const placeholders = activityTypes.map(() => '?').join(',');
      query += ` AND activity_type IN (${placeholders})`;
      params.push(...activityTypes);
    }

    query += ' ORDER BY RANDOM() LIMIT 5';

    const recommendedActivities = await db.all(query, params);

    return NextResponse.json({
      success: true,
      recommendedActivities
    });

  } catch (error) {
    console.error('Onboarding error:', error);
    return NextResponse.json(
      { error: 'Błąd podczas zapisywania preferencji' },
      { status: 500 }
    );
  }
}

export async function GET(request) {
  try {
    // Weryfikuj token
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Brak autoryzacji' },
        { status: 401 }
      );
    }

    const token = authHeader.split(' ')[1];
    const decoded = verifyToken(token);

    if (!decoded) {
      return NextResponse.json(
        { error: 'Nieprawidłowy token' },
        { status: 401 }
      );
    }

    // Sprawdź status onboardingu
    const preferences = await db.get(
      'SELECT onboarding_completed FROM user_preferences WHERE user_id = ?',
      [decoded.userId]
    );

    return NextResponse.json({
      onboardingCompleted: preferences?.onboarding_completed === 1
    });

  } catch (error) {
    console.error('Get onboarding status error:', error);
    return NextResponse.json(
      { error: 'Błąd podczas pobierania statusu' },
      { status: 500 }
    );
  }
}
