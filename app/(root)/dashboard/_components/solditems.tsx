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
  CardContent
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
              axisLine={false}
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
              barSize={30}
            >
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
    </Card>
  );
}
