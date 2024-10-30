'use client';

import { useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/hooks/use-toast';

export default function SubmitQuestPage() {
    const [contractName, setContractName] = useState('');
    const [contractFunction, setContractFunction] = useState('');
    const [pointsAllocation, setPointsAllocation] = useState('');
    const [questName, setQuestName] = useState('');
    const [questDescription, setQuestDescription] = useState('');
    const [webpageUrl, setWebpageUrl] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // Here you would typically send this data to your backend
        console.log({
            contractName,
            contractFunction,
            pointsAllocation,
            questName,
            questDescription,
            webpageUrl,
        });
        toast({
            title: 'Quest submitted',
            description: 'Your quest has been submitted for review.',
        });
        // Reset form fields
        setContractName('');
        setContractFunction('');
        setPointsAllocation('');
        setQuestName('');
        setQuestDescription('');
        setWebpageUrl('');
    };

    return (
        <div className="container mx-auto p-6">
            {/* <div className="mb-6">
                <Link href="/founders" className="inline-flex items-center text-sm font-medium text-muted-foreground hover:underline">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to Founders Dashboard
                </Link>
            </div> */}
            <Card>
                <CardHeader>
                    <CardTitle>Submit a New Quest</CardTitle>
                    <CardDescription>Create a new growth hack quest for your project</CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid w-full gap-1.5">
                            <Label htmlFor="contractName">Contract Name</Label>
                            <Input id="contractName" placeholder="e.g., TokenSwap" value={contractName} onChange={(e) => setContractName(e.target.value)} required />
                        </div>
                        <div className="grid w-full gap-1.5">
                            <Label htmlFor="contractFunction">Contract Function Name</Label>
                            <Input id="contractFunction" placeholder="e.g., swapTokens" value={contractFunction} onChange={(e) => setContractFunction(e.target.value)} required />
                        </div>
                        <div className="grid w-full gap-1.5">
                            <Label htmlFor="pointsAllocation">Points Allocation</Label>
                            <Input
                                id="pointsAllocation"
                                type="number"
                                placeholder="e.g., 500"
                                value={pointsAllocation}
                                onChange={(e) => setPointsAllocation(e.target.value)}
                                required
                            />
                        </div>
                        <div className="grid w-full gap-1.5">
                            <Label htmlFor="questName">Quest Name</Label>
                            <Input id="questName" placeholder="e.g., Boost Token Swaps" value={questName} onChange={(e) => setQuestName(e.target.value)} required />
                        </div>
                        <div className="grid w-full gap-1.5">
                            <Label htmlFor="questDescription">Quest Description</Label>
                            <Textarea
                                id="questDescription"
                                placeholder="Describe the quest and its goals"
                                value={questDescription}
                                onChange={(e) => setQuestDescription(e.target.value)}
                                required
                            />
                        </div>
                        <div className="grid w-full gap-1.5">
                            <Label htmlFor="webpageUrl">Webpage URL</Label>
                            <Input
                                id="webpageUrl"
                                type="url"
                                placeholder="https://example.com/token-swap"
                                value={webpageUrl}
                                onChange={(e) => setWebpageUrl(e.target.value)}
                                required
                            />
                        </div>
                        <Button type="submit" className="w-full">
                            Submit Quest
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
