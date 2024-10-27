'use client';

import { MetricCard } from './metric-card';
import { AnalyticsData } from '@/types/analytics';

interface MetricCardsProps {
    latestData: AnalyticsData;
}

export function MetricCards({ latestData }: MetricCardsProps) {
    return (
        <div className="grid gap-6 md:grid-cols-3">
            <MetricCard title="Total Value Locked (TVL)" value={`$${(latestData.tvl / 1000000).toFixed(2)}M`} change="+10%" />
            <MetricCard title="Daily Active Users (DAU)" value={latestData.dau.toLocaleString()} change="+5%" />
            <MetricCard title="Daily Transactions (TRX)" value={latestData.trx.toLocaleString()} change="+7%" />
        </div>
    );
}
