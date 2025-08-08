'use client';

import { TrendingUp, TrendingDown, CalendarDays } from 'lucide-react';
import { Label, PolarRadiusAxis, RadialBar, RadialBarChart } from 'recharts';

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
import { getLoanCountsByYear } from '@/actions/overview-actions';
import * as React from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';

const getLoanCountData = async (year: string) => {
  const loanCounts = await getLoanCountsByYear(year);
  // Return all data for the year
  return loanCounts.map((count) => ({ count: count.count }));
};

const chartConfig = {
  count: {
    label: 'Loans'
  }
} satisfies ChartConfig;

export function TotalLoans() {
  const [timeRange, setTimeRange] = React.useState('2025');
  const [chartData, setChartData] = React.useState<
    Array<{ count: number; fill?: string }>
  >([]);
  const [previousYearData, setPreviousYearData] = React.useState<number>(0);

  const totalLoans = React.useMemo(() => {
    return chartData.reduce((acc, curr) => acc + curr.count, 0);
  }, [chartData]);

  const getPercentageChange = () => {
    if (previousYearData === 0) return 0;

    // Calculate percentage change between total loans of current year and previous year
    return ((totalLoans - previousYearData) / previousYearData) * 100;
  };

  const getPercentageDisplay = () => {
    const percentage = getPercentageChange();
    if (percentage === 0) {
      return <span className="text-white">0.00</span>;
    }
    return percentage > 0 ? (
      <span className="text-green-500">+{Math.abs(percentage).toFixed(2)}%</span>
    ) : (
      <span className="text-red-500">-{Math.abs(percentage).toFixed(2)}%</span>
    );
  };

  const fetchData = React.useCallback(async () => {
    try {
      // Fetch both current and previous year data in parallel
      const [currentData, previousData] = await Promise.all([
        getLoanCountData(timeRange),
        getLoanCountData((parseInt(timeRange) - 1).toString())
      ]);

      // Update both states at once
      setChartData(
        currentData.map((item) => ({
          ...item,
          fill: `hsl(var(--chart-${Math.floor(Math.random() * 12)}))`
        }))
      );

      const previousTotal = previousData.reduce(
        (acc, curr) => acc + curr.count,
        0
      );
      setPreviousYearData(previousTotal);
    } catch (error) {
      console.error('Error fetching loan data:', error);
      // Handle error appropriately
    }
  }, [timeRange]);

  React.useEffect(() => {
    fetchData();
  }, [fetchData]);

  return (
    <Card className="flex flex-col shadow-[rgba(0,0,0,0.2)_5px_5px_4px_0px]">
      <CardHeader className="flex items-center gap-2 space-y-0 border-b py-5 sm:flex-row">
        <div className="grid flex-1 gap-1 text-center sm:text-left">
          <CardTitle>Total Loans</CardTitle>
          <CardDescription className="flex items-center justify-between gap-4">
            <span>
              {timeRange === 'All Years'
                ? 'January - December (All Years)'
                : `January - December ${timeRange}`}
            </span>
          </CardDescription>
        </div>
        <Select value={timeRange} onValueChange={setTimeRange}>
          <SelectTrigger
            className="w-[160px] rounded-sm"
            aria-label="Select year"
          >
            <SelectValue placeholder="2024" />
          </SelectTrigger>
          <SelectContent className="rounded-sm">
            <SelectItem value="All Years" className="mb-1">
              <div className="flex items-center gap-2">
                <CalendarDays className="h-4 w-4 text-muted-foreground" />
                <span>All Years</span>
              </div>
            </SelectItem>
            <SelectItem value="2025" className="mb-1">
              <div className="flex items-center gap-2">
                <CalendarDays className="h-4 w-4 text-muted-foreground" />
                <span>2025</span>
              </div>
            </SelectItem>
            <SelectItem value="2024" className="mb-1">
              <div className="flex items-center gap-2">
                <CalendarDays className="h-4 w-4 text-muted-foreground" />
                <span>2024</span>
              </div>
            </SelectItem>
          </SelectContent>
        </Select>
      </CardHeader>
      <CardContent className="flex flex-1 items-center pb-0">
        <ChartContainer
          config={chartConfig}
          className="mx-auto aspect-square w-full max-w-[360px]"
        >
          <RadialBarChart
            data={chartData}
            endAngle={180}
            innerRadius={80}
            outerRadius={130}
          >
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent hideLabel />}
            />
            {/* <PolarGrid
              gridType="circle"
              radialLines={false}
              stroke="none"
              className="first:fill-muted last:fill-background"
              polarRadius={[86, 74]}
            /> */}

            <PolarRadiusAxis tick={false} tickLine={false} axisLine={false}>
              <Label
                content={({ viewBox }) => {
                  if (viewBox && 'cx' in viewBox && 'cy' in viewBox) {
                    return (
                      <text
                        x={viewBox.cx}
                        y={viewBox.cy}
                        textAnchor="middle"
                        dominantBaseline="middle"
                      >
                        <tspan
                          x={viewBox.cx}
                          y={(viewBox.cy || 0) - 16}
                          className="fill-foreground text-2xl font-bold"
                        >
                          {totalLoans.toLocaleString()}
                        </tspan>
                        <tspan
                          x={viewBox.cx}
                          y={(viewBox.cy || 0) + 4}
                          className="fill-muted-foreground"
                        >
                          Loans
                        </tspan>
                      </text>
                    );
                  }
                }}
              />
            </PolarRadiusAxis>
            <RadialBar
              dataKey="count"
              stackId="a"
              cornerRadius={5}
              fill="var(--chart-1)"
              className="stroke-10 stroke-transparent"
            />
            <RadialBar
              dataKey="count"
              fill="var(--chart-3)"
              stackId="b"
              cornerRadius={5}
              className="stroke-transparent stroke-2"
            />
          </RadialBarChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className="flex-col gap-2 text-sm">
        <div className="flex items-center gap-2 font-medium leading-none">
          Trending {getPercentageDisplay()}  from last year{' '}
          {getPercentageChange() === 0 ? (
            <TrendingUp className="h-4 w-4 text-white" />
          ) : getPercentageChange() > 0 ? (
            <TrendingUp className="h-4 w-4 text-green-500" />
          ) : (
            <TrendingDown className="h-4 w-4 text-red-500" />
          )}
        </div>
        <div className="leading-none text-muted-foreground">
          Total counts of loans for every year!
        </div>
      </CardFooter>
    </Card>
  );
}
