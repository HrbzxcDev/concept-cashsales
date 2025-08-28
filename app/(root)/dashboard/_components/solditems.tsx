import { TrendingUp } from 'lucide-react';
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

export const description = 'Top 5 items by quantity sold';

const chartConfig = {
  totalQuantity: {
    label: 'Quantity Sold',
    color: 'hsl(var(--chart-1))'
  },
  label: {
    color: 'hsl(var(--chart-1))'
  }
} satisfies ChartConfig;

interface TopSoldItemsProps {
  top5ItemsByQuantity: {
    stockcode: string;
    totalQuantity: number;
  }[];
}

export function TopSoldItems({ top5ItemsByQuantity }: TopSoldItemsProps) {
  // Transform data for the chart
  const chartData = top5ItemsByQuantity.map((item, index) => ({
    rank: `#${index + 1}`,
    stockcode: item.stockcode,
    totalQuantity: item.totalQuantity
  }));

  return (
    <Card className="p-2 shadow-[5px_5px_5px_rgba(0,0,0,0.2)]">
      <div className="p-2 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold">Top 5 Items by Quantity Sold</h2>
          <p className="text-sm text-muted-foreground">
            Visualize top sold items by quantity
          </p>
        </div>
      </div>
      <CardContent className="p-3">
        <ChartContainer config={chartConfig}>
          <BarChart
            accessibilityLayer
            data={chartData}
            layout="vertical"
            margin={{
              right: 30,
              left: 55
            }}
          >
            <CartesianGrid horizontal={false} />
            <YAxis
              dataKey="stockcode"
              type="category" 
              tickLine={false}
            //   tickMargin={1}
              axisLine={false}
            //   tickFormatter={(value) => value.slice(0, 25) + '...'}
              hide={false}
            />
            <XAxis dataKey="totalQuantity" type="number" hide />
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent indicator="line" />}
            />
            <Bar
              dataKey="totalQuantity"
              layout="vertical"
              fill="hsl(var(--chart-1))"
              radius={4}
            >
              {/* <LabelList
                dataKey="stockcode"
                position="insideLeft"
                offset={8}
                className="fill-foreground"
                fontSize={10}
                formatter={(value: string) => value.slice(0, 25) + '...'}
              /> */}
              <LabelList
                dataKey="totalQuantity"
                position="right"
                offset={8}
                className="fill-foreground"
                fontSize={10}
              />
            </Bar>
          </BarChart>
        </ChartContainer>
      </CardContent>
      {/* <CardFooter className="flex-col gap-2 text-sm">
        <div className="flex gap-2 font-medium leading-none">
          Top selling items by quantity <TrendingUp className="h-4 w-4" />
        </div>
        <div className="leading-none text-muted-foreground">
          Showing top 5 items with highest total quantity sold
        </div>
      </CardFooter> */}
    </Card>
  );
}
