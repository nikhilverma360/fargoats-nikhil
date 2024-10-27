'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { Bar } from 'recharts';
import { ChartProps } from '@/types/analytics';

export function DAUChart({ data }: { data: ChartProps['data'] }) {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Daily Active Users (DAU)</CardTitle>
                <CardDescription>Historical DAU data over time</CardDescription>
            </CardHeader>
            <CardContent>
                {/* <ChartContainer
          config={{
            dau: {
              label: "DAU",
              color: "hsl(var(--chart-2))",
            },
          }}
          className="h-[400px]"
        >
          <Bar
            data={data}
            dataKey="dau"
            fill="var(--color-dau)"
          />
          <ChartTooltip content={<ChartTooltipContent />} />
        </ChartContainer> */}
            </CardContent>
        </Card>
    );
}
