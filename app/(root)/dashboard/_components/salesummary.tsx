'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  TrendingUp,
  TrendingDown,
  Info
} from 'lucide-react';
import { Bar, BarChart, CartesianGrid, XAxis } from 'recharts';
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent
} from '@/components/ui/chart';
import { useState } from 'react';
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
    <div className="flex rounded-lg border bg-zinc-200 dark:bg-zinc-800 p-1">
      {options.map((option) => (
        <button
          key={option.value}
          onClick={() => onChange(option.value)}
          className={`relative flex-1 rounded-md px-2 py-1 text-xs font-medium transition-all duration-200 ${
            value === option.value
              ? 'bg-gray-700 text-white shadow-sm'
              : 'text-gray-600 dark:text-gray-400 hover:text-gray-500'
          }`}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}

export function SalesSummary({
  netSales,
  discount,
  netSalesChange,
  discountChange,
  monthlyData,
  weeklyData
}: {
  netSales?: number;
  discount?: number;
  netSalesChange?: number;
  discountChange?: number;
  monthlyData?: any[];
  weeklyData?: any[];
}) {  
  const [timeFilter, setTimeFilter] = useState('week');
  
  // Debug logging
  console.log('📊 SalesSummary - timeFilter:', timeFilter);
  console.log('📊 SalesSummary - monthlyData:', monthlyData);
  console.log('📊 SalesSummary - weeklyData:', weeklyData);
  
  // Use the appropriate data based on the filter
  const chartData = timeFilter === 'week' 
    ? (weeklyData && weeklyData?.length > 0 ? weeklyData : [])
    : (monthlyData && monthlyData?.length > 0 ? monthlyData : []);

  console.log('📊 SalesSummary - chartData:', chartData);

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
    { label: 'Month', value: 'month' },
    { label: 'Week', value: 'week' }
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
          <Card className="border-gray-300 dark:border-zinc-700 shadow-[5px_5px_5px_rgba(0,0,0,0.1)]">
            <CardContent className="relative p-4">
              <div className="absolute right-2 top-2">
                <Info className="h-4 w-4 text-gray-400" />
              </div>
              <div className="space-y-2">
                <h3 className="text-sm font-medium">Net Sales</h3>
                <p className="text-2xl font-bold">
                  ₱ {' '}
                  {netSales?.toLocaleString('en-PH', {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2
                  })}
                </p>
                <div className="flex items-center gap-1">
                  <TrendingUp className="h-4 w-4 text-green-500" />
                  <span className="text-sm text-green-500">
                    {netSalesChange}% (+{Math.abs(netSalesChange ?? 0 * 10)})
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Discount Card */}
          <Card className="border-gray-300 dark:border-zinc-700 shadow-[5px_5px_5px_rgba(0,0,0,0.1)]">
            <CardContent className="relative p-4">
              <div className="absolute right-2 top-2">
                <Info className="h-4 w-4 text-gray-400" />
              </div>
              <div className="space-y-2">
                <h3 className="text-sm font-medium">Discount</h3>
                <p className="text-2xl font-bold">
                  ₱ {' '}
                  {discount?.toLocaleString('en-PH', {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2
                  })}
                </p>
                <div className="flex items-center gap-1">
                  <TrendingDown className="h-4 w-4 text-red-500" />
                  <span className="text-sm text-red-500">
                      {discountChange}% (-{Math.abs(discountChange ?? 0 * 3)})
                  </span>
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
                  dataKey={timeFilter === 'week' ? 'week' : 'month'}
                  tickLine={false}
                  tickMargin={10}
                  axisLine={false}
                  tickFormatter={(value: string) => timeFilter === 'week' ? value : value.slice(0, 3)}
                />
                <ChartTooltip
                  cursor={false}
                  content={<ChartTooltipContent indicator="dashed" />}
                />
                <Bar dataKey="netSales" fill="hsl(var(--chart-1))" radius={4} />
                <Bar dataKey="discount" fill="hsl(var(--chart-2))" radius={4} />
              </BarChart>
            </ChartContainer>
          ) : (
            <div className="aspect-auto h-[260px] w-full flex items-center justify-center">
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
