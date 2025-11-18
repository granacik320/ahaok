import { NextResponse } from 'next/server';
import db from '@/lib/db';
import { hashPassword, generateToken } from '@/lib/auth';

export async function POST(request) {
  try {
    const { email, password, name } = await request.json();

    // Walidacja
    if (!email || !password || !name) {
      return NextResponse.json(
        { error: 'Wszystkie pola są wymagane' },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Hasło musi mieć minimum 6 znaków' },
        { status: 400 }
      );
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Nieprawidłowy format email' },
        { status: 400 }
      );
    }

    // Sprawdź czy użytkownik już istnieje
    const existingUser = await db.get(
      'SELECT id FROM users WHERE email = ?',
      [email]
    );

    if (existingUser) {
      return NextResponse.json(
        { error: 'Użytkownik z tym adresem email już istnieje' },
        { status: 409 }
      );
    }

    // Hashowanie hasła
    const hashedPassword = hashPassword(password);

    // Tworzenie użytkownika
    const result = await db.run(
      'INSERT INTO users (email, password, name) VALUES (?, ?, ?)',
      [email, hashedPassword, name]
    );

    // Tworzenie domyślnych preferencji
    await db.run(
      'INSERT INTO user_preferences (user_id, difficulty_levels, regions, activity_types) VALUES (?, ?, ?, ?)',
      [result.id, JSON.stringify([]), JSON.stringify([]), JSON.stringify([])]
    );

    // Generowanie tokenu
    const token = generateToken(result.id, email);

    return NextResponse.json({
      success: true,
      token,
      user: {
        id: result.id,
        email,
        name
      }
    }, { status: 201 });

  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { error: 'Błąd podczas rejestracji' },
      { status: 500 }
    );
  }
}