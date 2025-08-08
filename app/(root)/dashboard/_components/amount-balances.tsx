'use client';

import * as React from 'react';
import { CartesianGrid, XAxis, BarChart, Bar, YAxis } from 'recharts';
import { toast } from '@/hooks/use-toast';

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent
} from '@/components/ui/chart';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { fetchAmountBalances } from '@/actions/amount-balances-actions';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, CalendarDays } from 'lucide-react';

interface LoanStats {
  date: string;
  amountPaid: number;
  balance: number;
}

const chartConfig = {
  amountPaid: {
    label: 'Amount Paid',
    color: 'hsl(var(--chart-1))'
  },
  balance: {
    label: 'Balance',
    color: 'hsl(var(--chart-2))'
  }
};

export function AmountBalances() {
  const [timeRange, setTimeRange] = React.useState('270d');
  const [loanData, setLoanData] = React.useState<LoanStats[]>([]);

  const getPercentageChange  = () => {
    if (loanData.length < 3) return 0; // Need at least 3 months of data now

    // Get the data for Current Month (second to last) and Previous Month (third to last)
    const currentMonth = loanData[loanData.length - 2]; // Current Month
    const previousMonth = loanData[loanData.length - 3]; // Previous Month

    // Calculate totals for each month
    const currentTotal = currentMonth.amountPaid + currentMonth.balance;
    const previousTotal = previousMonth.amountPaid + previousMonth.balance;

    // Calculate percentage change
    const percentageChange =
      ((currentTotal - previousTotal) / previousTotal) * 100;

    // console.log({
    //   month: 'Current Month vs Previous Month',
    //   currentTotal,
    //   previousTotal,
    //   percentageChange: Math.round(percentageChange * 100) / 100
    // });

    // Return rounded to 2 decimal places
    return Math.round(percentageChange * 100) / 100;
  };

  React.useEffect(() => {
    async function getLoanData() {
      try {
        const result = await fetchAmountBalances(timeRange);
        const monthsToShow = parseInt(timeRange) / 30; // Convert days to months
        const filteredResult = result.slice(-monthsToShow);
        setLoanData(filteredResult);
      } catch (error) {
        toast({
          title: 'Error',
          description: 'Error Fetching Amount Balances Data',
          variant: 'destructive'
        });
      }
    }

    getLoanData();

    return () => {};
  }, [timeRange]);

  return (
    <Card className="shadow-[rgba(0,0,0,0.2)_5px_5px_4px_0px]">
      <CardHeader className="flex items-center gap-2 space-y-0 border-b py-5 sm:flex-row">
        <div className="grid flex-1 gap-1 text-center sm:text-left">
          <CardTitle>Paid Amount and Balances</CardTitle>
          <CardDescription>Total Paid Amount and Balances</CardDescription>
        </div>
        <Select value={timeRange} onValueChange={setTimeRange}>
          <SelectTrigger
            className="w-[170px] rounded-sm sm:ml-auto"
            aria-label="Select a value"
          >
            <SelectValue placeholder="Last 6 months" />
          </SelectTrigger>
          <SelectContent className="rounded-sm">
            <SelectItem value="730d" className="mb-1">
              <div className="flex items-center gap-2">
                <CalendarDays className="h-4 w-4 text-muted-foreground" />
                <span>Last 24 Months</span>
              </div>
            </SelectItem>
            <SelectItem value="540d" className="mb-1">
              <div className="flex items-center gap-2">
                <CalendarDays className="h-4 w-4 text-muted-foreground" />
                <span>Last 18 Months</span>
              </div>
            </SelectItem>
            <SelectItem value="365d" className="mb-1">
              <div className="flex items-center gap-2">
                <CalendarDays className="h-4 w-4 text-muted-foreground" />
                <span> Last 12 Months</span>
              </div>
            </SelectItem>
            <SelectItem value="270d" className="mb-1">
              <div className="flex items-center gap-2">
                <CalendarDays className="h-4 w-4 text-muted-foreground" />
                <span>Last 9 Months</span>
              </div>
            </SelectItem>
            <SelectItem value="180d" className="mb-1">
              <div className="flex items-center gap-2">
                <CalendarDays className="h-4 w-4 text-muted-foreground" />
                <span>Last 6 Months</span>
              </div>
            </SelectItem>
          </SelectContent>
        </Select>
      </CardHeader>
      <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
        <ChartContainer
          config={chartConfig}
          className="aspect-auto h-[200px] w-full"
        >
          <BarChart
            data={loanData}
            margin={{
              left: -5
            }}
            accessibilityLayer
          >
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="date"
              tickLine={false}
              tickMargin={10}
              axisLine={false}
              tickFormatter={(value) => {
                const date = new Date(value);
                return date.toLocaleDateString('en-US', {
                  month: 'short'
                });
              }}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tickMargin={5}
              tickFormatter={(value) => {
                return value.toLocaleString();
              }}
            />
            <ChartTooltip
              content={
                <ChartTooltipContent
                  labelFormatter={(value) => {
                    const date = new Date(value);
                    return date.toLocaleDateString('en-US', {
                      month: 'long',
                      year: 'numeric'
                    });
                  }}
                />
              }
            />
            <ChartLegend content={<ChartLegendContent />} />
            <Bar
              dataKey="amountPaid"
              stackId="a"
              fill="var(--color-amountPaid)"
              radius={[0, 0, 4, 4]}
            />
            <Bar
              dataKey="balance"
              stackId="a"
              fill="var(--color-balance)"
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ChartContainer>
      </CardContent>
      <CardFooter>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Badge
            variant="outline"
            className={
              getPercentageChange() < 0
                ? 'border-[#ef4444]/0 bg-[#ef4444]/10 text-[#ef4444] hover:bg-[#ef4444]/10'
                : 'border-[#10b981]/0 bg-[#10b981]/10 text-[#10b981] hover:bg-[#10b981]/10'
            }
          >
            {getPercentageChange() < 0 ? (
              <TrendingDown className="mr-1 h-4 w-4" />
            ) : (
              <TrendingUp className="mr-1 h-4 w-4" />
            )}
            {getPercentageChange()}%
          </Badge>
          Versus Last Month
        </div>
      </CardFooter>
    </Card>
  );
}
