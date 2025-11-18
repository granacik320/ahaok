import { NextResponse } from 'next/server';
import db from '@/lib/db';
import { comparePassword, generateToken } from '@/lib/auth';

export async function POST(request) {
  try {
    const { email, password } = await request.json();

    // Walidacja
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email i hasło są wymagane' },
        { status: 400 }
      );
    }

    // Znajdź użytkownika
    const user = await db.get(
      'SELECT id, email, password, name FROM users WHERE email = ?',
      [email]
    );

    if (!user) {
      return NextResponse.json(
        { error: 'Nieprawidłowy email lub hasło' },
        { status: 401 }
      );
    }

    // Sprawdź hasło
    const isPasswordValid = comparePassword(password, user.password);

    if (!isPasswordValid) {
      return NextResponse.json(
        { error: 'Nieprawidłowy email lub hasło' },
        { status: 401 }
      );
    }

    // Generuj token
    const token = generateToken(user.id, user.email);

    // Sprawdź status onboardingu
    const preferences = await db.get(
      'SELECT onboarding_completed FROM user_preferences WHERE user_id = ?',
      [user.id]
    );

    return NextResponse.json({
      success: true,
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name
      },
      onboardingCompleted: preferences?.onboarding_completed === 1
    });

  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Błąd podczas logowania' },
      { status: 500 }
    );
  }
}