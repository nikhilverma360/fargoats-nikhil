'use client';

import { useState } from 'react';
import Image from 'next/image';
import { ExternalLink, Search, TrendingUp, Users, Award, Info, Clock, DollarSign, Repeat, BarChart3 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';

// Updated mock data for demonstration

const bounties = [
    {
        id: 1,
        title: 'Boost DAU for DeFi Swap',
        type: 'Founder',
        category: 'DAU Increase',
        points: 500,
        description: 'Increase Daily Active Users (DAU) for our DeFi Swap platform by 500 within 30 days.',
        projectUrl: 'https://defi-swap.example.com',
        projectName: 'DeFi Swap',
        projectLogo: 'https://picsum.photos/32/32?random=1',
        image: 'https://picsum.photos/400/200?random=11',
        target: '500 new DAU',
        currentMetric: '1,000 DAU',
        contractAddress: '0x1234...5678',
        functionName: 'increaseDau()',
    },
    {
        id: 2,
        title: 'Hodl ETH for 30 Days',
        type: 'Community',
        category: 'Hodl Challenge',
        points: 750,
        description: 'Hold ETH in the contract for 30 days without withdrawing.',
        projectUrl: 'https://hodl-eth.example.com',
        projectName: 'Hodl ETH',
        projectLogo: 'https://picsum.photos/32/32?random=2',
        image: 'https://picsum.photos/400/200?random=12',
        target: '30 days',
        currentMetric: '0 days',
        contractAddress: '0x2345...6789',
        functionName: 'startHodl()',
        timeSet: '30 days',
    },
    {
        id: 3,
        title: 'Pump TOKEN to $1',
        type: 'Founder',
        category: 'Pump Challenge',
        points: 1000,
        description: 'Increase the price of TOKEN to $1 within 14 days.',
        projectUrl: 'https://token-pump.example.com',
        projectName: 'TOKEN Pump',
        projectLogo: 'https://picsum.photos/32/32?random=3',
        image: 'https://picsum.photos/400/200?random=13',
        target: '$1.00',
        currentMetric: '$0.50',
        contractAddress: '0x3456...7890',
        functionName: 'checkPrice()',
        targetPrice: 1.0,
    },
    {
        id: 4,
        title: 'Swap for BTC',
        type: 'Community',
        category: 'BTC Challenge',
        points: 600,
        description: 'Swap USDT, USDC, ETH, DIA, or BUSD for BTC using our swap contract.',
        projectUrl: 'https://btc-swap.example.com',
        projectName: 'BTC Swap',
        projectLogo: 'https://picsum.photos/32/32?random=4',
        image: 'https://picsum.photos/400/200?random=14',
        target: '10 BTC swapped',
        currentMetric: '2 BTC swapped',
        contractAddress: '0x4567...8901',
        functionName: 'swapToBtc()',
    },
    {
        id: 5,
        title: 'Increase TOKEN/BTC Volume',
        type: 'Founder',
        category: 'Volume Challenge',
        points: 800,
        description: 'Increase the trading volume of TOKEN/BTC pair to 100 BTC within 7 days.',
        projectUrl: 'https://token-volume.example.com',
        projectName: 'TOKEN Volume',
        projectLogo: 'https://picsum.photos/32/32?random=5',
        image: 'https://picsum.photos/400/200?random=15',
        target: '100 BTC volume',
        currentMetric: '20 BTC volume',
        contractAddress: '0x5678...9012',
        functionName: 'checkVolume()',
    },
];

const projects = [
    { id: 1, name: 'DeFi Swap', points: 1500 },
    { id: 2, name: 'Hodl ETH', points: 1200 },
    { id: 3, name: 'TOKEN Pump', points: 1000 },
    { id: 4, name: 'BTC Swap', points: 950 },
    { id: 5, name: 'TOKEN Volume', points: 1100 },
];

const bountyCategories: string[] = ['DAU Increase', 'Hodl Challenge', 'Pump Challenge', 'BTC Challenge', 'Volume Challenge'];

interface Bounty {
    id: number;
    title: string;
    type: string;
    category: string;
    points: number;
    description: string;
    projectUrl: string;
    projectName: string;
    projectLogo: string;
    image: string;
    target: string;
    currentMetric: string;
    contractAddress: string;
    functionName: string;
    targetPrice?: number;
    timeSet?: string;
}

interface BountyCardProps {
    bounty: Bounty;
    showDetails?: boolean;
}

function BountyCard({ bounty, showDetails = false }: BountyCardProps) {
    const getCategoryIcon = (category: string) => {
        switch (category) {
            case 'DAU Increase':
                return <Users className="h-4 w-4" />;
            case 'Hodl Challenge':
                return <Clock className="h-4 w-4" />;
            case 'Pump Challenge':
                return <TrendingUp className="h-4 w-4" />;
            case 'BTC Challenge':
                return <Repeat className="h-4 w-4" />;
            case 'Volume Challenge':
                return <BarChart3 className="h-4 w-4" />;
            default:
                return <Info className="h-4 w-4" />;
        }
    };

    return (
        <Card className="w-full">
            <CardHeader className="p-0">
                <Image src={bounty.image} alt={bounty.title} width={400} height={200} className="w-full h-48 object-cover rounded-t-lg" />
            </CardHeader>
            <CardContent className="p-4">
                <div className="flex justify-between items-center mb-2">
                    <Badge variant="secondary">{bounty.type}</Badge>
                    <Badge variant="outline" className="flex items-center gap-1">
                        {getCategoryIcon(bounty.category)}
                        {bounty.category}
                    </Badge>
                    <span className="font-bold">{bounty.points} Points</span>
                </div>
                <CardTitle className="mb-2">{bounty.title}</CardTitle>
                <CardDescription className="mb-4">{bounty.description}</CardDescription>
                <div className="flex justify-between items-center mb-4">
                    <div className="flex items-center">
                        <Image src={bounty.projectLogo} alt={bounty.projectName} width={32} height={32} className="mr-2 rounded-full" />
                        <span>{bounty.projectName}</span>
                    </div>
                    <Button variant="outline" size="sm" asChild>
                        <a href={bounty.projectUrl} target="_blank" rel="noopener noreferrer">
                            View Project <ExternalLink className="ml-2 h-4 w-4" />
                        </a>
                    </Button>
                </div>
                {!showDetails && (
                    <div className="flex gap-2">
                        <Dialog>
                            <DialogTrigger asChild>
                                <Button variant="outline" className="flex-1">
                                    Details <Info className="ml-2 h-4 w-4" />
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-3xl">
                                <DialogHeader>
                                    <DialogTitle>{bounty.title}</DialogTitle>
                                    <DialogDescription>Bounty Details</DialogDescription>
                                </DialogHeader>
                                <div className="mt-4">
                                    <Image src={bounty.image} alt={bounty.title} width={800} height={400} className="w-full h-64 object-cover rounded-lg mb-4" />
                                    <div className="flex items-center mb-4">
                                        <Image src={bounty.projectLogo} alt={bounty.projectName} width={32} height={32} className="mr-2 rounded-full" />
                                        <span className="font-bold">{bounty.projectName}</span>
                                    </div>
                                    <div className="grid grid-cols-3 gap-4 mb-4">
                                        <Card>
                                            <CardHeader>
                                                <CardTitle>Points</CardTitle>
                                            </CardHeader>
                                            <CardContent>
                                                <p className="text-2xl font-bold">{bounty.points}</p>
                                            </CardContent>
                                        </Card>
                                        <Card>
                                            <CardHeader>
                                                <CardTitle>Target</CardTitle>
                                            </CardHeader>
                                            <CardContent>
                                                <p className="text-2xl font-bold">{bounty.target}</p>
                                            </CardContent>
                                        </Card>
                                        <Card>
                                            <CardHeader>
                                                <CardTitle>Current</CardTitle>
                                            </CardHeader>
                                            <CardContent>
                                                <p className="text-2xl font-bold">{bounty.currentMetric}</p>
                                            </CardContent>
                                        </Card>
                                    </div>
                                    <p className="mb-4">{bounty.description}</p>
                                    <div className="mb-4">
                                        <p>
                                            <strong>Contract Address:</strong> {bounty.contractAddress}
                                        </p>
                                        <p>
                                            <strong>Function Name:</strong> {bounty.functionName}
                                        </p>
                                        {bounty.timeSet && (
                                            <p>
                                                <strong>Time Set:</strong> {bounty.timeSet}
                                            </p>
                                        )}
                                        {bounty.targetPrice && (
                                            <p>
                                                <strong>Target Price:</strong> ${bounty.targetPrice.toFixed(2)}
                                            </p>
                                        )}
                                    </div>
                                    <div className="flex gap-2">
                                        <Button asChild className="flex-1">
                                            <a href={bounty.projectUrl} target="_blank" rel="noopener noreferrer">
                                                View Project <ExternalLink className="ml-2 h-4 w-4" />
                                            </a>
                                        </Button>
                                        <Button variant="outline" className="flex-1">
                                            Claim Bounty <Award className="ml-2 h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                            </DialogContent>
                        </Dialog>
                        <Button variant="outline" className="flex-1">
                            Claim Bounty <Award className="ml-2 h-4 w-4" />
                        </Button>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}

export default function QuestsPage() {
    const [selectedType, setSelectedType] = useState<string>('All');
    const [selectedCategory, setSelectedCategory] = useState<string>('All');
    const [searchQuery, setSearchQuery] = useState<string>('');

    const filteredBounties = bounties.filter(
        (bounty) =>
            (selectedType === 'All' || bounty.type === selectedType) &&
            (selectedCategory === 'All' || bounty.category === selectedCategory) &&
            bounty.title.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="container mx-auto p-6">
            <h1 className="text-3xl font-bold mb-6">Quests</h1>
            <Tabs defaultValue="founder" className="space-y-4">
                <TabsList>
                    <TabsTrigger value="founder">Founder Bounties</TabsTrigger>
                    <TabsTrigger value="community">Community Bounties</TabsTrigger>
                    <TabsTrigger value="leaderboard">Project Leaderboard</TabsTrigger>
                </TabsList>
                <TabsContent value="founder" className="space-y-4">
                    <h2 className="text-2xl font-bold mb-4">Popular Bounties</h2>
                    <Carousel className="w-full max-w-5xl mx-auto">
                        <CarouselContent className="-ml-2 md:-ml-4">
                            {bounties.map((bounty, index) => (
                                <CarouselItem key={bounty.id} className="pl-2 md:pl-4 basis-full md:basis-1/2 lg:basis-1/3">
                                    <div className="p-1">
                                        <BountyCard bounty={bounty} />
                                    </div>
                                </CarouselItem>
                            ))}
                        </CarouselContent>
                        <CarouselPrevious />
                        <CarouselNext />
                    </Carousel>
                    <div className="flex flex-col sm:flex-row gap-4 mb-4">
                        <Select value={selectedType} onValueChange={setSelectedType}>
                            <SelectTrigger className="w-full sm:w-[180px]">
                                <SelectValue placeholder="Filter by type" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="All">All Types</SelectItem>
                                <SelectItem value="Founder">Founder</SelectItem>
                                <SelectItem value="Community">Community</SelectItem>
                            </SelectContent>
                        </Select>
                        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                            <SelectTrigger className="w-full sm:w-[180px]">
                                <SelectValue placeholder="Filter by category" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="All">All Categories</SelectItem>
                                {bountyCategories.map((category) => (
                                    <SelectItem key={category} value={category}>
                                        {category}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <div className="relative flex-grow">
                            <Search className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <Input placeholder="Search bounties..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-8" />
                        </div>
                    </div>
                    <div className="grid gap-6 md:grid-cols-2  lg:grid-cols-3">
                        {filteredBounties.map((bounty) => (
                            <BountyCard key={bounty.id} bounty={bounty} />
                        ))}
                    </div>
                </TabsContent>
                <TabsContent value="community">
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                        {bounties
                            .filter((bounty) => bounty.type === 'Community')
                            .map((bounty) => (
                                <BountyCard key={bounty.id} bounty={bounty} />
                            ))}
                    </div>
                </TabsContent>
                <TabsContent value="leaderboard">
                    <Card>
                        <CardHeader>
                            <CardTitle>Project Leaderboard</CardTitle>
                            <CardDescription>Top projects by points earned</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <ul className="space-y-2">
                                {projects
                                    .sort((a, b) => b.points - a.points)
                                    .map((project, index) => (
                                        <li key={project.id} className="flex items-center justify-between p-2 bg-muted rounded-md">
                                            <span className="font-semibold">
                                                {index + 1}. {project.name}
                                            </span>
                                            <span className="flex items-center">
                                                <Award className="mr-1 h-4 w-4 text-muted-foreground" />
                                                {project.points} points
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


