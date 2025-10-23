import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { db } from '@/utils/db/drizzle';
import { usersTable } from '@/utils/db/schema';
import { eq } from 'drizzle-orm';
import { comparePassword } from '@/lib/auth';
import type { DefaultSession, NextAuthConfig } from 'next-auth';

// Extend NextAuth types
declare module 'next-auth' {
  interface User {
    role?: string;
  }
  interface Session {
    user: {
      id: string;
      role?: string;
    } & DefaultSession['user'];
  }
}

export const config = {
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        try {
          const user = await db
            .select()
            .from(usersTable)
            .where(eq(usersTable.email, credentials.email as string))
            .limit(1);

          if (user.length === 0) {
            return null;
          }

          const foundUser = user[0];

          // Compare password
          const isPasswordValid = await comparePassword(
            credentials.password as string,
            foundUser.password
          );

          if (!isPasswordValid) {
            return null;
          }

          // Return user object (excluding password)
          return {
            id: foundUser.id,
            email: foundUser.email,
            name: foundUser.username,
            role: foundUser.role,
          };
        } catch (error) {
          // Authentication failed
          return null;
        }
      }
    })
  ],
  session: {
    strategy: 'jwt',
    maxAge: 7 * 24 * 60 * 60, // 7 days
  },
  jwt: {
    maxAge: 7 * 24 * 60 * 60, // 7 days
  },
  callbacks: {
    async jwt({ token, user }) {
      // Persist the OAuth access_token and or the user id to the token right after signin
      if (user) {
        token.id = user.id;
        token.role = user.role;
      }
      return token;
    },
    async session({ session, token }) {
      // Send properties to the client
      if (token) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
      }
      return session;
    },
  },
  pages: {
    signIn: '/login',
    error: '/login',
  },
  secret: process.env.NEXTAUTH_SECRET,
} satisfies NextAuthConfig;

export const { handlers, auth, signIn, signOut } = NextAuth(config);
