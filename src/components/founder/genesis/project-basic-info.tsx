'use client';

import { useProjectForm } from '../../../hooks/genesis-form-context';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import { TAGS } from '@/constants/genesis';
export function ProjectBasicInfo() {
    const { formState, updateFormState } = useProjectForm();

    const handleTagSelection = (tag: string) => {
        const currentTags = formState.tags || [];
        if (currentTags.includes(tag)) {
            updateFormState({ tags: currentTags.filter((t) => t !== tag) });
        } else if (currentTags.length < 3) {
            updateFormState({ tags: [...currentTags, tag] });
        }
    };

    return (
        <div className="space-y-4">
            <div className="space-y-2">
                <Label htmlFor="projectName">Project Name</Label>
                <Input
                    id="projectName"
                    value={formState.projectName}
                    onChange={(e) => updateFormState({ projectName: e.target.value })}
                    placeholder="Enter project name"
                    required
                />
            </div>
            <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                    id="description"
                    value={formState.description}
                    onChange={(e) => updateFormState({ description: e.target.value })}
                    placeholder="Describe your project"
                    required
                />
            </div>

            <div className="space-y-2">
                <Label htmlFor="website">Website</Label>
                <Input
                    id="website"
                    type="url"
                    value={formState.website}
                    onChange={(e) => updateFormState({ website: e.target.value })}
                    placeholder="https://yourproject.com"
                    required
                />
            </div>

            <div className="space-y-2">
                <Label htmlFor="tags">Tags (Select up to 3)</Label>
                <div className="flex flex-wrap gap-2">
                    {TAGS.map((tag) => (
                        <button
                            key={tag}
                            type="button"
                            onClick={() => handleTagSelection(tag)}
                            className={cn(
                                'px-3 py-1 rounded-full text-sm border',
                                formState.tags?.includes(tag) ? 'bg-primary text-primary-foreground' : 'bg-background',
                                formState.tags?.length === 3 && !formState.tags?.includes(tag) ? 'opacity-50 cursor-not-allowed' : 'hover:bg-accent'
                            )}
                            disabled={formState.tags?.length === 3 && !formState.tags?.includes(tag)}
                        >
                            {tag}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
}
