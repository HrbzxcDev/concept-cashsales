import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/utils/db/drizzle';
import { usersTable } from '@/utils/db/schema';
import { hashPassword } from '@/lib/auth';
import { eq } from 'drizzle-orm';

// GET - List all users (for admin purposes)
export async function GET(request: NextRequest) {
  try {
    const users = await db
      .select({
        id: usersTable.id,
        username: usersTable.username,
        email: usersTable.email,
        role: usersTable.role,
        createdAt: usersTable.createdAt,
        updatedAt: usersTable.updatedAt,
      })
      .from(usersTable);

    return NextResponse.json({
      success: true,
      users,
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST - Create a new user
export async function POST(request: NextRequest) {
  try {
    const { username, email, password, role = 'Administrator' } = await request.json();

    // Validate input
    if (!username || !email || !password) {
      return NextResponse.json(
        { error: 'Username, email, and password are required' },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.email, email))
      .limit(1);

    if (existingUser.length > 0) {
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 409 }
      );
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Create user
    const newUser = await db
      .insert(usersTable)
      .values({
        username,
        email,
        password: hashedPassword,
        role,
      })
      .returning();

    const { password: _, ...userWithoutPassword } = newUser[0];

    return NextResponse.json({
      success: true,
      user: userWithoutPassword,
      message: 'User created successfully',
    });

  } catch (error) {
    console.error('Error creating user:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
