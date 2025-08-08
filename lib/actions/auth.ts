'use server';

import { eq } from 'drizzle-orm';
import { db } from '@/utils/db/drizzle';
import { usersTable } from '@/utils/db/schema';
import { hash } from 'bcryptjs';
import { signIn } from '@/auth';
import { headers } from 'next/headers';
import ratelimit from '@/lib/ratelimit';
import { redirect } from 'next/navigation';
import { logAction } from '@/actions/auditlogs-actions';


export const signInWithCredentials = async (
  params: Pick<AuthCredentials, 'email' | 'password'>
) => {
  const { email, password } = params;

  const ip = (await headers()).get('x-forwarded-for') || '127.0.0.1';
  const { success } = await ratelimit.limit(ip);

  if (!success) return redirect('/too-fast');

  try {
    const result = await signIn('credentials', {
      email,
      password,
      redirect: false
    });
    await logAction(
      'Sign-In Module',
      'Sign-In',
      `${
        email
      } Has Successfully Sign-In`
    );


    if (result?.error) {
      return { success: false, error: result.error };
    }

    // Redirect to the dashboard after successful sign-in
    // return { success: true };
    return { success: true };
    
  } catch (error) {
    // console.log(error, 'Signin error');
    return { success: false, error: 'Signin error' };
  }
};

export const signUp = async (params: AuthCredentials) => {
  const { username, email, password } = params;

  const ip = (await headers()).get('x-forwarded-for') || '127.0.0.1';
  const { success } = await ratelimit.limit(ip);

  if (!success) return redirect('/too-fast');

  const existingUser = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.email, email))
    .limit(1);

  if (existingUser.length > 0) {
    return { success: false, error: 'User already exists' };
  }

  const hashedPassword = await hash(password, 10);

  try {
    await db.insert(usersTable).values({
      email,
      username,
      password: hashedPassword
    });

    await signInWithCredentials({ email, password });
    await logAction(
      'Sign-Up Module',
      'Sign-Up',
      `An Email '${
        email
      }' Has Successfully Created An Account`
    );

    return { success: true };
  } catch (error) {
    0;
    // console.log(error, 'Signup error');
    return { success: false, error: 'Signup error' };
  }
};
