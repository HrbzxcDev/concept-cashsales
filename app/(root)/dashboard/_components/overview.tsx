import PageContainer from '@/components/layout/page-container';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { SiteFooter } from '@/components/layout/site-footer';
import { Badge } from '@/components/ui/badge';
import {
  TrendingUp,
  TrendingDown,
  ShoppingCart,
  MapPinHouse,
  Percent,
  PackageCheck
} from 'lucide-react';
import { DataTable } from '@/app/(root)/cashsales-table/_components/cashsales-tables/data-table';
import { Cashsalescolumns } from '@/app/(root)/cashsales-table/_components/cashsales-tables/columns';
import { Separator } from '@/components/ui/separator';
import { TransPerLocation } from './transperlocation';
import { ChartLineMultiple } from './dailytransperbranch';
import FetchActivity from './fetchactivity';
import { Sparkline } from '@/components/ui/sparkline';

interface OverviewProps {
  totalTransactions: number;
  totalBranch: number;
  cashsalesData: any[];
  percentageChangeData: {
    totalTransactions: number;
    yesterdayTransactions: number;
    percentage: number;
    yesterdayDate: string;
  };
}

export default function Overview({
  totalTransactions,
  totalBranch,
  cashsalesData,
  percentageChangeData
}: OverviewProps) {
  // Use real percentage change data instead of mock functions
  const getPercentageChangeTransactions = () => percentageChangeData.percentage;
  const getPercentageChangeActivity = () => 15.2; // Keep this as mock for now

  // Function to format date to readable format
  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: '2-digit'
    });
  };

  // Build compact sparkline data (daily counts for the last `days` days)
  function getDailyCountsData(rows: any[], days = 30) {
    const pad = (n: number) => String(n).padStart(2, '0');
    const toKey = (d: Date) =>
      `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

    const counts = new Map<string, number>();
    for (const row of rows || []) {
      if (!row?.cashsalesdate) continue;
      const d = new Date(row.cashsalesdate);
      const key = toKey(d);
      counts.set(key, (counts.get(key) || 0) + 1);
    }

    const result: { date: string; value: number }[] = [];
    const today = new Date();
    // Start from oldest day to newest
    for (let i = days - 1; i >= 0; i -= 1) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      const key = toKey(d);
      result.push({ date: key, value: counts.get(key) || 0 });
    }
    return result;
  }

  // Build a day-over-day percentage change series from daily counts
  function getPercentageSeries(rows: any[], days = 30) {
    const daily = getDailyCountsData(rows, days + 1); // need previous day to compute first change
    const series = [] as { date: string; value: number }[];
    for (let i = 1; i < daily.length; i += 1) {
      const prev = daily[i - 1].value;
      const curr = daily[i].value;
      const pct = prev === 0 ? 0 : ((curr - prev) / prev) * 100;
      series.push({ date: daily[i].date, value: Number(pct.toFixed(2)) });
    }
    return series;
  }

  // Flat line series for metrics that don't have historical data
  function getFlatSeries(value: number, days = 30) {
    const base = getDailyCountsData([], days);
    return base.map((d) => ({ ...d, value }));
  }

  return (
    <PageContainer scrollable>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="relative h-full w-full rounded-xl bg-white shadow-[5px_5px_5px_rgba(0,0,0,0.2)] dark:bg-neutral-900">
          <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
            <CardTitle className="text-md font-thin text-muted-foreground">
              Total Transactions
            </CardTitle>
            <ShoppingCart size={28} color="#333333" strokeWidth={1.5} />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{totalTransactions}</div>
            <div className="flex items-center gap-2 pt-2 text-xs text-muted-foreground">
              <Badge
                variant="outline"
                className={
                  getPercentageChangeTransactions() < 0
                    ? 'border-[#ef4444]/0 bg-[#ef4444]/10 text-[#ef4444] hover:bg-[#ef4444]/10'
                    : 'border-[#10b981]/0 bg-[#10b981]/10 text-[#10b981] hover:bg-[#10b981]/10'
                }
              >
                {getPercentageChangeTransactions() < 0 ? (
                  <TrendingDown className="mr-1 h-4 w-4" />
                ) : (
                  <TrendingUp className="mr-1 h-4 w-4" />
                )}
                {getPercentageChangeTransactions()}%
              </Badge>
              From Yesterday
            </div>
          </CardContent>
          <div className="absolute bottom-8 right-8">
            <Sparkline
              data={getDailyCountsData(cashsalesData, 12)}
              className="h-12 w-28"
              color="#7c6cf2"
            />
          </div>
        </Card>

        <Card className="relative h-full w-full rounded-xl bg-white shadow-[5px_5px_5px_rgba(0,0,0,0.2)] dark:bg-neutral-900">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-md font-thin text-muted-foreground">
              Yesterday&apos;s Transactions
            </CardTitle>
            <PackageCheck size={28} color="#333333" strokeWidth={1.5} />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {percentageChangeData.yesterdayTransactions}
            </div>
            <div className="flex items-center gap-2 pt-2 text-xs text-muted-foreground">
              <Badge
                variant="outline"
                className="border-[#3b82f6]/0 bg-[#3b82f6]/10 text-[#3b82f6] hover:bg-[#3b82f6]/10"
              >
                {formatDate(percentageChangeData.yesterdayDate)}
              </Badge>
            </div>
          </CardContent>
          <div className="absolute bottom-8 right-8">
            <Sparkline
              data={getDailyCountsData(cashsalesData, 12)}
              className="h-12 w-28"
              color="#ef4444"
            />
          </div>
        </Card>

        <Card className="relative h-full w-full rounded-xl bg-white shadow-[5px_5px_5px_rgba(0,0,0,0.2)] dark:bg-neutral-900">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-md font-thin text-muted-foreground">
              Transaction Rate
            </CardTitle>
            <Percent size={28} color="#333333" strokeWidth={1.5} />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {percentageChangeData.percentage}%
            </div>
            <div className="flex items-center gap-2 pt-2 text-xs text-muted-foreground">
              <Badge
                variant="outline"
                className={
                  getPercentageChangeTransactions() < 0
                    ? 'border-[#ef4444]/0 bg-[#ef4444]/10 text-[#ef4444] hover:bg-[#ef4444]/10'
                    : 'border-[#10b981]/0 bg-[#10b981]/10 text-[#10b981] hover:bg-[#10b981]/10'
                }
              >
                {getPercentageChangeTransactions() < 0 ? (
                  <TrendingDown className="mr-1 h-4 w-4" />
                ) : (
                  <TrendingUp className="mr-1 h-4 w-4" />
                )}
                {getPercentageChangeTransactions()}%
              </Badge>
              From Yesterday
            </div>
            {/* <div className="mt-1 text-xs text-muted-foreground">
              {percentageChangeData.yesterdayTransactions} of{' '}
              {percentageChangeData.totalTransactions} total
            </div> */}
          </CardContent>
          <div className="absolute bottom-8 right-8">
            <Sparkline
              data={getPercentageSeries(cashsalesData, 12)}
              className="h-12 w-28"
              color="#10b981"
            />
          </div>
        </Card>

        <Card className="relative h-full w-full rounded-xl bg-white shadow-[5px_5px_5px_rgba(0,0,0,0.2)] dark:bg-neutral-900">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-md font-thin text-muted-foreground">
              Deployed Branches
            </CardTitle>
            <MapPinHouse size={28} color="#333333" strokeWidth={1.5} />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{totalBranch}</div>
            <div className="flex items-center gap-2 pt-2 text-xs text-muted-foreground">
              <Badge
                variant="outline"
                className={
                  getPercentageChangeActivity() < 0
                    ? 'border-[#ef4444]/0 bg-[#ef4444]/10 text-[#ef4444] hover:bg-[#ef4444]/10'
                    : 'border-[#10b981]/0 bg-[#10b981]/10 text-[#10b981] hover:bg-[#10b981]/10'
                }
              >
                {getPercentageChangeActivity() < 0 ? (
                  <TrendingDown className="mr-1 h-4 w-4" />
                ) : (
                  <TrendingUp className="mr-1 h-4 w-4" />
                )}
                {getPercentageChangeActivity()}%
              </Badge>
              From Last Month
            </div>
          </CardContent>
          <div className="absolute bottom-1 right-8">
            <Sparkline
              data={getFlatSeries(totalBranch, 12)}
              className="h-12 w-28"
              color="#94a3b8"
            />
          </div>
        </Card>
      </div>

      <Separator className="my-4" />

      <div className="mt-8">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <div>
              <ChartLineMultiple />
            </div>
          </div>
          <div className="lg:col-span-1">
            <div className="flex flex-col gap-4">
              <TransPerLocation />
            </div>
          </div>
        </div>
      </div>
      {/* Cashsales Table Section */}
      <div className="mt-8">
        <div className="mb-4">
          <h2 className="text-2xl font-bold tracking-tight">Cash Sales</h2>
          <p className="text-muted-foreground">
            Recent Cash Sales Transactions
          </p>
        </div>
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <DataTable columns={Cashsalescolumns} data={cashsalesData} />
          </div>
          <div className="lg:col-span-1">
            <div className="h-[480px] lg:mt-[55px]">
              <FetchActivity />
            </div>
          </div>
        </div>
      </div>
      <SiteFooter />
    </PageContainer>
  );
}
