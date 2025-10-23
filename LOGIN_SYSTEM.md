# Login System Documentation

This document describes the login system implementation for the Concept CashSales application.

## Overview

The login system is built using:
- **shadcn/ui** components for consistent UI
- **React Hook Form** for form management
- **Zod** for form validation
- **Context API** for authentication state management
- **Next.js App Router** for routing

## Components

### 1. LoginForm (`components/ui/login-form.tsx`)

A comprehensive login form component with the following features:

- **Form Validation**: Email and password validation using Zod schema
- **Password Visibility Toggle**: Eye icon to show/hide password
- **Loading States**: Spinner during authentication
- **Toast Notifications**: Success/error messages using Sonner
- **Social Login Buttons**: Google and GitHub (UI only)
- **Responsive Design**: Works on all screen sizes
- **Dark Mode Support**: Follows the app's theme

#### Usage

```tsx
import { LoginForm } from '@/components/ui/login-form';

// Basic usage
<LoginForm />

// With custom redirect
<LoginForm redirectTo="/custom-route" />

// With success callback
<LoginForm onLoginSuccess={() => console.log('Logged in!')} />
```

### 2. AuthProvider (`components/providers/auth-provider.tsx`)

Context provider for authentication state management:

- **User State**: Stores current user information
- **Login Function**: Handles authentication logic
- **Logout Function**: Clears user session
- **Persistence**: Uses localStorage for session persistence
- **Loading States**: Manages authentication loading state

#### Usage

```tsx
import { useAuth } from '@/components/providers/auth-provider';

function MyComponent() {
  const { user, login, logout, isAuthenticated, isLoading } = useAuth();
  
  // Use authentication state
}
```

### 3. ProtectedRoute (`components/providers/protected-route.tsx`)

Wrapper component to protect routes that require authentication:

- **Authentication Check**: Redirects unauthenticated users
- **Loading State**: Shows spinner while checking auth
- **Custom Redirect**: Configurable redirect destination

#### Usage

```tsx
import { ProtectedRoute } from '@/components/providers/protected-route';

<ProtectedRoute>
  <YourProtectedComponent />
</ProtectedRoute>
```

## Routes

### 1. Login Page (`/login`)

Main login page that renders the LoginForm component.

### 2. Login Demo (`/login/demo`)

Demo page showing the login form with documentation and test credentials.

## Authentication Flow

1. **User visits protected route** → Redirected to `/login`
2. **User enters credentials** → Form validation occurs
3. **Credentials submitted** → AuthProvider.login() called
4. **Authentication success** → User state updated, redirected to dashboard
5. **Authentication failure** → Error toast shown

## Demo Credentials

For testing purposes, use these credentials:

- **Email**: `admin@example.com`
- **Password**: `password123`

## Integration

The login system is integrated into the app through:

1. **Root Layout**: AuthProvider wraps the entire app
2. **Dashboard Layout**: ProtectedRoute protects dashboard routes
3. **Sidebar**: Shows user info and logout functionality

## Customization

### Styling

The login form uses Tailwind CSS classes and follows the app's design system. Colors and spacing can be customized through the CSS variables defined in `app/globals.css`.

### Authentication Logic

The current implementation uses mock authentication. To integrate with a real backend:

1. Replace the mock logic in `AuthProvider.login()`
2. Update the API endpoint
3. Handle real authentication responses
4. Implement proper error handling

### Form Validation

The Zod schema in `LoginForm` can be extended to include additional validation rules:

```tsx
const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  // Add more fields as needed
});
```

## Security Considerations

- **Client-side validation**: Form validation is for UX only
- **Server-side validation**: Always validate on the server
- **Session management**: Consider implementing proper session tokens
- **Password security**: Implement proper password hashing
- **HTTPS**: Ensure all authentication happens over HTTPS

## Future Enhancements

- [ ] Real authentication API integration
- [ ] Password reset functionality
- [ ] Two-factor authentication
- [ ] Social login integration
- [ ] Remember me functionality
- [ ] Session timeout handling
- [ ] Role-based access control
