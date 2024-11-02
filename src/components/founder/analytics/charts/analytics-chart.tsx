import React, { useEffect } from 'react';
import pubSubService from '@/services/pubsub.service';
import { AnalyticsData } from '@/types/analytics';
import { TVLChart } from './tvl-chart';
import { DAUChart } from './dau-chart'; 
import { TRXChart } from './trx-chart';

interface AnalyticsChartsProps {
    data: AnalyticsData[];
}

export function AnalyticsCharts({ data }: AnalyticsChartsProps) {
    useEffect(() => {
        const subscription = pubSubService.subscribe('analyticsDataUpdate', (newData) => {
            // Handle the updated data here
            console.log('Received updated analytics data:', newData);
        });

        // Publish initial data
        pubSubService.publish('analyticsDataUpdate', data);

        // Cleanup subscription on unmount
        return () => {
            subscription.unsubscribe();
        };
    }, [data]);

    return (
        <div>
            <TVLChart />
            <DAUChart />
            <TRXChart />
        </div>
    );
} 