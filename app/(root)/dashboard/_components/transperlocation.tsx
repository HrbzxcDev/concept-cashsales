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
import { Badge } from '@/components/ui/badge';
import { TrendingUp, Loader2 } from 'lucide-react';

interface TransPerLocationData {
  count: number;
  location: string;
}

const chartConfig = {
  count: {
    label: 'Transaction Count',
    color: 'hsl(var(--chart-1))'
  }
};

export function TransPerLocation() {
  const [locationData, setLocationData] = React.useState<
    TransPerLocationData[]
  >([]);

  const getTotalTransactions = () => {
    return locationData.reduce((total, location) => total + location.count, 0);
  };

  React.useEffect(() => {
    async function getLocationData() {
      try {
        const { getTransactionCountPerLocation } = await import(
          '@/actions/getdata'
        );
        const result = await getTransactionCountPerLocation();
        setLocationData(result);
      } catch (error) {
        toast({
          title: 'Error',
          description: 'Error Fetching Transaction Count Per Location Data',
          variant: 'destructive'
        });
      }
    }

    getLocationData();

    return () => {};
  }, []);

  return (
    <Card className="h-full shadow-[5px_5px_5px_rgba(0,0,0,0.2)] ">
      <CardHeader className="flex flex-col space-y-0 border-b py-4 sm:flex-row">
        {/* <CardHeader className="flex items-center gap-2 space-y-0 border-b py-5 sm:flex-row"> */}

        <div className="grid flex-1 gap-1 text-center sm:text-left">
          <CardTitle className="text-lg">
            Transaction Count Per Location
          </CardTitle>
          <CardDescription>
            Total number of transactions by branch/location
          </CardDescription>
        </div>
      </CardHeader>
      <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
        {locationData && locationData.length > 0 ? (
          <ChartContainer
            config={chartConfig}
            className="aspect-auto h-[205px] w-full"
          >
            <BarChart
              data={locationData}
              margin={{
                left: -5
              }}
              accessibilityLayer
            >
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey="location"
                tickLine={false}
                tickMargin={5}
                axisLine={false}
                // angle={-45}
                // textAnchor="center"
                height={30}
                tickFormatter={(value) => {
                  return value.length > 10 ? value.substring(0, 20) : value;
                }}
              />
              {/* BarChart */}
              <YAxis
                tickLine={false}
                axisLine={false}
                tickMargin={10}
                tickFormatter={(value) => {
                  return value.toLocaleString();
                }}
              />
              <ChartTooltip
                content={
                  <ChartTooltipContent
                    labelFormatter={(value) => `Location: ${value}`}
                  />
                }
              />
              <ChartLegend content={<ChartLegendContent />} />
              <Bar
                dataKey="count"
                fill="var(--color-count)"
                radius={[4, 4, 0, 0]}
                barSize={50}
              />
            </BarChart>
          </ChartContainer>
        ) : (
          <div className="aspect-auto h-[205px] w-full flex items-center justify-center">
            <div className="flex flex-col items-center gap-3 text-gray-500 dark:text-gray-400">
              <Loader2 className="h-8 w-8 animate-spin" />
              <p className="text-sm font-medium">Loading Location Data...</p>
            </div>
          </div>
        )}
      </CardContent>
      <CardFooter>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Badge
            variant="outline"
            className="border-[#10b981]/0 bg-[#10b981]/10 text-[#10b981] hover:bg-[#10b981]/10"
          >
            <TrendingUp className="mr-1 h-4 w-4" />
            {getTotalTransactions()}
          </Badge>
          Total Transactions Across All Locations
        </div>
      </CardFooter>
    </Card>
  );
}
