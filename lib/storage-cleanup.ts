/**
 * Utility functions for cleaning up localStorage data
 */

/**
 * Remove all authentication-related data from localStorage
 */
export function clearAuthData(): void {
  // Remove user data
  localStorage.removeItem('user');
  
  // Remove any other auth-related keys that might exist
  const authKeys = [
    'auth_token',
    'access_token',
    'refresh_token',
    'user_session',
    'auth_user',
    'current_user',
    'login_data'
  ];
  
  authKeys.forEach(key => {
    localStorage.removeItem(key);
  });
}

/**
 * Check if there's any auth data in localStorage
 */
export function hasAuthData(): boolean {
  const userData = localStorage.getItem('user');
  return userData !== null;
}

/**
 * Get any existing auth data from localStorage (for migration purposes)
 */
export function getStoredAuthData(): any {
  try {
    const userData = localStorage.getItem('user');
    return userData ? JSON.parse(userData) : null;
  } catch (error) {
    console.error('Error parsing stored auth data:', error);
    return null;
  }
}
