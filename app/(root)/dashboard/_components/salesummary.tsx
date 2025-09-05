'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, Info } from 'lucide-react';
import { Bar, BarChart, CartesianGrid, XAxis } from 'recharts';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent
} from '@/components/ui/chart';
import { useState, useMemo } from 'react';
import { Loader2 } from 'lucide-react';

// Segmented Control Component
function SegmentedControl({
  options,
  value,
  onChange
}: {
  options: { label: string; value: string }[];
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div className="flex rounded-lg border bg-zinc-200 p-1 dark:bg-zinc-800">
      {options.map((option) => (
        <button
          key={option.value}
          onClick={() => onChange(option.value)}
          className={`relative flex-1 rounded-md px-2 py-1 text-xs font-medium transition-all duration-200 ${
            value === option.value
              ? 'bg-gray-700 text-white shadow-sm'
              : 'text-gray-600 hover:text-gray-500 dark:text-gray-400'
          }`}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}

// Percentage calculation functions
export function calculatePercentageData(
  chartData: any[],
  totalNetSales: number
) {
  if (
    !chartData ||
    chartData.length === 0 ||
    !totalNetSales ||
    totalNetSales === 0
  ) {
    return [];
  }

  return chartData.map((item) => ({
    ...item,
    netSalesPercentage: ((item.netSales || 0) / totalNetSales) * 100,
    discountPercentage: ((item.discount || 0) / totalNetSales) * 100
  }));
}

export function calculatePeriodStats(percentageData: any[]) {
  if (!percentageData || percentageData.length === 0) {
    return { totalNetSalesPercentage: 0, totalDiscountPercentage: 0 };
  }

  const totalNetSalesPercentage = percentageData.reduce(
    (sum, item) => sum + (item.netSalesPercentage || 0),
    0
  );
  const totalDiscountPercentage = percentageData.reduce(
    (sum, item) => sum + (item.discountPercentage || 0),
    0
  );

  return { totalNetSalesPercentage, totalDiscountPercentage };
}

// New function to calculate percentage change between periods
export function calculatePercentageChange(chartData: any[]) {
  if (!chartData || chartData.length < 2) {
    return { netSalesChange: 0, discountChange: 0 };
  }

  // Get the last two periods for comparison
  const currentPeriod = chartData[chartData.length - 1];
  const previousPeriod = chartData[chartData.length - 2];

  const currentNetSales = currentPeriod.netSales || 0;
  const previousNetSales = previousPeriod.netSales || 0;
  const currentDiscount = currentPeriod.discount || 0;
  const previousDiscount = previousPeriod.discount || 0;

  // Calculate percentage change
  const netSalesChange =
    previousNetSales > 0
      ? ((currentNetSales - previousNetSales) / previousNetSales) * 100
      : 0;

  const discountChange =
    previousDiscount > 0
      ? ((currentDiscount - previousDiscount) / previousDiscount) * 100
      : 0;

  return { netSalesChange, discountChange };
}

// Percentage Badge Component
function PercentageBadge({
  percentage,
  className = ''
}: {
  percentage: number;
  className?: string;
}) {
  const isPositive = percentage >= 0;
  const icon = isPositive ? (
    <TrendingUp className="mr-1 h-4 w-4" />
  ) : (
    <TrendingDown className="mr-1 h-4 w-4" />
  );

  return (
    <Badge
      variant="outline"
      className={`${
        isPositive
          ? 'border-[#10b981]/0 bg-[#10b981]/10 text-[#10b981] hover:bg-[#10b981]/10'
          : 'border-[#ef4444]/0 bg-[#ef4444]/10 text-[#ef4444] hover:bg-[#ef4444]/10'
      } ${className}`}
    >
      {icon}
      {percentage.toFixed(1)}%
    </Badge>
  );
}

export function SalesSummary({
  netSales,
  discount,
  monthlyData,
  weeklyData,
  dailyData 
}: {
  netSales?: number;
  discount?: number;
  dailyData?: any[];
  weeklyData?: any[];
  monthlyData?: any[];

}) {
  const [timeFilter, setTimeFilter] = useState('daily');

  // Debug logging
  // console.log('📊 SalesSummary - timeFilter:', timeFilter);
  // console.log('📊 SalesSummary - dailyData:', dailyData);
  // console.log('📊 SalesSummary - weeklyData:', weeklyData);
  // console.log('📊 SalesSummary - monthlyData:', monthlyData);

  // Use the appropriate data based on the filter
  const chartData = useMemo(() => {
    if (timeFilter === 'daily') {
      return dailyData && dailyData.length > 0 ? dailyData : [];
    } else if (timeFilter === 'week') {
      return weeklyData && weeklyData.length > 0 ? weeklyData : [];
    } else if (timeFilter === 'month') {
      return monthlyData && monthlyData.length > 0 ? monthlyData : [];
    }
    return [];
  }, [timeFilter, dailyData, weeklyData, monthlyData]);

  // console.log('📊 SalesSummary - chartData:', chartData);

  // Calculate percentages based on current filter and total net sales
  // const percentageData = useMemo(() => {
  //   return calculatePercentageData(chartData, netSales || 0);
  // }, [chartData, netSales]);

  // Calculate total percentages for current period
  // const currentPeriodStats = useMemo(() => {
  //   return calculatePeriodStats(percentageData);
  // }, [percentageData]);

  // Calculate percentage change from previous period
  const percentageChange = useMemo(() => {
    return calculatePercentageChange(chartData);
  }, [chartData]);

  const chartConfig = {
    netSales: {
      label: 'Net Sales',
      color: 'hsl(var(--chart-1))'
    },
    discount: {
      label: 'Discount',
      color: 'hsl(var(--chart-2))'
    }
  };

  const filterOptions = [
    { label: 'Daily', value: 'daily' },
    { label: 'Weekly', value: 'week' },
    { label: 'Monthly', value: 'month' },
  
  ];

  return (
    <Card className="p-6 shadow-[5px_5px_5px_rgba(0,0,0,0.2)]">
      {/* Header Section */}
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold">Sales</h2>
          <p className="text-sm text-muted-foreground">
            Visualize sales performance trends
          </p>
        </div>
        <SegmentedControl
          options={filterOptions}
          value={timeFilter}
          onChange={setTimeFilter}
        />
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-4">
        {/* Left Panel - Summary Cards */}
        <div className="space-y-4 lg:col-span-1">
          {/* Net Sales Card */}
          <Card className="border-gray-300 shadow-[5px_5px_5px_rgba(0,0,0,0.1)] dark:border-zinc-800">
            <CardContent className="relative p-4">
              <div className="space-y-2">
                <h3 className="text-sm font-medium">Total Net Sales</h3>
                <p className="text-2xl font-bold">
                  ₱{' '}
                  {netSales?.toLocaleString('en-PH', {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2
                  })}
                </p>
                <div className="flex items-center gap-1">
                  <PercentageBadge
                    percentage={percentageChange.netSalesChange}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Discounts Card */}
          <Card className="border-gray-300 shadow-[5px_5px_5px_rgba(0,0,0,0.1)] dark:border-zinc-800">
            <CardContent className="relative p-4">
              <div className="space-y-2">
                <h3 className="text-sm font-medium">Total Discounts</h3>
                <p className="text-2xl font-bold">
                  ₱{' '}
                  {discount?.toLocaleString('en-PH', {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2
                  })}
                </p>
                <div className="flex items-center gap-1">
                  <PercentageBadge
                    percentage={percentageChange.discountChange}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Panel - Bar Chart */}
        <div className="lg:col-span-3">
          {chartData && chartData.length > 0 ? (
            <ChartContainer
              config={chartConfig}
              className="aspect-auto h-[260px] w-full"
            >
              <BarChart accessibilityLayer data={chartData}>
                <CartesianGrid vertical={false} />
                <XAxis
                  dataKey={timeFilter === 'daily' ? 'date' : timeFilter === 'week' ? 'week' : 'month'}
                  tickLine={false}
                  tickMargin={10}
                  axisLine={false}
                  tickFormatter={(value: string) =>
                    timeFilter === 'daily' ? value : timeFilter === 'week' ? value : value.slice(0, 3)
                  }
                />
                <ChartTooltip
                  cursor={false}
                  content={<ChartTooltipContent indicator="dashed" />}
                />
                <Bar dataKey="netSales" fill="hsl(var(--chart-1))" radius={4} barSize={50}/>
                <Bar dataKey="discount" fill="hsl(var(--chart-2))" radius={4} barSize={50}/>
              </BarChart>
            </ChartContainer>
          ) : (
            <div className="flex aspect-auto h-[260px] w-full items-center justify-center">
              <div className="flex flex-col items-center gap-3 text-gray-500 dark:text-gray-400">
                <Loader2 className="h-8 w-8 animate-spin" />
                <p className="text-sm font-medium">Loading Chart Data...</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}
