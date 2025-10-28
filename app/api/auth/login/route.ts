import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/utils/db/drizzle';
import { usersTable } from '@/utils/db/schema';
import { eq } from 'drizzle-orm';
import { comparePassword } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    // Validate input
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    // Find user by email
    const user = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.email, email))
      .limit(1);

    if (user.length === 0) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    const foundUser = user[0];

    // Compare password
    const isPasswordValid = await comparePassword(password, foundUser.password);

    if (!isPasswordValid) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    // Return user data (excluding password)
    const { password: _, ...userWithoutPassword } = foundUser;

    return NextResponse.json({
      success: true,
      user: userWithoutPassword,
      message: 'Login successful'
    });

  } catch (error) {
    // Avoid logging error details to console in production
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
