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
    maxAge: 24 * 60 * 60, // 1 day
  },
  jwt: {
    maxAge: 24 * 60 * 60, // 1 day
  },
  callbacks: {
    async jwt({ token, user }) {
      // Persist user data to token right after signin
      if (user) {
        token.id = user.id;
        token.role = user.role;
      }
      
      // Check if token has expired on every request
      // NextAuth automatically sets token.exp based on jwt.maxAge, but we verify it here
      if (token.exp) {
        const now = Math.floor(Date.now() / 1000);
        if (token.exp < now) {
          // Token has expired - remove user data to invalidate session
          delete token.id;
          delete token.role;
          delete token.email;
          delete token.name;
          token.exp = 0;
        }
      }
      
      return token;
    },
    async session({ session, token }) {
      // Check if token exists, has user data, and is not expired
      const now = Math.floor(Date.now() / 1000);
      const isExpired = !token || !token.exp || token.exp === 0 || token.exp < now;
      const hasUserData = token && token.id;
      
      if (isExpired || !hasUserData) {
        // Token is expired or invalid - clear session user data
        // Setting id to empty string will make middleware check fail
        session.user.id = '';
        session.user.role = undefined;
        return session;
      }
      
      // Token is valid, set user properties
      session.user.id = token.id as string;
      if (token.role) {
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
