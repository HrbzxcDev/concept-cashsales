'use client';

import { CalendarDays, TrendingUp } from 'lucide-react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  LabelList,
  XAxis,
  YAxis
} from 'recharts';
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
import { useEffect, useState } from 'react';
import { getTopBorrowers } from '@/actions/toploaner-actions';
import {
  Select,
  SelectValue,
  SelectItem,
  SelectContent,
  SelectTrigger
} from '@/components/ui/select';

interface Borrower {
  alias: string;
  totalLoans: number;
  totalAmount: number;
  totalBalance: number;
}

const chartConfig = {
  totalAmount: {
    label: 'Total Amount',
    color: 'hsl(var(--chart-2))'
  },
  label: {
    color: 'hsl(var(--card-foreground)'
  }
} satisfies ChartConfig;

export function TopLoaner() {
  const [topBorrowers, setTopBorrowers] = useState<Borrower[]>([]);
  const [timeRange, setTimeRange] = useState('2025');

  useEffect(() => {
    const fetchData = async () => {
      const data = await getTopBorrowers(timeRange);
      setTopBorrowers(data);
    };
    fetchData();
  }, [timeRange]);

  return (
    <Card className="shadow-[rgba(0,0,0,0.2)_5px_5px_4px_0px] ">
      <CardHeader className="flex items-center gap-2 space-y-0 border-b py-5 sm:flex-row">
        <div className="grid flex-1 gap-1 text-center sm:text-left">
          <CardTitle>Top Borrowers</CardTitle>
          <CardDescription>Top Borrowers Summary</CardDescription>
        </div>
        <Select value={timeRange} onValueChange={setTimeRange}>
          <SelectTrigger
            className="w-[160px] rounded-sm"
            aria-label="Select Year"
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
      <CardContent>
        <ChartContainer config={chartConfig} className="space-y-2">
          <BarChart
            accessibilityLayer
            data={topBorrowers}
            layout="vertical"
            margin={{ right: 20 }}
          >
            <CartesianGrid horizontal={false} />
            <YAxis
              dataKey="alias"
              type="category"
              spacing={1}
              tickLine={false}
              tickMargin={1}
              tickFormatter={(value) => value.slice(0, 8)}
              axisLine={false}
            />
            <XAxis
              dataKey="totalAmount"
              type="number"
              domain={[
                0,
                (dataMax: number) => {
                  return Math.ceil(dataMax / 5000) * 10000 + 40000; // Round to nearest thousand
                }
              ]}
              tickFormatter={(value: number) =>
                `₱${value.toLocaleString('en-PH')}`
              }
            />
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent indicator="line" />}
            />
            <Bar
              dataKey="totalAmount"
              layout="vertical"
              radius={5}
              slope={2}
              spacing={100}
              barSize={35}
              fill={chartConfig.totalAmount.color}
            >
              <LabelList
                dataKey="totalAmount"
                position="insideLeft"
                offset={8}
                className="fill-[--foreground]"
                fontSize={10}
                formatter={(value: number) =>
                  `₱${Math.round(value).toLocaleString('en-PH', {
                    style: 'decimal',
                    minimumFractionDigits: 0,
                    maximumFractionDigits: 0,
                    useGrouping: true
                  })}`
                }
              />
              <LabelList
                dataKey="totalLoans"
                position="right"
                offset={10}
                fontSize={10}
                formatter={(value: number) => `${value} loans`}
              />
            </Bar>
          </BarChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className="flex-col items-start gap-2 text-sm">
        <div className="flex gap-2 font-medium leading-none">
          Total Loans:{' '}
          {(() => {
            const total = topBorrowers.reduce((acc, borrower) => {
              const loans = parseInt(borrower.totalLoans.toString(), 10) || 0;
              return acc + loans;
            }, 0);
            return total.toLocaleString();
          })()}
          <TrendingUp className="h-4 w-4" />
        </div>
        <div className="leading-none text-muted-foreground">
          Showing top borrowers by total Loan Amount
        </div>
      </CardFooter>
    </Card>
  );
}
