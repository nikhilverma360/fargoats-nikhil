"use client";
import React from 'react';
import Link from 'next/link';
import { ChevronDownIcon, ArrowUpIcon, ArrowDownIcon, TrophyIcon } from 'lucide-react';
import {
    ColumnDef,
    ColumnFiltersState,
    SortingState,
    VisibilityState,
    flexRender,
    getCoreRowModel,
    getFilteredRowModel,
    getPaginationRowModel,
    getSortedRowModel,
    useReactTable,
} from '@tanstack/react-table';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { DropdownMenu, DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

// GOAT Club data
const GOATClubData = [
    {
        title: 'Wallets Most Active by DAU',
        description: 'Top performers based on daily active usage',
        wallets: [
            { address: '0x1234...5678', score: 95, change: 'up', rank: 1 },
            { address: '0x2345...6789', score: 88, change: 'down', rank: 2 },
            { address: '0x3456...7890', score: 82, change: 'up', rank: 3 }
        ]
    },
    {
        title: 'Wallets Most Bullish by TRX',
        description: 'Most optimistic wallets by transaction volume',
        wallets: [
            { address: '0x4567...8901', score: 92, change: 'up', rank: 1 },
            { address: '0x5678...9012', score: 85, change: 'up', rank: 2 },
            { address: '0x6789...0123', score: 79, change: 'down', rank: 3 }
        ]
    },
    {
        title: 'Wallets Whales by TVL',
        description: 'Top wallets by total value locked',
        wallets: [
            { address: '0x7890...1234', score: 100, change: 'up', rank: 1 },
            { address: '0x8901...2345', score: 95, change: 'stable', rank: 2 },
            { address: '0x9012...3456', score: 90, change: 'down', rank: 3 }
        ]
    },
    {
        title: 'Wallets with Most Quest Points',
        description: 'Leading wallets by quest completion points',
        wallets: [
            { address: '0x0123...4567', score: 87, change: 'up', rank: 1 },
            { address: '0x1234...5678', score: 84, change: 'down', rank: 2 },
            { address: '0x2345...6789', score: 80, change: 'up', rank: 3 }
        ]
    },
    {
        title: 'Wallets with the Most BTC',
        description: 'Wallets with the highest Bitcoin holdings',
        wallets: [
            { address: '0x3456...7890', score: 98, change: 'up', rank: 1 },
            { address: '0x4567...8901', score: 93, change: 'stable', rank: 2 },
            { address: '0x5678...9012', score: 89, change: 'down', rank: 3 }
        ]
    }
];

// Project data
const projectData: Project[] = [
    {
        id: '1',
        name: 'DeFi Swap',
        contracts: 5,
        type: 'DEX',
        tvl: 5000000000,
        trx: 1000000,
        dau: 500000,
        questPoints: 10000,
        lastPosted: '2023-07-15',
        twitterFollowers: 1000000,
        discordMembers: 500000,
    },
    {
        id: '2',
        name: 'Yield Farm',
        contracts: 3,
        type: 'Yield',
        tvl: 3000000000,
        trx: 750000,
        dau: 300000,
        questPoints: 8000,
        lastPosted: '2023-07-14',
        twitterFollowers: 800000,
        discordMembers: 400000,
    },
    {
        id: '3',
        name: 'NFT Marketplace',
        contracts: 4,
        type: 'NFT',
        tvl: 2000000000,
        trx: 500000,
        dau: 200000,
        questPoints: 6000,
        lastPosted: '2023-07-13',
        twitterFollowers: 600000,
        discordMembers: 300000,
    },
];

// Quest Leaderboard data
const questLeaderboardData: QuestLeaderboardEntry[] = [
    {
        id: '1',
        address: '0x1234...5678',
        questPoints: 10000,
        earnedRewards: 50,
        completedQuests: 25,
    },
    {
        id: '2',
        address: '0x2345...6789',
        questPoints: 8500,
        earnedRewards: 40,
        completedQuests: 20,
    },
    {
        id: '3',
        address: '0x3456...7890',
        questPoints: 7200,
        earnedRewards: 35,
        completedQuests: 18,
    },
];

type Project = {
    id: string;
    name: string;
    contracts: number;
    type: string;
    tvl: number;
    trx: number;
    dau: number;
    questPoints: number;
    lastPosted: string;
    twitterFollowers: number;
    discordMembers: number;
};

type QuestLeaderboardEntry = {
    id: string;
    address: string;
    questPoints: number;
    earnedRewards: number;
    completedQuests: number;
};

const projectColumns: ColumnDef<Project>[] = [
    {
        accessorKey: 'name',
        header: 'Project Name',
        cell: ({ row }) => <div className="font-medium">{row.getValue('name')}</div>,
    },
    {
        accessorKey: 'contracts',
        header: 'Contracts',
        cell: ({ row }) => <div className="text-center">{row.getValue('contracts')}</div>,
    },
    {
        accessorKey: 'type',
        header: 'Type',
        cell: ({ row }) => <div className="capitalize">{row.getValue('type')}</div>,
    },
    {
        accessorKey: 'tvl',
        header: () => <div className="text-right">TVL</div>,
        cell: ({ row }) => {
            const amount = parseFloat(row.getValue('tvl'));
            const formatted = new Intl.NumberFormat('en-US', {
                style: 'currency',
                currency: 'USD',
                notation: 'compact',
                maximumFractionDigits: 1,
            }).format(amount);
            return <div className="text-right font-medium">{formatted}</div>;
        },
    },
    {
        accessorKey: 'trx',
        header: () => <div className="text-right">TRX</div>,
        cell: ({ row }) => {
            const amount = parseFloat(row.getValue('trx'));
            const formatted = new Intl.NumberFormat('en-US', {
                notation: 'compact',
                maximumFractionDigits: 1,
            }).format(amount);
            return <div className="text-right font-medium">{formatted}</div>;
        },
    },
    {
        accessorKey: 'dau',
        header: () => <div className="text-right">DAU</div>,
        cell: ({ row }) => {
            const amount = parseFloat(row.getValue('dau'));
            const formatted = new Intl.NumberFormat('en-US', {
                notation: 'compact',
                maximumFractionDigits: 1,
            }).format(amount);
            return <div className="text-right font-medium">{formatted}</div>;
        },
    },
    {
        accessorKey: 'questPoints',
        header: () => <div className="text-right">Quest Points</div>,
        cell: ({ row }) => {
            const amount = parseFloat(row.getValue('questPoints'));
            const formatted = new Intl.NumberFormat('en-US', {
                notation: 'compact',
                maximumFractionDigits: 1,
            }).format(amount);
            return <div className="text-right font-medium">{formatted}</div>;
        },
    },
];

const questLeaderboardColumns: ColumnDef<QuestLeaderboardEntry>[] = [
    {
        accessorKey: 'address',
        header: 'Wallet Address',
        cell: ({ row }) => (
            <Link href={`/profile/${row.getValue('address')}`} className="font-mono text-blue-600 hover:underline">
                {row.getValue('address')}
            </Link>
        ),
    },
    {
        accessorKey: 'questPoints',
        header: () => <div className="text-right">Quest Points</div>,
        cell: ({ row }) => {
            const amount = parseFloat(row.getValue('questPoints'));
            const formatted = new Intl.NumberFormat('en-US', {
                notation: 'compact',
                maximumFractionDigits: 1,
            }).format(amount);
            return <div className="text-right font-medium">{formatted}</div>;
        },
    },
    {
        accessorKey: 'earnedRewards',
        header: () => <div className="text-right">Earned Rewards</div>,
        cell: ({ row }) => {
            const amount = parseFloat(row.getValue('earnedRewards'));
            const formatted = new Intl.NumberFormat('en-US', {
                notation: 'compact',
                maximumFractionDigits: 2,
            }).format(amount);
            return <div className="text-right font-medium">{formatted}K</div>;
        },
    },
    {
        accessorKey: 'completedQuests',
        header: () => <div className="text-right">Completed Quests</div>,
        cell: ({ row }) => {
            const amount = parseFloat(row.getValue('completedQuests'));
            return <div className="text-right font-medium">{amount}</div>;
        },
    },
];

const LeaderCard = ({ category }) => {
    return (
        <Card className="hover:shadow-lg transition-shadow duration-200">
            <CardHeader className="space-y-1">
                <div className="flex items-center justify-between">
                    <CardTitle className="text-xl font-bold">{category.title}</CardTitle>
                    <TrophyIcon className="w-6 h-6 text-yellow-500" />
                </div>
                <CardDescription>{category.description}</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    {category.wallets.map((wallet, index) => (
                        <div key={index} className="flex items-center justify-between p-2 rounded-lg bg-gray-50 hover:bg-gray-100">
                            <div className="flex items-center space-x-3">
                                <Badge variant={index === 0 ? "default" : "secondary"} className="w-6 h-6 rounded-full flex items-center justify-center">
                                    {wallet.rank}
                                </Badge>
                                <Link href={`/profile/${wallet.address}`} className="text-blue-600 hover:underline font-mono">
                                    {wallet.address}
                                </Link>
                            </div>
                            <div className="flex items-center space-x-2">
                                <span className="font-bold">{wallet.score}</span>
                                {wallet.change === 'up' ? (
                                    <ArrowUpIcon className="w-4 h-4 text-green-500" />
                                ) : (
                                    <ArrowDownIcon className="w-4 h-4 text-red-500" />
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
};

function DataTable<TData, TValue>({ 
    columns, 
    data,
    title,
    description 
}: { 
    columns: ColumnDef<TData, TValue>[]; 
    data: TData[];
    title: string;
    description?: string;
}) {
    const [sorting, setSorting] = React.useState<SortingState>([]);
    const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
    const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({});

    const table = useReactTable({
        data,
        columns,
        onSortingChange: setSorting,
        onColumnFiltersChange: setColumnFilters,
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        onColumnVisibilityChange: setColumnVisibility,
        state: {
            sorting,
            columnFilters,
            columnVisibility,
        },
    });

    return (
        <Card className="w-full">
            <CardHeader>
                <CardTitle>{title}</CardTitle>
                {description && <CardDescription>{description}</CardDescription>}
            </CardHeader>
            <CardContent>
                <div className="flex items-center justify-between py-4">
                    <div className="flex items-center space-x-2">
                        <Input
                            placeholder="Filter entries..."
                            className="max-w-sm"
                            onChange={(event) =>
                                table.getColumn(columns[0].accessorKey as string)?.setFilterValue(event.target.value)
                            }
                        />
                        <Badge variant="outline" className="h-8 px-3">
                            {table.getFilteredRowModel().rows.length} Results
                        </Badge>
                    </div>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline">
                                Columns <ChevronDownIcon className="ml-2 h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            {table
                                .getAllColumns()
                                .filter((column) => column.getCanHide())
                                .map((column) => {
                                    return (
                                        <DropdownMenuCheckboxItem
                                            key={column.id}
                                            className="capitalize"
                                            checked={column.getIsVisible()}
                                            onCheckedChange={(value) => column.toggleVisibility(!!value)}
                                        >
                                            {column.id}
                                        </DropdownMenuCheckboxItem>
                                    );
                                })}
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
                <div className="rounded-md border">
                    <Table>
                        <TableHeader>
                            {table.getHeaderGroups().map((headerGroup) => (
                                <TableRow key={headerGroup.id}>
                                    {headerGroup.headers.map((header) => (
                                        <TableHead key={header.id}>
                                            {header.isPlaceholder
                                                ? null
                                                : flexRender(
                                                      header.column.columnDef.header,
                                                      header.getContext()
                                                  )}
                                        </TableHead>
                                    ))}
                                </TableRow>
                            ))}
                        </TableHeader>
                        <TableBody>
                            {table.getRowModel().rows?.length ? (
                                table.getRowModel().rows.map((row) => (
                                    <TableRow
                                        key={row.id}
                                        data-state={row.getIsSelected() && "selected"}
                                        className="hover:bg-gray-50"
                                    >
                                        {row.getVisibleCells().map((cell) => (
                                            <TableCell key={cell.id}>
                                                {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                            </TableCell>
                                        ))}
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell
                                        colSpan={columns.length}
                                        className="h-24 text-center"
                                    >
                                        No results.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>
                <div className="flex items-center justify-between space-x-2 py-4">
                    <div className="flex-1 text-sm text-muted-foreground">
                        Page {table.getState().pagination.pageIndex + 1} of{" "}
                        {table.getPageCount()}
                    </div>
                    <div className="flex items-center space-x-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => table.previousPage()}
                            disabled={!table.getCanPreviousPage()}
                        >
                            Previous
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => table.nextPage()}
                            disabled={!table.getCanNextPage()}
                        >
                            Next
                        </Button>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}

export default function LeaderboardPage() {
    const [progress] = React.useState(85);

    return (
        <div className="container mx-auto py-10 space-y-8">
            <div className="flex flex-col space-y-2">
                <h1 className="text-3xl font-bold tracking-tight">Leaderboard</h1>
                <p className="text-muted-foreground">
                    Track top performers across different categories
                </p>
            </div>
            
            <Card className="bg-gradient-to-r from-[#B58F3B] to-[#FAF186] text-black">
                <CardHeader>
                    <CardTitle>Current Season Progress</CardTitle>
                    <CardDescription className="text-gray-100">
                        Season 1 - 2024 Q1
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                            <span>Progress</span>
                            <span>{progress}%</span>
                        </div>
                        <Progress value={progress} className="bg-blue-200" />
                    </div>
                </CardContent>
            </Card>

            <Tabs defaultValue="GOATclub" className="space-y-4">
                <TabsList className="w-full justify-start">
                    <TabsTrigger value="GOATclub" className="flex items-center gap-2">
                        <TrophyIcon className="w-4 h-4" />
                        GOAT Leaders
                    </TabsTrigger>
                    <TabsTrigger value="projects">Project Leaderboard</TabsTrigger>
                    <TabsTrigger value="questleaderboard">Quest Leaderboard</TabsTrigger>
                </TabsList>
                
                <TabsContent value="GOATclub">
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                        {GOATClubData.map((category, index) => (
                            <LeaderCard key={index} category={category} />
                        ))}
                    </div>
                </TabsContent>
                
                <TabsContent value="projects">
                    <DataTable 
                        columns={projectColumns} 
                        data={projectData}
                        title="Project Rankings"
                        description="Top performing projects based on key metrics"
                    />
                </TabsContent>
                
                <TabsContent value="questleaderboard">
                    <DataTable 
                        columns={questLeaderboardColumns} 
                        data={questLeaderboardData}
                        title="Quest Champions"
                        description="Leading wallets in quest completion and rewards"
                    />
                </TabsContent>
            </Tabs>
        </div>
    );
}