import { Calendar, Clock, MapPin, CreditCard } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

interface AppointmentCardProps {
  id: string;
  serviceName: string;
  partnerName: string;
  partnerCity: string;
  dateTime: string;
  status: 'pending' | 'confirmed' | 'canceled' | 'completed';
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded';
  price: number;
  onCancel?: (id: string) => void;
  onViewDetails?: (id: string) => void;
}

const statusLabels = {
  pending: { label: 'Pendente', color: 'bg-warning/10 text-warning' },
  confirmed: { label: 'Confirmado', color: 'bg-success/10 text-success' },
  canceled: { label: 'Cancelado', color: 'bg-destructive/10 text-destructive' },
  completed: { label: 'Concluído', color: 'bg-primary/10 text-primary' },
};

const paymentLabels = {
  pending: { label: 'Aguardando', color: 'text-warning' },
  paid: { label: 'Pago', color: 'text-success' },
  failed: { label: 'Falhou', color: 'text-destructive' },
  refunded: { label: 'Reembolsado', color: 'text-muted-foreground' },
};

export const AppointmentCard = ({
  id,
  serviceName,
  partnerName,
  partnerCity,
  dateTime,
  status,
  paymentStatus,
  price,
  onCancel,
  onViewDetails,
}: AppointmentCardProps) => {
  const date = new Date(dateTime);
  const statusInfo = statusLabels[status];
  const paymentInfo = paymentLabels[paymentStatus];
  
  const canCancel = status === 'pending' || status === 'confirmed';
  const showActions = status !== 'canceled' && status !== 'completed';

  return (
    <div className="bg-card rounded-2xl border border-border p-4 shadow-sm">
      {/* Header */}
      <div className="flex justify-between items-start mb-3">
        <div>
          <h3 className="font-semibold text-foreground">{serviceName}</h3>
          <p className="text-sm text-muted-foreground">{partnerName}</p>
        </div>
        <span className={cn(
          "px-2.5 py-1 rounded-full text-xs font-medium",
          statusInfo.color
        )}>
          {statusInfo.label}
        </span>
      </div>

      {/* Details */}
      <div className="space-y-2 mb-4">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Calendar className="w-4 h-4" />
          <span>{format(date, "EEEE, d 'de' MMMM", { locale: ptBR })}</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Clock className="w-4 h-4" />
          <span>{format(date, 'HH:mm')}</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <MapPin className="w-4 h-4" />
          <span>{partnerCity}</span>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <CreditCard className="w-4 h-4 text-muted-foreground" />
          <span className={paymentInfo.color}>
            R$ {price.toFixed(2).replace('.', ',')} - {paymentInfo.label}
          </span>
        </div>
      </div>

      {/* Actions */}
      {showActions && (
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            className="flex-1"
            onClick={() => onViewDetails?.(id)}
          >
            Ver detalhes
          </Button>
          {canCancel && (
            <Button 
              variant="ghost" 
              size="sm"
              className="text-destructive hover:text-destructive hover:bg-destructive/10"
              onClick={() => onCancel?.(id)}
            >
              Cancelar
            </Button>
          )}
        </div>
      )}
    </div>
  );
};
