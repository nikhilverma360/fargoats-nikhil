import React, { useEffect } from 'react';
import { pubSubService, PubSubService } from '@/services/pubsub.service';
import { AnalyticsData } from '@/types/analytics';
import { TVLChart } from './tvl-chart';
import { DAUChart } from './dau-chart'; 
import { TRXChart } from './trx-chart';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface AnalyticsChartsProps {
    data: AnalyticsData[];
}

export function AnalyticsCharts({ data }: AnalyticsChartsProps) {
    useEffect(() => {
        // Generate random analytics data
        const generateRandomAnalytics = () => ({
            timestamp: new Date().toISOString(),
            tvl: Math.floor(Math.random() * 1000000), // Random TVL between 0-1M
            dau: Math.floor(Math.random() * 10000),   // Random DAU between 0-10k
            transactions: Math.floor(Math.random() * 5000), // Random TRX between 0-5k
        });

        // Subscribe to updates
        const subscription = pubSubService.subscribe('analyticsDataUpdate', (newData: any) => {
            console.log('Received updated analytics data:', newData);
        });

        // Start random data generation every 5 seconds
        PubSubService.startRandomData('analyticsDataUpdate', {
            interval: 5000,
            dataType: 'number',
            generator: generateRandomAnalytics
        });

        // Cleanup: stop data generation and unsubscribe
        return () => {
            PubSubService.stopRandomData('analyticsDataUpdate');
            subscription.unsubscribe();
        };
    }, []);

    return (
        <div className="space-y-4">
            <Tabs defaultValue="tvl" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="tvl">TVL</TabsTrigger>
                    <TabsTrigger value="dau">DAU</TabsTrigger>
                    <TabsTrigger value="trx">TRX</TabsTrigger>
                </TabsList>
                <TabsContent value="tvl" className="space-y-4">
                    <TVLChart     />
                </TabsContent>
                <TabsContent value="dau" className="space-y-4">
                    <DAUChart data={data}  />
                </TabsContent>
                <TabsContent value="trx" className="space-y-4 w-full">
                    <TRXChart data={data}    />
                </TabsContent>
            </Tabs>
        </div>
    );
} 