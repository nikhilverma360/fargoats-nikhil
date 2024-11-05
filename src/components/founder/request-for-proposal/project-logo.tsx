'use client';

import { useProjectForm } from '../../../hooks/genesis-form-context';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';

export function ProjectLogo() {
    const { formState, updateFormState } = useProjectForm();

    const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            updateFormState({ logo: e.target.files[0] });
        }
    };

    return (
        <div className="space-y-4">
            <div className="space-y-2">
                <Label htmlFor="logo">Project Logo</Label>
                <Input id="logo" type="file" onChange={handleLogoChange} accept="image/*" required />
            </div>
            {formState.logo && (
                <div className="mt-2">
                    <img src={URL.createObjectURL(formState.logo)} alt="Project Logo Preview" className="w-32 h-32 object-contain border rounded" />
                </div>
            )}
        </div>
    );
}
