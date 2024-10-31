'use client';

import { useProjectForm } from '../../../hooks/genesis-form-context';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus, Trash2 } from 'lucide-react';

export function ProjectContracts() {
    const { formState, updateFormState } = useProjectForm();

    const handleAddAbi = () => {
        updateFormState({
            abiList: [...formState.abiList, { abi: '', contractAddress: '', contractName: '' }],
        });
    };

    const handleRemoveAbi = (index: number) => {
        updateFormState({
            abiList: formState.abiList.filter((_, i) => i !== index),
        });
    };

    const handleAbiChange = (index: number, field: 'abi' | 'contractAddress' | 'contractName', value: string) => {
        const newAbiList = formState.abiList.map((item, i) => {
            if (i === index) {
                return { ...item, [field]: value };
            }
            return item;
        });
        updateFormState({ abiList: newAbiList });
    };

    return (
        <div className="space-y-4">
            <Label>ABI and Contract Address</Label>
            {formState.abiList.map((item, index) => (
                <div key={index} className="flex gap-2">
                    <Input 
                        value={item.contractName}
                        onChange={(e) => handleAbiChange(index, 'contractName', e.target.value)}
                        placeholder="Contract Name"
                        required
                    />
                    <Input 
                        type="file" 
                        onChange={(e) => handleAbiChange(index, 'abi', e.target.value)} 
                        accept=".json" 
                        required 
                    />
                    <Input 
                        value={item.contractAddress} 
                        onChange={(e) => handleAbiChange(index, 'contractAddress', e.target.value)} 
                        placeholder="Contract Address" 
                        required 
                    />
                    <Button 
                        type="button" 
                        variant="destructive" 
                        size="icon" 
                        onClick={() => handleRemoveAbi(index)} 
                        disabled={formState.abiList.length === 1}
                    >
                        <Trash2 className="h-4 w-4" />
                        <span className="sr-only">Remove ABI</span>
                    </Button>
                </div>
            ))}
            <Button type="button" variant="outline" onClick={handleAddAbi}>
                <Plus className="mr-2 h-4 w-4" /> Add Another ABI
            </Button>
        </div>
    );
}
