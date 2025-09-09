'use client';

import * as React from 'react';
import { Line, LineChart, ResponsiveContainer } from 'recharts';

type SparklinePoint = {
  date: string;
  value: number;
};

export type SparklineProps = {
  data: SparklinePoint[];
  color?: string;
  strokeWidth?: number;
  className?: string;
  height?: number;
  animate?: boolean;
  animationDuration?: number;
};

export function Sparkline({
  data,
  color = 'hsl(var(--chart-1))',
  strokeWidth = 2,
  className,
  height = 48,
  animate = true,
  animationDuration = 5000
}: SparklineProps) {
  return (
    <div className={className} style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={data}
          margin={{ top: 6, bottom: 0, left: 0, right: 0 }}
        >
          <Line
            type="monotone"
            dataKey="value"
            stroke={color}
            strokeWidth={strokeWidth}
            dot={false}
            isAnimationActive={animate}
            animationBegin={0}
            animationDuration={animationDuration}
            animationEasing="ease-out"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

export type { SparklinePoint };
