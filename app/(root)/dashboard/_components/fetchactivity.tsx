'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import { CalendarDateRangePicker } from '@/components/ui/date-range-picker';
import { DateRange } from 'react-day-picker';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { getRecentApiFetches } from '@/actions/getdata';
import { useAutoFetch } from '@/components/providers/auto-fetch-provider';
import { useAuth } from '@/components/providers/auth-provider';
import {
  CheckCircle2,
  XCircle,
  GitPullRequestCreateArrow,
  Clock,
  GitBranchPlus,
  Loader2
} from 'lucide-react';

type ActivityItem = {
  id: string;
  description: string;
  count: number;
  datefetched: string; // ISO date string
  timefetched: string; // time string
  status: boolean;
};

function formatDate(dateString: string) {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
}

function formatTime(timeString: string) {
  const [h, m, s] = timeString.split(':');
  const date = new Date();
  date.setHours(
    Number(h || 0),
    Number(m || 0),
    Number((s || '0').split('.')[0])
  );
  return date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit'
  });
}

export default function FetchActivity() {
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [manualOpen, setManualOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: new Date(),
    to: new Date()
  });
  const { refreshTrigger } = useAutoFetch();
  const { user } = useAuth();
  const isAdmin = (user?.role ?? '').trim().toLowerCase() === 'administrator';

  const loadActivities = async () => {
    setLoading(true);
    const rows = await getRecentApiFetches();
    setActivities(rows as ActivityItem[]);
    setLoading(false);
  };

  useEffect(() => {
    loadActivities();
  }, []);

  // Refresh activities when auto-fetch triggers a refresh
  useEffect(() => {
    if (refreshTrigger > 0) {
      // console.log('🔄 Auto-fetch triggered fetch activity refresh');
      loadActivities();
    }
  }, [refreshTrigger]);

  const handleManualFetch = async () => {
    if (!isAdmin) return;
    if (!dateRange?.from) return;
    try {
      setSubmitting(true);
      // Format dates in local timezone (avoid UTC shift that can move date back a day)
      const toYMDLocal = (d: Date) => {
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
      };
      const from = toYMDLocal(dateRange.from);
      const to = toYMDLocal(dateRange.to ?? dateRange.from);
      const url = `/api/fetch-and-save?upsert=true&dateFrom=${from}&dateTo=${to}&description=${encodeURIComponent(
        'Manual Fetch'
      )}&forceDetails=true`;
      const res = await fetch(url, { method: 'GET' });

      // Check if the fetch was successful
      if (res.ok) {
        await res.json();
        // console.log('✅ Manual fetch completed successfully:', result.message);

        // Refresh activity list
        await new Promise((r) => setTimeout(r, 300));
        const rows = await getRecentApiFetches();
        setActivities(rows as ActivityItem[]);
        setManualOpen(false);

        // Refresh the window after successful manual fetch
        // console.log('🔄 Refreshing window after successful manual fetch...');
        setTimeout(() => {
          window.location.reload();
        }, 1000); // 1 second delay to allow for any pending operations
      } else {
        // console.error('❌ Manual fetch failed:', res.status, res.statusText);
      }
    } catch (e) {
      //  console.error('❌ Error during manual fetch:', e);
      // swallow for now; activities will still show previous state
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Card className="flex h-full flex-col overflow-hidden shadow-[5px_5px_5px_rgba(0,0,0,0.2)]">
      <CardHeader className="border-b py-4">
        <div className="flex items-center justify-between gap-3">
          <CardTitle className="text-lg">Recent Activities</CardTitle>
          <Button
            size="sm"
            variant="outline"
            disabled={!isAdmin}
            onClick={() => isAdmin && setManualOpen(true)}
          >
            Manual Fetch
            <GitBranchPlus className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="flex-1 overflow-y-auto p-4">
        <ul className="space-y-5">
          {loading && (
            <li className="text-center text-sm text-muted-foreground">
              Loading Activity....
            </li>
          )}
          {!loading && activities.length === 0 && (
            <li className="text-center align-middle text-sm text-muted-foreground">
              No Activity Yet
            </li>
          )}
          {activities.map((item) => {
            return (
              <li key={item.id} className="flex items-start gap-4">
                <div className="mt-2">
                  <GitPullRequestCreateArrow className="h-4 w-4 text-muted-foreground" />
                </div>
                <div className="flex-1">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className="text-xs">{item.description}</p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        Fetched Data Count:{' '}
                        <span className="font-semibold">{item.count}</span>
                      </p>
                    </div>
                    <div className="mt-1 flex flex-col items-end gap-1">
                      <div className="mx-2 flex items-center gap-2 text-xs text-muted-foreground">
                        <Clock className="h-4 w-4" />
                        <span>
                          {formatDate(item.datefetched)} •{' '}
                          {formatTime(item.timefetched)}
                        </span>
                      </div>
                      <Badge
                        variant="outline"
                        className={
                          item.status
                            ? 'border-[#10b981]/0 bg-[#10b981]/10 text-[#10b981]'
                            : 'border-[#ef4444]/0 bg-[#ef4444]/10 text-[#ef4444]'
                        }
                      >
                        {item.status ? (
                          <span className="inline-flex items-center gap-1">
                            <CheckCircle2 className="h-3.5 w-3.5" /> Success
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1">
                            <XCircle className="h-3.5 w-3.5" /> Failed
                          </span>
                        )}
                      </Badge>
                    </div>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      </CardContent>
      <Dialog open={manualOpen} onOpenChange={setManualOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Manual Fetch</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Select a date range to fetch and upsert data.
            </p>
            <CalendarDateRangePicker
              className="w-full"
              date={dateRange}
              onDateChange={setDateRange}
            />
          </div>
          <DialogFooter className="gap-2 sm:gap-0 sm:space-x-2">
            <Button
              variant="ghost"
              onClick={() => setManualOpen(false)}
              disabled={submitting}
            >
              Cancel
            </Button>
            <Button
              onClick={handleManualFetch}
              disabled={submitting || !dateRange?.from}
            >
              {submitting ? (
                <>
                  Fetching Data...
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                </>
              ) : (
                'Fetch Data'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
