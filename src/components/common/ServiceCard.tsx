import { Clock, DollarSign } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ServiceCardProps {
  id: string;
  name: string;
  description?: string | null;
  price: number;
  duration: number;
  selected?: boolean;
  onSelect?: (id: string) => void;
}

export const ServiceCard = ({
  id,
  name,
  description,
  price,
  duration,
  selected,
  onSelect,
}: ServiceCardProps) => {
  return (
    <div
      onClick={() => onSelect?.(id)}
      className={cn(
        "p-4 rounded-xl border-2 transition-all duration-200 cursor-pointer",
        selected 
          ? "border-primary bg-primary/5 shadow-md" 
          : "border-border bg-card hover:border-primary/50 hover:shadow-sm"
      )}
    >
      <div className="flex justify-between items-start gap-3">
        <div className="flex-1 min-w-0">
          <h4 className="font-semibold text-foreground truncate">{name}</h4>
          {description && (
            <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
              {description}
            </p>
          )}
          <div className="flex items-center gap-4 mt-2">
            <span className="flex items-center gap-1 text-sm text-muted-foreground">
              <Clock className="w-4 h-4" />
              {duration} min
            </span>
          </div>
        </div>
        <div className="text-right shrink-0">
          <p className="text-lg font-bold text-primary">
            R$ {price.toFixed(2).replace('.', ',')}
          </p>
        </div>
      </div>
      
      {selected && (
        <div className="mt-3 pt-3 border-t border-primary/20">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center">
              <svg className="w-3 h-3 text-primary-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <span className="text-sm font-medium text-primary">Selecionado</span>
          </div>
        </div>
      )}
    </div>
  );
};
