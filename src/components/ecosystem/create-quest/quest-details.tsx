import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useQuestForm } from '@/hooks/use-quest-form'
import { X } from 'lucide-react'

export function QuestDetailsStep() {
  const { formState, updateField, handleImageUpload, removeImage, errors } = useQuestForm()

  return (
    <div className="space-y-6">
      {/* Image Upload */}
      <div
        className={`border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center cursor-pointer transition-colors ${
          errors.image ? 'border-destructive' : 'hover:border-primary'
        }`}
        onClick={() => document.getElementById('image-upload')?.click()}
      >
        {formState.imagePreview ? (
          <div className="relative">
            <img 
              src={formState.imagePreview} 
              alt="Quest preview" 
              className="max-h-48 rounded"
            />
            <button
              className="absolute top-2 right-2 p-1 bg-destructive text-destructive-foreground rounded-full"
              onClick={(e) => {
                e.stopPropagation()
                removeImage()
              }}
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center">
            <img className="w-12 h-12 text-muted-foreground mb-2" alt="Upload icon" />
            <p className="text-sm text-muted-foreground">
              Click or drag and drop to upload image
            </p>
          </div>
        )}
        <input
          id="image-upload"
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0]
            if (file) handleImageUpload(file)
          }}
        />
        {errors.image && (
          <p className="text-destructive text-sm mt-2">{errors.image}</p>
        )}
      </div>

      {/* Form Fields */}
      <div className="grid grid-cols-2 gap-4">
        <div className="col-span-2 space-y-2">
          <Label htmlFor="name">Quest Name</Label>
          <Input
            id="name"
            value={formState.name}
            onChange={(e) => updateField('name', e.target.value)}
            placeholder="Enter quest name"
            className={errors.name ? 'border-destructive' : ''}
          />
          {errors.name && (
            <p className="text-destructive text-sm">{errors.name}</p>
          )}
        </div>

        <div className="col-span-2 space-y-2">
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            value={formState.description}
            onChange={(e) => updateField('description', e.target.value)}
            placeholder="Describe your quest"
            className={errors.description ? 'border-destructive' : ''}
          />
          {errors.description && (
            <p className="text-destructive text-sm">{errors.description}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="points">Points Allocation</Label>
          <Input
            id="points"
            type="number"
            value={formState.points}
            onChange={(e) => updateField('points', e.target.value)}
            placeholder="Enter points"
            min="1"
            className={errors.points ? 'border-destructive' : ''}
          />
          {errors.points && (
            <p className="text-destructive text-sm">{errors.points}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="website">Website URL</Label>
          <Input
            id="website"
            type="url"
            value={formState.website}
            onChange={(e) => updateField('website', e.target.value)}
            placeholder="https://example.com"
            className={errors.website ? 'border-destructive' : ''}
          />
          {errors.website && (
            <p className="text-destructive text-sm">{errors.website}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="duration">Duration</Label>
          <Select
            value={formState.duration}
            onValueChange={(value) => updateField('duration', value)}
          >
            <SelectTrigger id="duration" className={errors.duration ? 'border-destructive' : ''}>
              <SelectValue placeholder="Select duration" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">7 days</SelectItem>
              <SelectItem value="14d">14 days</SelectItem>
              <SelectItem value="30d">30 days</SelectItem>
              <SelectItem value="90d">90 days</SelectItem>
            </SelectContent>
          </Select>
          {errors.duration && (
            <p className="text-destructive text-sm">{errors.duration}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="requiredMetric">{`Required ${formState.type}`}</Label>
          <Input
            id="requiredMetric"
            type="number"
            value={formState.requiredMetric}
            onChange={(e) => updateField('requiredMetric', e.target.value)}
            placeholder={`Enter required ${formState.type}`}
            min="1"
            className={errors.requiredMetric ? 'border-destructive' : ''}
          />
          {errors.requiredMetric && (
            <p className="text-destructive text-sm">{errors.requiredMetric}</p>
          )}
        </div>
      </div>
    </div>
  )
}