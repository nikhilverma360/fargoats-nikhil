'use client'

import { useProjectForm } from './project-form-context'
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"

export function ProjectBasicInfo() {
  const { formState, updateFormState } = useProjectForm()

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
    </div>
  )
}