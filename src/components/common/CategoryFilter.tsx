import { Scissors, Sparkles, Heart, Dumbbell, Camera, Music, Utensils, MoreHorizontal } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';

const categories = [
  { id: 'all', label: 'Todos', icon: MoreHorizontal },
  { id: 'barbearia', label: 'Barbearia', icon: Scissors },
  { id: 'beleza', label: 'Beleza', icon: Sparkles },
  { id: 'saude', label: 'Saúde', icon: Heart },
  { id: 'fitness', label: 'Fitness', icon: Dumbbell },
  { id: 'foto', label: 'Fotografia', icon: Camera },
  { id: 'musica', label: 'Música', icon: Music },
  { id: 'gastronomia', label: 'Gastronomia', icon: Utensils },
];

interface CategoryFilterProps {
  selected: string;
  onSelect: (category: string) => void;
}

export const CategoryFilter = ({ selected, onSelect }: CategoryFilterProps) => {
  return (
    <ScrollArea className="w-full whitespace-nowrap">
      <div className="flex gap-2 px-4 py-2">
        {categories.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => onSelect(id)}
            className={cn(
              "flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium text-sm transition-all duration-200 shrink-0",
              selected === id
                ? "bg-primary text-primary-foreground shadow-md"
                : "bg-card border border-border text-muted-foreground hover:text-foreground hover:border-primary/50"
            )}
          >
            <Icon className="w-4 h-4" />
            {label}
          </button>
        ))}
      </div>
      <ScrollBar orientation="horizontal" className="invisible" />
    </ScrollArea>
  );
};
