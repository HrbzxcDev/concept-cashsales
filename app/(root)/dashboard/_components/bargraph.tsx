'use client';

import * as React from 'react';
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from 'recharts';
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
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent
} from '@/components/ui/chart';
import { Badge } from '@/components/ui/badge';
import { fetchtbloans } from '@/actions/bargraph-actions';
import { TrendingUp, TrendingDown, CalendarDays } from 'lucide-react';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem
} from '@/components/ui/select';

interface BarData {
  amount: number;
  interest: number;
  firstpay: string;
}

const chartConfig = {
  amount: {
    label: 'Amount Loan',
    color: 'hsl(var(--chart-1))'
  },
  interest: {
    label: 'Interest',
    color: 'hsl(var(--chart-2))'
  }
} satisfies ChartConfig;

export default function Bargraph() {
  const [transformedData, setTransformedData] = React.useState<BarData[]>([]);
  const [timeRange, setTimeRange] = React.useState('270d');

  React.useEffect(() => {
    const fetchData = async () => {
      const barchart = await fetchtbloans(timeRange);
      const transformedData = barchart.map((loan) => ({
        amount: Number(loan.amount),
        interest: Number(loan.interest),
        firstpay: loan.date
      }));

      setTransformedData(transformedData);
    };
    fetchData();
  }, [timeRange]);

  //* Group and sum by month-year
  const groupedBars = transformedData.reduce((acc, curr) => {
    const date = new Date(curr.firstpay);
    const monthYearKey = date.toLocaleDateString('en-PH', {
      month: 'long',
      year: 'numeric'
    });
    //* Find if the month-year key already exists
    const totalamount = acc.find((item) => {
      const itemDate = new Date(item.firstpay);
      const itemMonthYear = itemDate.toLocaleDateString('en-PH', {
        month: 'long',
        year: 'numeric'
      });
      return itemMonthYear === monthYearKey;
    });

    //* If the month-year key already exists, sum the amounts
    if (totalamount) {
      totalamount.amount += curr.amount;
      totalamount.interest += curr.interest;
    } else {
      acc.push({
        ...curr,
        firstpay: new Date(date.getFullYear(), date.getMonth(), 1).toISOString()
      });
    }

    return acc;
  }, [] as BarData[]);

  //* Sort the grouped bars by date and limit to selected months
  const sortedBars = groupedBars
    .sort(
      (a, b) => new Date(a.firstpay).getTime() - new Date(b.firstpay).getTime()
    )
    .slice(-parseInt(timeRange) / 30); // Convert days to months and take only the last N months

  //* Calculate percentage difference from last month
  const getPercentageChange = () => {
    if (sortedBars.length < 3) return 0;

    const currentMonth = sortedBars[sortedBars.length - 2];
    const lastMonth = sortedBars[sortedBars.length - 3];

    const currentTotal = currentMonth.amount + currentMonth.interest;
    const previousTotal = lastMonth.amount + lastMonth.interest;

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

  return (
    <Card className="shadow-[rgba(0,0,0,0.2)_5px_5px_4px_0px]">
      <CardHeader className="flex items-center gap-2 space-y-0 border-b py-5 sm:flex-row">
        <div className="grid flex-1 gap-1 text-center sm:text-left">
          <CardTitle>Amount and Interest by Months</CardTitle>
          <CardDescription>Total Amount and Interest</CardDescription>
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
            data={sortedBars}
            margin={{
              left: -10
            }}
            accessibilityLayer
          >
            <CartesianGrid vertical={false} />

            <XAxis
              dataKey="firstpay"
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
            <Bar dataKey="amount" fill={chartConfig.amount.color} radius={3} />
            <Bar
              dataKey="interest"
              fill={chartConfig.interest.color}
              radius={3}
            />
          </BarChart>
        </ChartContainer>
      </CardContent>
      <CardFooter>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Badge
            variant="outline"
            className={
              Number(getPercentageChange()) < 0
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
