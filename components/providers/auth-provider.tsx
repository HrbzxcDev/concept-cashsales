'use client';

import { createContext, useContext, ReactNode } from 'react';
import { useSession, signIn, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';

interface User {
  id: string;
  email: string;
  name?: string;
  role?: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  isLoading: boolean;
  isAuthenticated: boolean;
  clearStoredData: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const { data: session, status } = useSession();
  const router = useRouter();

  const user: User | null = session?.user ? {
    id: session.user.id || '',
    email: session.user.email || '',
    name: session.user.name || '',
    role: session.user.role || '',
  } : null;

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        return false;
      }

      return true;
    } catch (error) {
      // Swallow error to avoid logging to console; UI will show toast
      return false;
    }
  };

  const logout = async () => {
    await signOut({ redirect: false });
    router.push('/login');
  };

  const clearStoredData = () => {
    // NextAuth handles session cleanup automatically
  };

  const value: AuthContextType = {
    user,
    login,
    logout,
    isLoading: status === 'loading',
    isAuthenticated: !!session,
    clearStoredData,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

