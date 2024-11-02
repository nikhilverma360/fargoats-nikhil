import React, { useEffect, useState } from 'react';
import { pubSubService } from '@/services/pubsub.service';
import { ChartData } from '@/services/subservice';
import {
    Bar,
    BarChart,
    CartesianGrid,
    XAxis,
} from 'recharts';
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {
    ChartContainer,
    ChartLegend,
    ChartLegendContent,
    ChartTooltip,
    ChartTooltipContent,
} from "@/components/ui/chart";
import { TrendingUp } from 'lucide-react';

// Update chart configuration type
interface ChartStyleConfig {
    theme?: string;
    color?: string;
}

interface ChartConfig {
    [key: string]: ChartStyleConfig;
}

const defaultChartConfig: ChartConfig = {
    tvl: {
        color: 'var(--color-primary)',
        theme: 'default'
    }
};

const RealTimeChart: React.FC = () => {
    const [chartData, setChartData] = useState<ChartData[]>([]);

    useEffect(() => {
        const subscription = pubSubService.subscribeToChartData((data) => {
            setChartData(prevData => {
                const newData = [...prevData, data].slice(-30);
                return newData;
            });
        });

        return () => subscription.unsubscribe();
    }, []);

    return (
        <Card>
            <CardHeader>
                <CardTitle>Real-Time Analytics</CardTitle>
                <CardDescription>Live data updates every 5 seconds</CardDescription>
            </CardHeader>
            <CardContent>
                <ChartContainer config={{
                    tvl: {
                        color: 'var(--color-primary)'
                    }
                }}>
                    <BarChart data={chartData} width={800} height={400} margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                        <CartesianGrid vertical={false} />
                        <XAxis
                            dataKey="timestamp"
                            tickLine={false}
                            tickMargin={10}
                            axisLine={false}
                            tickFormatter={(value) => new Date(value * 1000).toLocaleString()}
                        />
                        <ChartTooltip content={<ChartTooltipContent />} />
                        <Bar
                            dataKey="tvl"
                            fill={defaultChartConfig.tvl.color}
                            radius={[4, 4, 0, 0]}
                        />
                    </BarChart>
                </ChartContainer>
            </CardContent>
        </Card>
    );
};

export default RealTimeChart;