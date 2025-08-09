import PageContainer from '@/components/layout/page-container';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, ShoppingCart, Activity } from 'lucide-react';
import { DataTable } from '@/app/(root)/cashsales-table/_components/cashsales-tables/data-table';
import { Cashsalescolumns } from '@/app/(root)/cashsales-table/_components/cashsales-tables/columns';

interface OverviewProps {
  totalTransactions: number;
  totalBranch: number;
  cashsalesData: any[];
}

export default function Overview({ totalTransactions, totalBranch, cashsalesData }: OverviewProps) {
  // Mock percentage change functions (you can replace with real data)
  const getPercentageChangeTransactions = () => 8.7;
  const getPercentageChangeActivity = () => 15.2;

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
              {totalTransactions}
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
              {totalTransactions}
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
              {totalTransactions}
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
              {totalBranch}
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
      
      {/* Cashsales Table Section */}
      <div className="mt-8">
        <div className="mb-4">
          <h2 className="text-2xl font-bold tracking-tight">Cash Sales</h2>
          <p className="text-muted-foreground">Recent cash sales transactions</p>
        </div>
        <DataTable columns={Cashsalescolumns} data={cashsalesData} />
      </div>
    </PageContainer>
  );
}
