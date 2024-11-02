import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { FormItem, FormControl, FormLabel } from '@/components/ui/form'

interface CategorySelectorProps {
  questType: string;
  categories: { [key: string]: string[] };
  selected: string;
  onSelect: (value: string) => void;
}

export function CategorySelector ({ questType, categories, selected, onSelect }: CategorySelectorProps) {
  if (!questType || !categories[questType]) return null

  return (
    <RadioGroup
      value={selected}
      onValueChange={onSelect}
      className="flex flex-wrap gap-2"
    >
      {categories[questType].map((category) => (
        <FormItem key={category}>
          <FormControl>
            <RadioGroupItem
              value={category}
              id={category.toLowerCase()}
              className="peer sr-only"
            />
          </FormControl>
          <FormLabel
            htmlFor={category.toLowerCase()}
            className="flex items-center justify-center rounded-full px-3 py-2 text-sm border border-muted bg-popover hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary peer-data-[state=checked]:text-primary-foreground"
          >
            {category}
          </FormLabel>
        </FormItem>
      ))}
    </RadioGroup>
  )
}

