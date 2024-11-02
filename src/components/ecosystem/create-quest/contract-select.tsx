import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useQuestForm } from '@/hooks/use-quest-form';
import { UserType } from '@/types/quest';
import { X } from 'lucide-react';

interface ContractStepProps {
    userType: UserType;
}

export function ContractStep({ userType }: ContractStepProps) {
    const { formState, updateField, errors } = useQuestForm();

    if (userType === 'founder') {
        return (
            <div className="space-y-6">
                <div className="space-y-2">
                    <Label>Select Contracts</Label>
                    <Select
                        value={formState.contracts[0]} // For single select
                        onValueChange={(value) => updateField('contracts', [value])}
                    >
                        <SelectTrigger className={errors.contracts ? 'border-destructive' : ''}>
                            <SelectValue placeholder="Select contract" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="contract1">Contract 1 (0x123...)</SelectItem>
                            <SelectItem value="contract2">Contract 2 (0x456...)</SelectItem>
                            <SelectItem value="contract3">Contract 3 (0x789...)</SelectItem>
                        </SelectContent>
                    </Select>
                    {errors.contracts && <p className="text-destructive text-sm">{errors.contracts}</p>}
                </div>

                {formState.contracts.length > 0 && (
                    <div className="space-y-2">
                        <Label>Selected Contracts</Label>
                        <div className="flex flex-wrap gap-2">
                            {formState.contracts.map((contract) => (
                                <Badge key={contract} variant="secondary">
                                    {contract}
                                    <button
                                        className="ml-2 hover:text-destructive"
                                        onClick={() => {
                                            updateField(
                                                'contracts',
                                                formState.contracts.filter((c) => c !== contract)
                                            );
                                        }}
                                    >
                                        <X className="h-3 w-3" />
                                    </button>
                                </Badge>
                            ))}
                        </div>
                    </div>
                )}

                <div className="space-y-2">
                    <Label>Function Selector</Label>
                    <Select value={formState.functionAbi} onValueChange={(value) => updateField('functionAbi', value)}>
                        <SelectTrigger className={errors.functionAbi ? 'border-destructive' : ''}>
                            <SelectValue placeholder="Select function" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="function1">balanceOf(address)</SelectItem>
                            <SelectItem value="function2">transfer(address,uint256)</SelectItem>
                            <SelectItem value="function3">approve(address,uint256)</SelectItem>
                        </SelectContent>
                    </Select>
                    {errors.functionAbi && <p className="text-destructive text-sm">{errors.functionAbi}</p>}
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="space-y-2">
                <Label htmlFor="contractAddress">Contract Address</Label>
                <Input
                    id="contractAddress"
                    value={formState.contractAddress}
                    onChange={(e) => updateField('contractAddress', e.target.value)}
                    placeholder="Enter contract address"
                    className={errors.contractAddress ? 'border-destructive' : ''}
                />
                {errors.contractAddress && <p className="text-destructive text-sm">{errors.contractAddress}</p>}
            </div>

            <div className="space-y-2">
                <Label htmlFor="functionAbi">Function ABI</Label>
                <Textarea
                    id="functionAbi"
                    value={formState.functionAbi}
                    onChange={(e) => updateField('functionAbi', e.target.value)}
                    placeholder="Enter function ABI"
                    className={errors.functionAbi ? 'border-destructive' : ''}
                />
                {errors.functionAbi && <p className="text-destructive text-sm">{errors.functionAbi}</p>}
            </div>
        </div>
    );
}
