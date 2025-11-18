import { NextResponse } from 'next/server';
import db from '@/lib/db';
import { getUserFromRequest } from '@/lib/auth';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const difficulty = searchParams.get('difficulty');
    const region = searchParams.get('region');
    const activityType = searchParams.get('activity_type');

    let query = 'SELECT * FROM activities WHERE 1=1';
    const params = [];

    if (difficulty) {
      query += ' AND difficulty = ?';
      params.push(difficulty);
    }

    if (region) {
      query += ' AND region = ?';
      params.push(region);
    }

    if (activityType) {
      query += ' AND activity_type = ?';
      params.push(activityType);
    }

    query += ' ORDER BY name ASC';

    const activities = await db.all(query, params);

    // Jeśli użytkownik jest zalogowany, dodaj informacje o postępie
    const user = getUserFromRequest(request);
    
    if (user) {
      const progressData = await db.all(
        'SELECT activity_id, completed FROM user_progress WHERE user_id = ?',
        [user.userId]
      );

      const progressMap = {};
      progressData.forEach(p => {
        progressMap[p.activity_id] = p.completed === 1;
      });

      activities.forEach(activity => {
        activity.completed = progressMap[activity.id] || false;
      });
    }

    return NextResponse.json(activities);

  } catch (error) {
    console.error('Get activities error:', error);
    return NextResponse.json(
      { error: 'Błąd pobierania aktywności' },
      { status: 500 }
    );
  }
}