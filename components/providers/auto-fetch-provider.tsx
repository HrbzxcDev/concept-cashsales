'use client';

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode
} from 'react';

interface AutoFetchContextType {
  isEnabled: boolean;
  setIsEnabled: (enabled: boolean) => void;
  lastFetchTime: Date | null;
  isFetching: boolean;
  triggerFetch: () => Promise<void>;
  fetchError: string | null;
  refreshTrigger: number;
  triggerRefresh: () => void;
}

const AutoFetchContext = createContext<AutoFetchContextType | undefined>(
  undefined
);

interface AutoFetchProviderProps {
  children: ReactNode;
  defaultEnabled?: boolean;
  autoTriggerOnLoad?: boolean;
  fetchInterval?: number; // in milliseconds, 0 to disable
}

export function AutoFetchProvider({
  children,
  defaultEnabled = true,
  autoTriggerOnLoad = true,
  fetchInterval = 0
}: AutoFetchProviderProps) {
  const [isEnabled, setIsEnabled] = useState(defaultEnabled);
  const [lastFetchTime, setLastFetchTime] = useState<Date | null>(null);
  const [isFetching, setIsFetching] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [hasTriggeredOnLoad, setHasTriggeredOnLoad] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const triggerRefresh = () => {
    setRefreshTrigger((prev) => prev + 1);
  };

  const triggerFetch = async () => {
    if (!isEnabled || isFetching) return;

    try {
      setIsFetching(true);
      setFetchError(null);

      // console.log('🔄 Triggering fetch-and-save...');

      const response = await fetch(
        '/api/fetch-and-save?limit=1000&upsert=true',
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();

      if (result.success) {
        if (result.alreadyCompleted) {
          // console.log('ℹ️ Fetch skipped - already completed:', result.message);
          // console.log(
          //   `📊 Previous run: Saved: ${result.savedCount}, Updated: ${result.updatedCount}`
          // );
          setLastFetchTime(new Date());
        } else {
          // console.log('✅ Fetch completed successfully:', result.message);
          // console.log(
          //   `📊 Saved: ${result.savedCount}, Updated: ${result.updatedCount}`
          // );
          setLastFetchTime(new Date());

          // Trigger refresh of all components after successful fetch
          if (result.savedCount > 0 || result.updatedCount > 0) {
            // console.log(
            //   '🔄 Triggering component refresh due to data changes...'
            // );
            triggerRefresh();

            // Refresh the window after successful data fetch
            // console.log('🔄 Refreshing window after successful data fetch...');
            setTimeout(() => {
              window.location.reload();
            }, 1000); // 1 second delay to allow for any pending operations
          }
        }
      } else {
        // console.warn('⚠️ Fetch completed with warnings:', result.message);
        setFetchError(result.message);
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Unknown error occurred';
      // console.error('❌ Fetch failed:', errorMessage);
      setFetchError(errorMessage);
    } finally {
      setIsFetching(false);
    }
  };

  // Auto-trigger on page load
  useEffect(() => {
    if (autoTriggerOnLoad && isEnabled && !hasTriggeredOnLoad) {
      // Add a small delay to ensure the page is fully loaded
      const timer = setTimeout(() => {
        triggerFetch();
        setHasTriggeredOnLoad(true);
      }, 2000); // 2 second delay

      return () => clearTimeout(timer);
    }
  }, [autoTriggerOnLoad, isEnabled, hasTriggeredOnLoad]);

  // Auto-trigger on interval
  useEffect(() => {
    if (!isEnabled || fetchInterval <= 0) return;

    const interval = setInterval(() => {
      triggerFetch();
    }, fetchInterval);

    return () => clearInterval(interval);
  }, [isEnabled, fetchInterval]);

  // Reset hasTriggeredOnLoad when the component unmounts and remounts
  useEffect(() => {
    return () => {
      setHasTriggeredOnLoad(false);
    };
  }, []);

  const value: AutoFetchContextType = {
    isEnabled,
    setIsEnabled,
    lastFetchTime,
    isFetching,
    triggerFetch,
    fetchError,
    refreshTrigger,
    triggerRefresh
  };

  return (
    <AutoFetchContext.Provider value={value}>
      {children}
    </AutoFetchContext.Provider>
  );
}

export function useAutoFetch() {
  const context = useContext(AutoFetchContext);
  if (context === undefined) {
    throw new Error('useAutoFetch must be used within an AutoFetchProvider');
  }
  return context;
}
