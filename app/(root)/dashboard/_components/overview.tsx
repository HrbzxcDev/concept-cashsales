'use client';

import { useEffect, useState } from 'react';
import PageContainer from '@/components/layout/page-container';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { gettotaltrans, gettotalbranch } from '@/actions/getdata';
import { TrendingUp, TrendingDown, ShoppingCart, Activity } from 'lucide-react';

export default function Overview() {
  const [totalTransactions, setTotalTransactions] = useState<number>(0);
  const [totalBranch, settotalBranch] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTotalTrans = async () => {
      try {
        setLoading(true);
        const totaltrans = await gettotaltrans();
        setTotalTransactions(Number(totaltrans));
      } catch (error) {
        console.error('Error fetching total transactions:', error);
        setError('Failed to fetch total transactions');
      } finally {
        setLoading(false);
      }
    };
    
    const fetchTotalBranch = async () => {
      try {
        setLoading(true);
        const totalbranch = await gettotalbranch();
        settotalBranch(Number(totalbranch));
      } catch (error) {
        console.error('Error fetching total branch:', error);
        setError('Failed to fetch total branch');
      } finally {
        setLoading(false);
      }
    };

    fetchTotalTrans();
    fetchTotalBranch();
  }, []);

  // Mock percentage change functions (you can replace with real data)
  const getPercentageChangeTransactions = () => 8.7;
  const getPercentageChangeActivity = () => 15.2;

  if (loading) {
    return (
      <PageContainer scrollable>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <div className="h-32 animate-pulse rounded-lg bg-muted"></div>
          <div className="h-32 animate-pulse rounded-lg bg-muted"></div>
          <div className="h-32 animate-pulse rounded-lg bg-muted"></div>
          <div className="h-32 animate-pulse rounded-lg bg-muted"></div>
        </div>
      </PageContainer>
    );
  }

  if (error) {
    return (
      <PageContainer scrollable>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <div className="col-span-full">
            <div className="rounded-lg border border-destructive p-4">
              <p className="text-destructive">Error: {error}</p>
            </div>
          </div>
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer scrollable>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="h-full w-full rounded-md bg-white dark:bg-neutral-900">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-md font-thin text-muted-foreground">
              Total Transactions
            </CardTitle>
            <ShoppingCart size={24} color="#333333" strokeWidth={1.5} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {loading ? (
                <Skeleton className="h-8 w-[200px] sm:w-[100px] md:w-[100px] lg:w-[240px]" />
              ) : (
                totalTransactions
              )}
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
              From Last Month
            </div>
          </CardContent>
        </Card>

        <Card className="h-full w-full rounded-md bg-white dark:bg-neutral-900">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-md font-thin text-muted-foreground">
              Total Transactions
            </CardTitle>
            <ShoppingCart size={24} color="#333333" strokeWidth={1.5} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {loading ? (
                <Skeleton className="h-8 w-[200px] sm:w-[100px] md:w-[100px] lg:w-[240px]" />
              ) : (
                totalTransactions
              )}
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
              From Last Month
            </div>
          </CardContent>
        </Card>

        <Card className="h-full w-full rounded-md bg-white dark:bg-neutral-900">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-md font-thin text-muted-foreground">
              Total Transactions
            </CardTitle>
            <ShoppingCart size={24} color="#333333" strokeWidth={1.5} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {loading ? (
                <Skeleton className="h-8 w-[200px] sm:w-[100px] md:w-[100px] lg:w-[240px]" />
              ) : (
                totalTransactions
              )}
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
              From Last Month
            </div>
          </CardContent>
        </Card>

        <Card className="h-full w-full rounded-md bg-white dark:bg-neutral-900">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-md font-thin text-muted-foreground">
              Deployed Branches
            </CardTitle>
            <Activity size={24} color="#333333" strokeWidth={1.5} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {loading ? (
                <Skeleton className="h-8 w-[200px] sm:w-[100px] md:w-[100px] lg:w-[240px]" />
              ) : (
                totalBranch
              )}
            </div>
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
    </PageContainer>
  );
}
