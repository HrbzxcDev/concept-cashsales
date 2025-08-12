import PageContainer from '@/components/layout/page-container';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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

  return (
    <PageContainer scrollable>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="h-full w-full rounded-md bg-white shadow-[5px_5px_5px_rgba(0,0,0,0.2)] dark:bg-neutral-900">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-md font-thin text-muted-foreground">
              Total Transactions
            </CardTitle>
            <ShoppingCart size={32} color="#333333" strokeWidth={1.5} />
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
        </Card>

        <Card className="h-full w-full rounded-md bg-white shadow-[5px_5px_5px_rgba(0,0,0,0.2)] dark:bg-neutral-900">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-md font-thin text-muted-foreground">
              Yesterday&apos;s Transactions
            </CardTitle>
            <PackageCheck size={32} color="#333333" strokeWidth={1.5} />
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
        </Card>

        <Card className="h-full w-full rounded-md bg-white shadow-[5px_5px_5px_rgba(0,0,0,0.2)] dark:bg-neutral-900">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-md font-thin text-muted-foreground">
              Transaction Rate
            </CardTitle>
            <Percent size={32} color="#333333" strokeWidth={1.5} />
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
        </Card>

        <Card className="h-full w-full rounded-md bg-white shadow-[5px_5px_5px_rgba(0,0,0,0.2)] dark:bg-neutral-900">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-md font-thin text-muted-foreground">
              Deployed Branches
            </CardTitle>
            <MapPinHouse size={32} color="#333333" strokeWidth={1.5} />
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
    </PageContainer>
  );
}
