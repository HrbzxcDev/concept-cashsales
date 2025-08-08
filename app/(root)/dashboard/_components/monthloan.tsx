'use client';

import * as React from 'react';
import { TrendingUp, TrendingDown, CalendarDays } from 'lucide-react';
import { CartesianGrid, Line, LineChart, XAxis, YAxis, LabelList } from 'recharts';

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent
} from '@/components/ui/chart';
import { getLoanCountsByMonth } from '@/actions/overview-actions';
import {
  Select,
  SelectItem,
  SelectContent,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { toast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
interface LoanCount {
  month: string;
  count: number;
}

const chartConfig = {
  count: {
    label: 'Monthly Loans',
    color: 'hsl(var(--chart-1))'
  },
  month: {
    color: 'hsl(var(--chart-2))',
    label: 'Month'
  }
} satisfies ChartConfig;

export function MonthLoan() {
  const [timeRange, setTimeRange] = React.useState('270d');
  const [loanData, setLoanData] = React.useState<LoanCount[]>([]);
  const [chartData, setChartData] = React.useState<
    Array<{
      month: string;
      count: number;
    }>
  >([]);

  const getPercentageChange = () => {
    if (loanData.length < 3) return 0; // Need at least 3 months of data now

    // Get the data for Current Month (second to last) and Previous Month (third to last)
    const currentMonth = loanData[loanData.length - 2]; // Current Month
    const previousMonth = loanData[loanData.length - 3]; // Previous Month

    // Calculate totals for each month
    const currentTotal = currentMonth.count;
    const previousTotal = previousMonth.count;

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
        const result = await getLoanCountsByMonth();
        const monthsToShow = parseInt(timeRange) / 30; // Convert days to months

        // Group and sum by month-year
        const groupedData = result.reduce(
          (acc: { [key: string]: number }, curr) => {
            const date = new Date(curr.month);
            const monthYear = date.toLocaleDateString('en-US', {
              month: 'short',
              year: 'numeric'
            });

            acc[monthYear] = (acc[monthYear] || 0) + curr.count;
            return acc;
          },
          {}
        );

        // Convert back to array format
        const processedData = Object.entries(groupedData).map(
          ([month, count]) => ({
            month,
            count
          })
        );

        // Take only the last X months based on timeRange
        const filteredResult = processedData.slice(-monthsToShow);
        setChartData(filteredResult);
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
    <Card className="flex flex-col shadow-[rgba(0,0,0,0.2)_5px_5px_4px_0px]">
      <CardHeader className="flex items-center gap-2 space-y-0 border-b py-5 sm:flex-row">
        <div className="grid flex-1 gap-1 text-center sm:text-left">
          <CardTitle>Loans by Month</CardTitle>
          <CardDescription>Total Loans by Month</CardDescription>
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
      <CardContent className="flex-1">
        <ChartContainer className="h-[350px] w-full" config={chartConfig}>
          <LineChart
            data={chartData}
            margin={{
              top: 50,
              left: -30,
              right: 15
            }}
            accessibilityLayer
          >
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="month"
              tickLine={false}
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
              tickMargin={10}
              tickFormatter={(value) => {
                return value.toLocaleString();
              }}
            />
            <ChartTooltip
              cursor={false}
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
            <Line
              dataKey="count"
              type="natural"
              stroke={chartConfig.count.color}
              strokeWidth={2}
              dot={{
                fill: chartConfig.month.color
              }}
              activeDot={{
                r: 5,
                fill: chartConfig.month.color
              }}
            >
              <LabelList
                key="count-labels"
                dataKey="count"
                position="top"
                offset={12}
                className="fill-foreground"
                fontSize={12}
                formatter={(value: number, entry: any) => `${value}`}
              />
            </Line>
          </LineChart>
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
