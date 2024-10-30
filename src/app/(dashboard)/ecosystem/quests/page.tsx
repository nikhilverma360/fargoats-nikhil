'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ExternalLink, Search, TrendingUp, Users, DollarSign } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';

// Mock data for demonstration
const founders = [
    { id: 1, name: 'Alice', points: 1200 },
    { id: 2, name: 'Bob', points: 980 },
    { id: 3, name: 'Charlie', points: 1500 },
];

const bountyTypes = ['DAU Increase', 'TVL Growth', 'Transaction Volume'];

const bounties = [
    {
        id: 1,
        title: 'Boost DAU for DeFi Swap',
        type: 'DAU Increase',
        points: 500,
        description: 'Increase Daily Active Users (DAU) for our DeFi Swap platform by 500 within 30 days.',
        projectUrl: 'https://defi-swap.example.com',
        target: '500 new DAU',
        currentMetric: '1,000 DAU',
    },
    {
        id: 2,
        title: 'Grow TVL for Yield Farm',
        type: 'TVL Growth',
        points: 750,
        description: 'Increase Total Value Locked (TVL) in our Yield Farm by $200,000 within 14 days.',
        projectUrl: 'https://yield-farm.example.com',
        target: '$200,000 TVL increase',
        currentMetric: '$500,000 TVL',
    },
    {
        id: 3,
        title: 'Increase Transaction Volume for NFT Marketplace',
        type: 'Transaction Volume',
        points: 600,
        description: 'Boost daily transaction volume on our NFT Marketplace by 1,000 ETH within 21 days.',
        projectUrl: 'https://nft-market.example.com',
        target: '1,000 ETH volume increase',
        currentMetric: '500 ETH daily volume',
    },
    {
        id: 4,
        title: 'Expand User Base for Lending Protocol',
        type: 'DAU Increase',
        points: 550,
        description: 'Attract 300 new daily active users to our Lending Protocol within 25 days.',
        projectUrl: 'https://lending-protocol.example.com',
        target: '300 new DAU',
        currentMetric: '700 DAU',
    },
];

export default function QuestsPage() {
    const [selectedType, setSelectedType] = useState<string>('All');
    const [searchQuery, setSearchQuery] = useState<string>('');

    const filteredBounties = bounties.filter(
        (bounty) => (selectedType === 'All' || bounty.type === selectedType) && bounty.title.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="container mx-auto p-6">
            <h1 className="text-3xl font-bold mb-6">Growth Hack Quests</h1>
            <Tabs defaultValue="bounties" className="space-y-4">
                <TabsList>
                    <TabsTrigger value="bounties">Bounties</TabsTrigger>
                    <TabsTrigger value="leaderboard">Founder Leaderboard</TabsTrigger>
                </TabsList>
                <TabsContent value="bounties" className="space-y-4">
                    <div className="flex flex-col sm:flex-row gap-4">
                        <Select value={selectedType} onValueChange={setSelectedType}>
                            <SelectTrigger className="w-full sm:w-[180px]">
                                <SelectValue placeholder="Select bounty type" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="All">All Types</SelectItem>
                                {bountyTypes.map((type) => (
                                    <SelectItem key={type} value={type}>
                                        {type}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <div className="relative flex-grow">
                            <Search className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <Input placeholder="Search bounties..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-8" />
                        </div>
                    </div>
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                        {filteredBounties.map((bounty) => (
                            <Card key={bounty.id}>
                                <CardHeader>
                                    <CardTitle className="flex items-center justify-between">
                                        {bounty.title}
                                        <Badge variant="secondary">{bounty.type}</Badge>
                                    </CardTitle>
                                    <CardDescription>Points: {bounty.points}</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-sm text-muted-foreground mb-4">{bounty.description}</p>
                                    <div className="space-y-2">
                                        <div className="flex items-center">
                                            <TrendingUp className="mr-2 h-4 w-4 text-muted-foreground" />
                                            <span className="text-sm font-medium">Target: {bounty.target}</span>
                                        </div>
                                        <div className="flex items-center">
                                            <Users className="mr-2 h-4 w-4 text-muted-foreground" />
                                            <span className="text-sm">Current: {bounty.currentMetric}</span>
                                        </div>
                                    </div>
                                </CardContent>
                                <CardFooter>
                                    <Button asChild className="w-full">
                                        <Link href={bounty.projectUrl} target="_blank" rel="noopener noreferrer">
                                            View Project <ExternalLink className="ml-2 h-4 w-4" />
                                        </Link>
                                    </Button>
                                </CardFooter>
                            </Card>
                        ))}
                    </div>
                </TabsContent>
                <TabsContent value="leaderboard">
                    <Card>
                        <CardHeader>
                            <CardTitle>Founder Leaderboard</CardTitle>
                            <CardDescription>Top founders by points earned</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <ul className="space-y-2">
                                {founders
                                    .sort((a, b) => b.points - a.points)
                                    .map((founder, index) => (
                                        <li key={founder.id} className="flex items-center justify-between p-2 bg-muted rounded-md">
                                            <span className="font-semibold">
                                                {index + 1}. {founder.name}
                                            </span>
                                            <span className="flex items-center">
                                                <DollarSign className="mr-1 h-4 w-4 text-muted-foreground" />
                                                {founder.points} points
                                            </span>
                                        </li>
                                    ))}
                            </ul>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}
