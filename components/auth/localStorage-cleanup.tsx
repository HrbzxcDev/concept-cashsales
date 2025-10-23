'use client';

import { useEffect } from 'react';
import { clearAuthData } from '@/lib/storage-cleanup';

/**
 * Component that automatically clears localStorage auth data on mount
 * Use this temporarily to clean up existing localStorage data
 */
export function LocalStorageCleanup() {
  useEffect(() => {
    clearAuthData();
  }, []);

  return null; // This component doesn't render anything
}

/**
 * Hook to manually clear localStorage data
 */
export function useLocalStorageCleanup() {
  const clearData = () => {
    clearAuthData();
  };

  return { clearData };
}
