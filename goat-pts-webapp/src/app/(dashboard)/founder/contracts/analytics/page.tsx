'use client';

import { useState } from 'react';
import { CalendarIcon } from 'lucide-react';
import { BarChart, LineChart, Bar, Line, ResponsiveContainer, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { DatePickerWithRange } from '@/components/ui/date-picker-with-range';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const generateMockData = (days: number) => {
    const data = [];
    const now = new Date();
    for (let i = days; i > 0; i--) {
        const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
        data.push({
            date: date.toISOString().split('T')[0],
            tvl: Math.floor(1000000 + Math.random() * 1000000),
            dau: Math.floor(5000 + Math.random() * 3000),
            trx: Math.floor(50000 + Math.random() * 30000),
        });
    }
    return data;
};

const mockData = generateMockData(365);

export default function AnalyticsPage() {
    const [dateRange, setDateRange] = useState<{ from: Date; to?: Date }>({
        from: new Date(new Date().setDate(new Date().getDate() - 30)),
        to: new Date(),
    });
    const [activeTab, setActiveTab] = useState('tvl');
    
    const handleDateChange = (date: { from: Date; to?: Date } | undefined) => {
        if (date) {
            setDateRange(date);
        }
    };

    const filteredData = mockData.filter((item) => {
        const itemDate = new Date(item.date);
        return dateRange?.from && dateRange?.to && itemDate >= dateRange.from && itemDate <= dateRange.to;
    });

    const latestData = filteredData[filteredData.length - 1] || { tvl: 0, dau: 0, trx: 0 };

    return (
        <div className="container mx-auto p-6">
            <h1 className="text-3xl font-bold mb-6">Analytics Dashboard</h1>
            <div className="mb-6">
                <DatePickerWithRange date={dateRange} setDate={handleDateChange} />
            </div>
            <div className="grid gap-6 lg:grid-cols-4">
                <div className="space-y-6 lg:col-span-1">
                    <MetricCard title="Total Value Locked (TVL)" value={`$${(latestData.tvl / 1000000).toFixed(2)}M`} change="+10%" />
                    <MetricCard title="Daily Active Users (DAU)" value={latestData.dau.toLocaleString()} change="+5%" />
                    <MetricCard title="Daily Transactions (TRX)" value={latestData.trx.toLocaleString()} change="+7%" />
                </div>
                <Card className="lg:col-span-3">
                    <CardHeader>
                        <CardTitle>{getChartTitle(activeTab)}</CardTitle>
                        <CardDescription>{getChartDescription(activeTab)}</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-4">
                            <TabsList>
                                <TabsTrigger value="tvl">TVL</TabsTrigger>
                                <TabsTrigger value="dau">DAU</TabsTrigger>
                                <TabsTrigger value="trx">TRX</TabsTrigger>
                            </TabsList>
                        </Tabs>
                        <div className="h-[270px]">
                            <>
                                {activeTab === 'dau' ? (
                                    <BarChart data={filteredData}>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="date" />
                                        <YAxis />
                                        <Tooltip />
                                        <Bar dataKey="dau" fill="var(--color-dau)" />
                                    </BarChart>
                                ) : (
                                    <LineChart data={filteredData}>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="date" />
                                        <YAxis />
                                        <Tooltip />
                                        <Line type="monotone" dataKey={activeTab} stroke={`var(--color-${activeTab})`} strokeWidth={2} dot={false} />
                                    </LineChart>
                                )}
                            </>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}

function MetricCard({ title, value, change }: { title: string; value: string; change: string }) {
    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{title}</CardTitle>
                <CalendarIcon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">{value}</div>
                <p className={`text-xs ${change.startsWith('+') ? 'text-green-500' : 'text-red-500'}`}>{change}</p>
            </CardContent>
        </Card>
    );
}

function getChartTitle(tab: string) {
    switch (tab) {
        case 'tvl':
            return 'Total Value Locked (TVL)';
        case 'dau':
            return 'Daily Active Users (DAU)';
        case 'trx':
            return 'Daily Transactions (TRX)';
        default:
            return '';
    }
}

function getChartDescription(tab: string) {
    switch (tab) {
        case 'tvl':
            return 'Historical TVL data over time';
        case 'dau':
            return 'Historical DAU data over time';
        case 'trx':
            return 'Historical transaction data over time';
        default:
            return '';
    }
}
