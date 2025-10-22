/**
 * One-time script to clear localStorage data
 * Run this in your browser console or add to a page temporarily
 */

function clearLocalStorageData() {
  console.log('Clearing localStorage authentication data...');
  
  // List of keys that might contain auth data
  const authKeys = [
    'user',
    'auth_token',
    'access_token',
    'refresh_token',
    'user_session',
    'auth_user',
    'current_user',
    'login_data'
  ];
  
  let clearedCount = 0;
  
  authKeys.forEach(key => {
    if (localStorage.getItem(key)) {
      localStorage.removeItem(key);
      console.log(`Removed: ${key}`);
      clearedCount++;
    }
  });
  
  // Also clear any keys that might contain 'auth' or 'user'
  const allKeys = Object.keys(localStorage);
  allKeys.forEach(key => {
    if (key.toLowerCase().includes('auth') || key.toLowerCase().includes('user')) {
      localStorage.removeItem(key);
      console.log(`Removed: ${key}`);
      clearedCount++;
    }
  });
  
  console.log(`Cleared ${clearedCount} items from localStorage`);
  console.log('localStorage cleanup complete!');
}

// Run the cleanup
clearLocalStorageData();

// Also provide a function for manual use
window.clearAuthData = clearLocalStorageData;
console.log('You can also run clearAuthData() manually if needed');
