# JWT and NextAuth Implementation

This document describes the complete JWT and NextAuth authentication implementation for the Concept CashSales application.

## Overview

The authentication system now uses:
- **NextAuth v5** with JWT strategy for session management
- **JWT tokens** for secure authentication
- **Database integration** with existing user schema
- **Middleware protection** for route security
- **TypeScript support** with proper type definitions

## Architecture

### 1. NextAuth Configuration (`lib/nextauth.ts`)

- **Credentials Provider**: Authenticates users against the database
- **JWT Strategy**: Uses JWT tokens for stateless authentication
- **Session Management**: 7-day token expiration
- **Custom Callbacks**: Extends session with user role and ID

### 2. JWT Utilities (`lib/auth.ts`)

- **Token Creation**: Secure JWT generation with HS256 algorithm
- **Token Verification**: JWT validation and payload extraction
- **Password Hashing**: bcrypt integration for secure password storage
- **Request Authentication**: Extract JWT from request headers

### 3. API Routes (`app/api/auth/[...nextauth]/route.ts`)

- **NextAuth Handlers**: GET and POST endpoints for authentication
- **Automatic Session Management**: Handles login, logout, and session refresh

### 4. Middleware (`middleware.ts`)

- **Route Protection**: Automatically protects specified routes
- **Session Validation**: Checks authentication status
- **Redirect Logic**: Redirects unauthenticated users to login

### 5. Updated AuthProvider (`components/providers/auth-provider.tsx`)

- **NextAuth Integration**: Uses `useSession` hook
- **Session Management**: Automatic session state management
- **Type Safety**: Proper TypeScript interfaces

## Features

### Security Features

- **JWT Tokens**: Stateless authentication with secure tokens
- **Password Hashing**: bcrypt with salt rounds of 12
- **Session Expiration**: 7-day token lifetime
- **Route Protection**: Middleware-based route security
- **CSRF Protection**: Built-in NextAuth CSRF protection

### User Experience

- **Automatic Redirects**: Seamless login/logout flow
- **Loading States**: Proper loading indicators
- **Error Handling**: User-friendly error messages
- **Session Persistence**: Maintains login across browser sessions

## Setup Instructions

### 1. Environment Variables

Create a `.env.local` file with the following variables:

```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/database_name"

# NextAuth Configuration
NEXTAUTH_SECRET="your-secret-key-change-this-in-production"
NEXTAUTH_URL="http://localhost:3000"

# API Configuration (existing)
NEXT_PUBLIC_API_BASE_URL="https://your-api-base-url.com"
NEXT_PUBLIC_DB_CODE="your-db-code"
```

### 2. Database Schema

The implementation uses the existing `tblusers` table:

```sql
CREATE TABLE tblusers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username VARCHAR(100) NOT NULL,
  password VARCHAR(100) NOT NULL,
  email VARCHAR(100) NOT NULL,
  role VARCHAR(50) NOT NULL DEFAULT 'Administrator',
  createdAt TIMESTAMP NOT NULL DEFAULT NOW(),
  updatedAt TIMESTAMP NOT NULL DEFAULT NOW()
);
```

### 3. User Creation

Users can be created through:
- Admin panel at `/admin/users`
- Direct database insertion
- Script execution: `node scripts/add-test-user.js`

## Usage Examples

### 1. Login Process

```typescript
import { useAuth } from '@/components/providers/auth-provider';

function LoginComponent() {
  const { login, isLoading, isAuthenticated } = useAuth();

  const handleLogin = async (email: string, password: string) => {
    const success = await login(email, password);
    if (success) {
      // User is now authenticated
      console.log('Login successful');
    }
  };
}
```

### 2. Protected Routes

```typescript
import { ProtectedRoute } from '@/components/providers/protected-route';

function App() {
  return (
    <ProtectedRoute>
      <YourProtectedComponent />
    </ProtectedRoute>
  );
}
```

### 3. Server-Side Authentication

```typescript
import { auth } from '@/lib/nextauth';

export async function GET(request: NextRequest) {
  const session = await auth();
  
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  // User is authenticated
  return NextResponse.json({ user: session.user });
}
```

### 4. JWT Token Usage

```typescript
import { createJWT, verifyJWT } from '@/lib/auth';

// Create a token
const token = await createJWT({
  sub: user.id,
  email: user.email,
  name: user.name,
  role: user.role
});

// Verify a token
const payload = await verifyJWT(token);
if (payload) {
  console.log('User ID:', payload.sub);
  console.log('User Role:', payload.role);
}
```

## API Endpoints

### Authentication Endpoints

- `GET /api/auth/signin` - NextAuth sign-in page
- `POST /api/auth/signin/credentials` - Credentials authentication
- `GET /api/auth/signout` - Sign out endpoint
- `GET /api/auth/session` - Get current session
- `GET /api/auth/csrf` - CSRF token endpoint

### Custom Endpoints

- `POST /api/auth/login` - Legacy login endpoint (still functional)
- `GET /api/auth/users` - User management (admin)
- `POST /api/auth/users` - Create user (admin)

## Migration from Custom Auth

The implementation maintains backward compatibility:

1. **Existing Login Form**: Works without changes
2. **AuthProvider Interface**: Same API as before
3. **Protected Routes**: Same component usage
4. **User Management**: Existing admin panel works

## Security Considerations

### Production Setup

1. **Environment Variables**: Use strong, unique secrets
2. **HTTPS**: Always use HTTPS in production
3. **Database Security**: Secure database connections
4. **Token Security**: JWT tokens are signed and verified
5. **Session Management**: Automatic session cleanup

### Best Practices

1. **Password Policies**: Implement strong password requirements
2. **Rate Limiting**: Add rate limiting to login endpoints
3. **Audit Logging**: Log authentication attempts
4. **Session Timeout**: Consider shorter session lifetimes
5. **Two-Factor Authentication**: Consider adding 2FA

## Troubleshooting

### Common Issues

1. **"Invalid credentials"**: Check user exists and password is correct
2. **Session not persisting**: Verify NEXTAUTH_SECRET is set
3. **Redirect loops**: Check middleware configuration
4. **Database errors**: Verify DATABASE_URL is correct

### Debug Mode

Enable debug logging:

```env
NEXTAUTH_DEBUG=true
```

### Testing Authentication

1. **Login Test**: Use existing login form
2. **Session Test**: Check browser cookies for NextAuth session
3. **API Test**: Test protected API endpoints
4. **Middleware Test**: Verify route protection works

## Performance Considerations

- **JWT Tokens**: Lightweight and stateless
- **Database Queries**: Minimal database calls
- **Session Caching**: NextAuth handles session caching
- **Middleware**: Efficient route protection

## Future Enhancements

1. **OAuth Providers**: Add Google, GitHub, etc.
2. **Two-Factor Authentication**: Implement 2FA
3. **Role-Based Access**: Enhanced permission system
4. **Session Management**: Advanced session controls
5. **Audit Logging**: Comprehensive authentication logs

This implementation provides a robust, secure, and scalable authentication system using industry-standard JWT tokens and NextAuth v5.
