import { useLocation, useNavigate } from 'react-router-dom';
import { Check, Calendar, Clock, MapPin, CreditCard } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Button } from '@/components/ui/button';

interface ConfirmationState {
  serviceName: string;
  partnerName: string;
  price: number;
  dateTime: string;
  appointmentId: string;
}

export default function Confirmation() {
  const location = useLocation();
  const navigate = useNavigate();
  const booking = location.state as ConfirmationState;

  if (!booking) {
    navigate('/home');
    return null;
  }

  const dateTime = new Date(booking.dateTime);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Success Animation */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-12">
        <div className="w-24 h-24 rounded-full bg-success/10 flex items-center justify-center mb-6 animate-scale-in">
          <div className="w-16 h-16 rounded-full bg-success flex items-center justify-center">
            <Check className="w-8 h-8 text-success-foreground" />
          </div>
        </div>
        
        <h1 className="text-2xl font-bold text-foreground text-center mb-2 animate-fade-in">
          Agendamento Confirmado!
        </h1>
        <p className="text-muted-foreground text-center animate-fade-in" style={{ animationDelay: '0.1s' }}>
          Seu pagamento foi aprovado e o serviço foi agendado
        </p>

        {/* Booking Details */}
        <div className="w-full max-w-sm mt-8 animate-slide-up" style={{ animationDelay: '0.2s' }}>
          <div className="bg-card rounded-2xl border border-border p-5 shadow-sm">
            <h3 className="font-semibold text-foreground text-lg mb-1">
              {booking.serviceName}
            </h3>
            <p className="text-muted-foreground text-sm mb-4">
              {booking.partnerName}
            </p>

            <div className="space-y-3">
              <div className="flex items-center gap-3 text-sm">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                  <Calendar className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-muted-foreground">Data</p>
                  <p className="font-medium text-foreground">
                    {format(dateTime, "EEEE, d 'de' MMMM", { locale: ptBR })}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 text-sm">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                  <Clock className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-muted-foreground">Horário</p>
                  <p className="font-medium text-foreground">
                    {format(dateTime, 'HH:mm')}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 text-sm">
                <div className="w-10 h-10 rounded-xl bg-success/10 flex items-center justify-center shrink-0">
                  <CreditCard className="w-5 h-5 text-success" />
                </div>
                <div>
                  <p className="text-muted-foreground">Pagamento</p>
                  <p className="font-medium text-success">
                    R$ {booking.price.toFixed(2).replace('.', ',')} - Pago
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Info Card */}
          <div className="bg-accent/10 rounded-xl p-4 mt-4">
            <p className="text-sm text-foreground">
              <strong>Lembrete:</strong> Você receberá uma notificação antes do horário agendado. 
              Em caso de cancelamento, entre em contato com o profissional.
            </p>
          </div>
        </div>
      </div>

      {/* Bottom Actions */}
      <div className="p-4 safe-area-bottom">
        <div className="max-w-sm mx-auto space-y-3">
          <Button 
            size="lg" 
            className="w-full"
            onClick={() => navigate('/appointments')}
          >
            Ver meus agendamentos
          </Button>
          <Button 
            variant="outline" 
            size="lg" 
            className="w-full"
            onClick={() => navigate('/home')}
          >
            Voltar para início
          </Button>
        </div>
      </div>
    </div>
  );
}
