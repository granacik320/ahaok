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

    const progress = await db.all(
      `SELECT 
        up.*,
        a.name as activity_name,
        a.difficulty,
        a.region,
        a.activity_type,
        a.image_url
       FROM user_progress up
       JOIN activities a ON up.activity_id = a.id
       WHERE up.user_id = ?
       ORDER BY up.completed_at DESC`,
      [user.userId]
    );

    // Statystyki - total to wszystkie aktywności, completed to ukończone przez użytkownika
    const totalActivities = await db.get('SELECT COUNT(*) as count FROM activities');

    const completedCount = await db.get(
      `SELECT COUNT(*) as count
       FROM user_progress
       WHERE user_id = ? AND completed = 1`,
      [user.userId]
    );

    return NextResponse.json({
      progress,
      stats: {
        total: totalActivities?.count || 0,
        completed: completedCount?.count || 0
      }
    });

  } catch (error) {
    console.error('Get progress error:', error);
    return NextResponse.json(
      { error: 'Błąd pobierania postępu' },
      { status: 500 }
    );
  }
}

export async function POST(request) {
    try {
        const user = getUserFromRequest(request);
    
        if (!user) {
            return NextResponse.json(
                { error: 'Nieautoryzowany dostęp' },
                { status: 401 }
            );
        }

        const { activityId, completed, rating, notes } = await request.json();

        if (!activityId) {
            return NextResponse.json(
                { error: 'ID aktywności jest wymagane' },
                { status: 400 }
            );
        }

        const completedAt = completed ? new Date().toISOString() : null;

        await db.run(
            `INSERT INTO user_progress (user_id, activity_id, completed, completed_at, rating, notes)
       VALUES (?, ?, ?, ?, ?, ?)
       ON CONFLICT(user_id, activity_id) DO UPDATE SET
       completed = excluded.completed,
       completed_at = excluded.completed_at,
       rating = excluded.rating,
       notes = excluded.notes`,
            [user.userId, activityId, completed ? 1 : 0, completedAt, rating, notes]
        );

        return NextResponse.json({ success: true });

    } catch (error) {
        console.error('Update progress error:', error);
        return NextResponse.json(
            { error: 'Błąd aktualizacji postępu' },
            { status: 500 }
        );
    }
}