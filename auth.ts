import NextAuth, { User } from "next-auth";
import { compare } from "bcryptjs";
import CredentialsProvider from "next-auth/providers/credentials";
import { db } from '@/utils/db/drizzle';
import { usersTable } from '@/utils/db/schema';
import { eq } from "drizzle-orm";

export const { handlers, signIn, signOut, auth } = NextAuth({
  session: {
    strategy: "jwt",
  },
  providers: [
    CredentialsProvider({
      async authorize(credentials) {
        // Check if credentials are provided
        if (!credentials?.email || !credentials?.password) {
          return null; // Return null if no credentials
        }

        // Fetch user from the database
        const user = await db
          .select()
          .from(usersTable)
          .where(eq(usersTable.email, credentials.email.toString()))
          .limit(1);

        // Check if user exists
        if (user.length === 0) return null; // Return null if user not found

        // Validate password
        const isPasswordValid = await compare(
          credentials.password.toString(),
          user[0].password,
        );

        // Return user object if password is valid
        if (!isPasswordValid) return null; // Return null if password is invalid

        return {
          id: user[0].id.toString(),
          email: user[0].email,
          name: user[0].username,
        } as User; // Return user object
      },
    }),
  ],
  pages: {
    signIn: "/sign-in", // Custom sign-in page
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id; // Set user ID in token
        token.name = user.name; // Set user name in token
      }

      return token; // Return updated token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string; // Set user ID in session
        session.user.name = token.name as string; // Set user name in session
      }

      return session; // Return updated session
    },
  },
});