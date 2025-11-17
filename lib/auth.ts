import bcrypt from 'bcryptjs';
import { SignJWT, jwtVerify } from 'jose';
import { NextRequest } from 'next/server';

/**
 * Hash a password using bcrypt
 */
export async function hashPassword(password: string): Promise<string> {
  const saltRounds = 12;
  return await bcrypt.hash(password, saltRounds);
}

/**
 * Compare a password with its hash
 */
export async function comparePassword(password: string, hash: string): Promise<boolean> {
  return await bcrypt.compare(password, hash);
}

/**
 * Generate a secure random password
 */
export function generateSecurePassword(length: number = 12): string {
  const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*';
  let password = '';
  
  for (let i = 0; i < length; i++) {
    password += charset.charAt(Math.floor(Math.random() * charset.length));
  }
  
  return password;
}

// JWT Configuration
const JWT_SECRET = new TextEncoder().encode(
  process.env.NEXTAUTH_SECRET || 'your-secret-key-change-this-in-production'
);

export interface JWTPayload {
  sub: string; // user id
  email: string;
  name?: string;
  role?: string;
  iat?: number;
  exp?: number;
}

/**
 * Create a JWT token
 */
export async function createJWT(payload: Omit<JWTPayload, 'iat' | 'exp'>): Promise<string> {
  const token = await new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('1d') // Token expires in 1 day
    .sign(JWT_SECRET);

  return token;
}

/**
 * Verify a JWT token
 */
export async function verifyJWT(token: string): Promise<JWTPayload | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET, {
      // Explicitly require expiration check
      clockTolerance: '1m', // Allow 1 minute clock skew
    });
    
    // Additional manual expiration check as a safeguard
    if (payload.exp) {
      const now = Math.floor(Date.now() / 1000);
      if (payload.exp < now) {
        // Token has expired
        return null;
      }
    }
    
    return payload as unknown as JWTPayload;
  } catch (error: any) {
    // Check if error is due to token expiration
    // jose library throws errors with code 'ERR_JWT_EXPIRED' for expired tokens
    if (error?.code === 'ERR_JWT_EXPIRED' || error?.message?.includes('expired')) {
      // Token has expired
      return null;
    }
    // Other JWT verification errors (invalid signature, malformed token, etc.)
    return null;
  }
}

/**
 * Extract JWT from request headers
 */
export async function getJWTFromRequest(request: NextRequest): Promise<JWTPayload | null> {
  const authHeader = request.headers.get('authorization');
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }

  const token = authHeader.substring(7);
  return await verifyJWT(token);
}

/**
 * Create a secure session token for NextAuth
 */
export async function createSessionToken(user: {
  id: string;
  email: string;
  name?: string;
  role?: string;
}): Promise<string> {
  return await createJWT({
    sub: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
  });
}