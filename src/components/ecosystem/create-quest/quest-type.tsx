import { PieChart, RepeatIcon, Users } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { useQuestForm } from '@/hooks/use-quest-form'
import { QuestType, QuestCategory } from '@/types/quest'
import { QUEST_CATEGORIES } from '@/constants/quest'

const TYPE_ICONS = {
  [QuestType.TVL]: <PieChart className="w-12 h-12 mb-2" />,
  [QuestType.TRX]: <RepeatIcon className="w-12 h-12 mb-2" />,
  [QuestType.DAU]: <Users className="w-12 h-12 mb-2" />
}

export function QuestTypeStep() {
  const { formState, updateField, errors } = useQuestForm()

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold mb-4">Select Quest Type</h2>
        <div className="grid grid-cols-3 gap-4">
          {Object.values(QuestType).map((type) => (
            <Card
              key={type}
              className={`cursor-pointer hover:border-primary transition-colors ${
                formState.type === type ? 'border-primary' : ''
              }`}
              onClick={() => {
                updateField('type', type)
                updateField('category', '') // Reset category when type changes
              }}
            >
              <CardContent className="flex flex-col items-center justify-center p-6">
                {TYPE_ICONS[type]}
                <span className="font-semibold">{type}</span>
              </CardContent>
            </Card>
          ))}
        </div>
        {errors.type && (
          <p className="text-destructive text-sm mt-2">{errors.type}</p>
        )}
      </div>

      {formState.type && (
        <div>
          <h2 className="text-lg font-semibold mb-4">Select Category</h2>
          <div className="flex flex-wrap gap-2">
            {QUEST_CATEGORIES[formState.type].map((category) => (
              <button
                key={category}
                className={`px-4 py-2 rounded-full border transition-colors ${
                  formState.category === category
                    ? 'bg-primary text-primary-foreground border-primary'
                    : 'border-input hover:bg-accent hover:text-accent-foreground'
                }`}
                onClick={() => updateField('category', category)}
              >
                {category}
              </button>
            ))}
          </div>
          {errors.category && (
            <p className="text-destructive text-sm mt-2">{errors.category}</p>
          )}
        </div>
      )}
    </div>
  )
}