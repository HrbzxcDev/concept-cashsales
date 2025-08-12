'use client';

import { useEffect, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { getRecentApiFetches } from '@/actions/getdata';
import { CheckCircle2, XCircle, GitBranch, Clock } from 'lucide-react';

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
  // Handle HH:MM:SS or HH:MM:SS.sss
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

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const { getRecentApiFetches } = await import('@/actions/getdata');
      const rows = await getRecentApiFetches(8);
      setActivities(rows as ActivityItem[]);
      setLoading(false);
    };
    load();
  }, []);

  return (
    <Card className="flex h-full flex-col overflow-hidden shadow-[5px_5px_5px_rgba(0,0,0,0.2)]">
      <CardHeader className="border-b py-4">
        <CardTitle className="text-lg">Recent Activities</CardTitle>
      </CardHeader>
      <CardContent className="flex-1 overflow-y-auto p-4">
        <ul className="space-y-5">
          {loading && (
            <li className="text-sm text-muted-foreground">
              Loading Activity..…
            </li>
          )}
          {!loading && activities.length === 0 && (
            <li className="text-sm text-muted-foreground">No Activity Yet</li>
          )}
          {activities.map((item) => {
            return (
              <li key={item.id} className="flex items-start gap-4">
                <div className="mt-1">
                  <GitBranch className="h-4 w-4 text-muted-foreground" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <p className="font-medium">{item.description}</p>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Clock className="h-4 w-4" />
                      <span>
                        {formatDate(item.datefetched)} •{' '}
                        {formatTime(item.timefetched)}
                      </span>
                    </div>
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Fetched Data Count:{' '}
                    <span className="font-semibold">{item.count}</span>
                  </p>
                  <div className="mt-2 flex items-center gap-2">
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
                          <CheckCircle2 className="h-3.5 w-3.5" /> success
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1">
                          <XCircle className="h-3.5 w-3.5" /> failed
                        </span>
                      )}
                    </Badge>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      </CardContent>
    </Card>
  );
}
