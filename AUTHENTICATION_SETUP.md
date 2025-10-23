# Database Authentication Setup

This guide explains how to set up database authentication for the Concept CashSales application.

## Overview

The authentication system now uses the `tblusers` table in your database instead of hardcoded credentials. Users are authenticated against the database with proper password hashing.

## Database Schema

The `tblusers` table has the following structure:

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

## Setup Instructions

### 1. Add a Test User

You can add a user in several ways:

#### Option A: Using the Admin Panel
1. Start your application
2. Navigate to `/admin/users`
3. Use the "Create New User" form to add users

#### Option B: Using SQL
Run this SQL in your database (replace the password hash with a real bcrypt hash):

```sql
INSERT INTO tblusers (username, email, password, role) VALUES
('Admin User', 'admin@example.com', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj4J/4QZ5K2O', 'Administrator');
```

#### Option C: Using the Script
Run the provided script to get the SQL:

```bash
node scripts/add-test-user.js
```

### 2. Test the Authentication

1. Navigate to `/login`
2. Use the credentials you created
3. You should be redirected to the dashboard upon successful login

## API Endpoints

### Authentication

- `POST /api/auth/login` - Authenticate user
- `GET /api/auth/users` - List all users (admin)
- `POST /api/auth/users` - Create new user (admin)

### Example Login Request

```json
{
  "email": "admin@example.com",
  "password": "password123"
}
```

### Example Login Response

```json
{
  "success": true,
  "user": {
    "id": "uuid-here",
    "username": "Admin User",
    "email": "admin@example.com",
    "role": "Administrator",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  },
  "message": "Login successful"
}
```

## Security Features

- **Password Hashing**: All passwords are hashed using bcrypt with salt rounds of 12
- **Input Validation**: Email and password validation on both client and server
- **Error Handling**: Secure error messages that don't reveal sensitive information
- **Session Management**: User sessions are stored in memory only (no localStorage) for enhanced security
- **No Persistent Storage**: Authentication state is not persisted across browser sessions

## User Management

### Admin Panel
Access the user management panel at `/admin/users` to:
- View all users
- Create new users
- Manage user roles

### Programmatic User Creation

```typescript
import { hashPassword } from '@/lib/auth';

const hashedPassword = await hashPassword('userpassword');
// Use hashedPassword in database insert
```

## Production Considerations

1. **JWT Tokens**: Consider implementing JWT tokens for stateless authentication
2. **Session Timeout**: Implement automatic session timeout
3. **Rate Limiting**: Add rate limiting to login endpoints
4. **Audit Logging**: Log authentication attempts and failures
5. **Password Policies**: Implement password complexity requirements
6. **Two-Factor Authentication**: Consider adding 2FA for enhanced security
7. **Secure Cookies**: Consider using httpOnly cookies for session management

## Troubleshooting

### Common Issues

1. **"Invalid email or password"**: Check if user exists in database and password is correct
2. **Database connection errors**: Verify DATABASE_URL environment variable
3. **Password hash mismatch**: Ensure passwords are properly hashed before storing

### Debug Mode

Enable debug logging by checking the browser console and server logs for detailed error messages.

## Migration from Mock Auth

The system has been updated to use database authentication. The old mock credentials no longer work. You must create users in the database using one of the methods described above.
