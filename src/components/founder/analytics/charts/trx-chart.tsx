'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartConfig } from '@/components/ui/chart';
import { Line } from 'recharts';
import { ChartProps } from '@/types/analytics';

const trxChartConfig = {
    trx: {
        label: 'TRX',
        color: 'hsl(var(--chart-3))',
    },
} satisfies ChartConfig;

export function TRXChart({ data }: { data: ChartProps['data'] }) {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Daily Transactions (TRX)</CardTitle>
                <CardDescription>Historical transaction data over time</CardDescription>
            </CardHeader>
            <CardContent>
                {/* <ChartContainer config={trxChartConfig} className="h-[400px]">
                    <Line data={data} dataKey="trx" stroke="var(--color-trx)" strokeWidth={2} dot={false} />
                    <ChartTooltip content={<ChartTooltipContent />} />
                </ChartContainer> */}
            </CardContent>
        </Card>
    );
}
