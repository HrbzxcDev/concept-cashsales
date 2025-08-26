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

// interface SalesSummaryProps {
//   netSales?: number;
//   discount?: number; // This is actually discount amount
//   netSalesChange?: number;
//   discountChange?: number;
//   monthlyData?: any[];
// }

export function SalesSummary({
  netSales,
  discount,
  netSalesChange,
  discountChange,
  monthlyData
}: {
  netSales?: number;
  discount?: number;
  netSalesChange?: number;
  discountChange?: number;
  monthlyData?: any[];
}) {  
  const chartData =
    monthlyData && monthlyData?.length > 0
      ? monthlyData
      : [
          { month: 'January', netSales: 180, discount: 20 },
          { month: 'February', netSales: 300, discount: 35 },
          { month: 'March', netSales: 240, discount: 28 },
          { month: 'April', netSales: 80, discount: 10 },
          { month: 'May', netSales: 220, discount: 25 },
          { month: 'June', netSales: 220, discount: 22 }
        ];

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

  return (
    <Card className="p-6 shadow-[5px_5px_5px_rgba(0,0,0,0.2)]">
      {/* Header Section */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Sales</h2>
          <p className="text-sm text-gray-400">
            Visualize sales performance trends
          </p>
        </div>
        <div className="flex gap-2">
          <button className="rounded-full bg-gray-700 px-4 py-2 text-sm text-white hover:bg-gray-600">
            Month
          </button>
          <button className="rounded-full bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700">
            Week
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Left Panel - Summary Cards */}
        <div className="space-y-4 lg:col-span-1">
          {/* Net Sales Card */}
          <Card className="border-zinc-800 bg-zinc-800">
            <CardContent className="relative p-4">
              <div className="absolute right-2 top-2">
                <Info className="h-4 w-4 text-gray-400" />
              </div>
              <div className="space-y-2">
                <h3 className="text-sm font-medium text-gray-300">Net Sales</h3>
                <p className="text-2xl font-bold text-white">
                  ₱
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
          <Card className="border-zinc-800 bg-zinc-800">
            <CardContent className="relative p-4">
              <div className="absolute right-2 top-2">
                <Info className="h-4 w-4 text-gray-400" />
              </div>
              <div className="space-y-2">
                <h3 className="text-sm font-medium text-gray-300">Discount</h3>
                <p className="text-2xl font-bold text-white">
                  ₱
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
        <div className="lg:col-span-2">
          <ChartContainer
            config={chartConfig}
            className="aspect-auto h-[280px] w-full"
          >
            <BarChart accessibilityLayer data={chartData}>
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey="month"
                tickLine={false}
                tickMargin={10}
                axisLine={false}
                tickFormatter={(value: string) => value.slice(0, 3)}
              />
              <ChartTooltip
                cursor={false}
                content={<ChartTooltipContent indicator="dashed" />}
              />
              <Bar dataKey="netSales" fill="hsl(var(--chart-1))" radius={4} />
              <Bar dataKey="discount" fill="hsl(var(--chart-2))" radius={4} />
            </BarChart>
          </ChartContainer>
        </div>
      </div>
    </Card>
  );
}
