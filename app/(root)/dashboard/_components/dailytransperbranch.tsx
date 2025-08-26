'use client';

import { useEffect, useState } from 'react';
import { getDailyTransactionPerLocation } from '@/actions/getdata';
import { MapPinHouse } from 'lucide-react';
import {
  Area,
  CartesianGrid,
  AreaChart,
  XAxis,
  YAxis,
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

interface TransactionData {
  date: string;
  location: string;
  count: number;
}

interface ChartDataItem {
  date: string;
  [key: string]: string | number;
}

export function ChartLineMultiple() {
  const [chartData, setChartData] = useState<ChartDataItem[]>([]);
  const [locations, setLocations] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const data: TransactionData[] = await getDailyTransactionPerLocation();

        if (data.length > 0) {
          // Get unique locations
          const uniqueLocations = [
            ...new Set(data.map((item) => item.location))
          ];
          setLocations(uniqueLocations);

          // Group data by date and transform for chart
          const groupedByDate = data.reduce(
            (acc, item) => {
              const date = item.date;
              if (!acc[date]) {
                acc[date] = { date };
                // Initialize all locations with 0
                uniqueLocations.forEach((loc) => {
                  acc[date][loc] = 0;
                });
              }
              acc[date][item.location] = item.count;
              return acc;
            },
            {} as Record<string, ChartDataItem>
          );

          // Convert to array and sort by date
          const chartDataArray = Object.values(groupedByDate).sort(
            (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
          );

          setChartData(chartDataArray);
        }
      } catch (error) {
        console.error('Error fetching transaction data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const chartConfig: ChartConfig = locations.reduce((config, location) => {
    config[location] = {
      label: location,
      color: `hsl(${Math.random() * 360}, 70%, 50%)`
    };
    return config;
  }, {} as ChartConfig);

  if (isLoading) {
    return (
      <Card className="p-1 shadow-[5px_5px_5px_rgba(0,0,0,0.2)]">
        <CardHeader>
          <CardTitle className="text-lg">
            Daily Transactions Per Location
          </CardTitle>
          <CardDescription>Loading Transaction Data...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex h-[249px] items-center justify-center">
            <div className="text-muted-foreground">Fetching Data.....</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (chartData.length === 0) {
    return (
      <Card className="p-1 shadow-[5px_5px_5px_rgba(0,0,0,0.2)]">
        <CardHeader>
          <CardTitle className="text-lg">
            Daily Transactions Per Location
          </CardTitle>
          <CardDescription>No Transaction Data Available</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex h-[249px] justify-center marker:items-center">
            <div className="text-muted-foreground">No Data To Display</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="p-1 shadow-[5px_5px_5px_rgba(0,0,0,0.2)]">
      <CardHeader className="flex flex-col space-y-0 border-b py-4">
        {/* <CardHeader className="flex flex-col space-y-2 border-b py-4"> */}
        <CardTitle className="text-lg">
          Daily Transactions Per Location
        </CardTitle>
        <CardDescription className="text-sm">
          {chartData.length > 0 &&
            `Last ${chartData.length} Days Of Transaction Data`}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer
          config={chartConfig}
          className="aspect-auto h-[200px] w-full pt-7"
        >
          <AreaChart
            accessibilityLayer
            data={chartData}
            margin={{
              left: 1,
              right: 1,
              top: 1
            }}
          >
            <CartesianGrid vertical={false} strokeDasharray="3 3" />
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tickMargin={15}
              tickFormatter={(value) =>
                new Date(value).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric'
                })
              }
            />
            {/* <YAxis
              tickLine={false}
              axisLine={false}
              tickMargin={20}
              tickFormatter={(value) => value.toLocaleString()}
            /> */}
            <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
              <defs>
               {locations.map((location) => (
                 <linearGradient key={location} id={`gradient-${location}`} x1="0" y1="0" x2="0" y2="1">
                   <stop
                     offset="5%"
                     stopColor={chartConfig[location]?.color}
                     stopOpacity={0.8}
                   />
                   <stop
                     offset="95%"
                     stopColor={chartConfig[location]?.color}
                     stopOpacity={0.1}
                   />
                 </linearGradient>
               ))}
              </defs>
                {locations.map((location) => (
                  <Area
                    key={location}
                    dataKey={location}
                    type="monotone"
                    // fill={`url(#gradient-${location})`}
                    fill={chartConfig[location]?.color}
                    fillOpacity={0.1}
                    stroke={chartConfig[location]?.color}
                    strokeWidth={2}
                    dot={false}
                  />
              ))}
          </AreaChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className="pt-1">
        <div className="flex w-full items-start gap-3 text-sm">
          <div className="grid gap-2">
            <div className="flex items-center gap-2 text-base font-medium leading-none">
              {locations.length} Locations Tracked{' '}
              <MapPinHouse className="h-5 w-5" />
            </div>
            <div className="flex items-center gap-2 leading-none text-muted-foreground">
              Showing daily transaction counts for {locations.length} locations
            </div>
          </div>
        </div>
      </CardFooter>
    </Card>
  );
}
