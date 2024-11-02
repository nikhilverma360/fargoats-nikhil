// components/steps/ReviewStep.tsx
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { UserType } from '@/types/quest'
import { useQuestForm } from '@/hooks/use-quest-form'
import { Globe, Timer, Target, Wallet, Code } from 'lucide-react'

interface ReviewStepProps {
  userType: UserType
}

export function ReviewStep({ userType }: ReviewStepProps) {
  const { formState } = useQuestForm()

  const durationMap = {
    '7d': '7 Days',
    '14d': '14 Days',
    '30d': '30 Days',
    '90d': '90 Days'
  }

  const formatMetric = (value: string, type: string) => {
    switch (type) {
      case 'TVL':
        return `$${Number(value).toLocaleString()}`
      case 'TRX':
        return Number(value).toLocaleString()
      case 'DAU':
        return `${Number(value).toLocaleString()} users`
      default:
        return value
    }
  }

  return (
    <div className="space-y-8">
      {/* Header Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h2 className="text-2xl font-bold">{formState.name}</h2>
            <p className="text-muted-foreground">
              {userType === 'founder' ? 'Founder Quest' : 'Community Quest'}
            </p>
          </div>
          <div className="flex gap-2">
            <Badge variant="outline">{formState.type}</Badge>
            <Badge>{formState.category}</Badge>
          </div>
        </div>

        {formState.imagePreview && (
          <div className="relative rounded-lg overflow-hidden h-48 bg-muted">
            <img
              src={formState.imagePreview}
              alt="Quest preview"
              className="object-cover w-full h-full"
            />
          </div>
        )}
      </div>

      <Separator />

      {/* Quest Details */}
      <Card>
        <CardContent className="p-6 space-y-6">
          {/* Description */}
          <div className="space-y-2">
            <h3 className="text-lg font-semibold">Description</h3>
            <p className="text-muted-foreground whitespace-pre-wrap">
              {formState.description}
            </p>
          </div>

          <Separator />

          {/* Key Information */}
          <div className="grid grid-cols-2 gap-6">
            {/* Points */}
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-full bg-primary/10">
                <Wallet className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Points Allocation</p>
                <p className="font-medium">{Number(formState.points).toLocaleString()} points</p>
              </div>
            </div>

            {/* Duration */}
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-full bg-primary/10">
                <Timer className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Duration</p>
                <p className="font-medium">{durationMap[formState.duration as keyof typeof durationMap]}</p>
              </div>
            </div>

            {/* Required Metric */}
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-full bg-primary/10">
                <Target className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Required {formState.type}</p>
                <p className="font-medium">
                  {formatMetric(formState.requiredMetric, formState.type)}
                </p>
              </div>
            </div>

            {/* Website */}
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-full bg-primary/10">
                <Globe className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Website</p>
                <a 
                  href={formState.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-medium text-primary hover:underline"
                >
                  {new URL(formState.website).hostname}
                </a>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Contract Information */}
      <Card>
        <CardContent className="p-6 space-y-4">
          <div className="flex items-center gap-2">
            <Code className="h-5 w-5" />
            <h3 className="text-lg font-semibold">Contract Details</h3>
          </div>

          {userType === 'founder' ? (
            <div className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground mb-2">Selected Contracts</p>
                <div className="flex flex-wrap gap-2">
                  {formState.contracts.map((contract) => (
                    <Badge key={contract} variant="secondary">
                      {contract}
                    </Badge>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-2">Function</p>
                <Badge variant="outline" className="font-mono">
                  {formState.functionAbi}
                </Badge>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground mb-2">Contract Address</p>
                <Badge variant="secondary" className="font-mono">
                  {formState.contractAddress}
                </Badge>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-2">Function ABI</p>
                <pre className="bg-muted p-3 rounded-lg overflow-x-auto">
                  <code className="text-sm">
                    {formState.functionAbi}
                  </code>
                </pre>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Summary Banner */}
      <Card className="bg-primary/5 border-primary/20">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Quest Summary</p>
              <p className="font-medium">
                {formState.points} points reward for achieving {formatMetric(formState.requiredMetric, formState.type)} {formState.type} in {durationMap[formState.duration as keyof typeof durationMap].toLowerCase()}
              </p>
            </div>
            <Badge variant="default" className="text-lg px-4 py-2">
              {formState.type}
            </Badge>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}