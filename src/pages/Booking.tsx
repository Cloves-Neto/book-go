import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Calendar as CalendarIcon, Clock } from 'lucide-react';
import { format, addDays, isSameDay, setHours, setMinutes, isAfter } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { cn } from '@/lib/utils';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';

interface Service {
  id: string;
  name: string;
  description: string | null;
  price: number;
  duration: number;
  partner_id: string;
}

interface Partner {
  id: string;
  business_name: string;
}

const generateTimeSlots = () => {
  const slots: string[] = [];
  for (let hour = 8; hour <= 18; hour++) {
    slots.push(`${hour.toString().padStart(2, '0')}:00`);
    if (hour < 18) {
      slots.push(`${hour.toString().padStart(2, '0')}:30`);
    }
  }
  return slots;
};

export default function Booking() {
  const { partnerId, serviceId } = useParams<{ partnerId: string; serviceId: string }>();
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const [service, setService] = useState<Service | null>(null);
  const [partner, setPartner] = useState<Partner | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [bookedSlots, setBookedSlots] = useState<string[]>([]);

  const dates = Array.from({ length: 14 }, (_, i) => addDays(new Date(), i));
  const timeSlots = generateTimeSlots();

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/');
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (serviceId && partnerId) {
      fetchData();
    }
  }, [serviceId, partnerId]);

  useEffect(() => {
    if (selectedDate && partnerId) {
      fetchBookedSlots();
    }
  }, [selectedDate, partnerId]);

  const fetchData = async () => {
    setLoading(true);
    
    const [serviceRes, partnerRes] = await Promise.all([
      supabase.from('services').select('*').eq('id', serviceId).single(),
      supabase.from('partners').select('id, business_name').eq('id', partnerId).single(),
    ]);
    
    if (serviceRes.data) setService(serviceRes.data);
    if (partnerRes.data) setPartner(partnerRes.data);
    
    setLoading(false);
  };

  const fetchBookedSlots = async () => {
    if (!selectedDate) return;
    
    const startOfDay = new Date(selectedDate);
    startOfDay.setHours(0, 0, 0, 0);
    
    const endOfDay = new Date(selectedDate);
    endOfDay.setHours(23, 59, 59, 999);
    
    const { data } = await supabase
      .from('appointments')
      .select('date_time')
      .eq('partner_id', partnerId)
      .gte('date_time', startOfDay.toISOString())
      .lte('date_time', endOfDay.toISOString())
      .in('status', ['pending', 'confirmed']);
    
    if (data) {
      setBookedSlots(data.map(a => format(new Date(a.date_time), 'HH:mm')));
    }
  };

  const isSlotAvailable = (time: string) => {
    if (!selectedDate) return false;
    
    const [hours, minutes] = time.split(':').map(Number);
    const slotDate = setMinutes(setHours(selectedDate, hours), minutes);
    
    // Check if slot is in the past
    if (!isAfter(slotDate, new Date())) return false;
    
    // Check if slot is already booked
    if (bookedSlots.includes(time)) return false;
    
    return true;
  };

  const handleContinue = () => {
    if (selectedDate && selectedTime && service) {
      const [hours, minutes] = selectedTime.split(':').map(Number);
      const dateTime = setMinutes(setHours(selectedDate, hours), minutes);
      
      navigate('/payment', {
        state: {
          partnerId,
          serviceId,
          serviceName: service.name,
          partnerName: partner?.business_name,
          price: Number(service.price),
          duration: service.duration,
          dateTime: dateTime.toISOString(),
        },
      });
    }
  };

  if (loading || authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!service || !partner) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <p className="text-muted-foreground">Serviço não encontrado</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-28">
      {/* Header */}
      <header className="bg-card border-b border-border sticky top-0 z-40 pt-safe-top">
        <div className="flex items-center gap-4 px-4 py-4">
          <button 
            onClick={() => navigate(-1)}
            className="p-2 rounded-xl hover:bg-muted transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-foreground" />
          </button>
          <h1 className="text-lg font-semibold text-foreground">Agendar</h1>
        </div>
      </header>

      {/* Service Summary */}
      <div className="px-4 py-4">
        <div className="bg-card rounded-xl border border-border p-4">
          <h3 className="font-semibold text-foreground">{service.name}</h3>
          <p className="text-sm text-muted-foreground">{partner.business_name}</p>
          <div className="flex items-center justify-between mt-3">
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <Clock className="w-4 h-4" />
              <span>{service.duration} min</span>
            </div>
            <p className="text-lg font-bold text-primary">
              R$ {Number(service.price).toFixed(2).replace('.', ',')}
            </p>
          </div>
        </div>
      </div>

      {/* Date Selection */}
      <section className="px-4 py-4">
        <h2 className="text-lg font-semibold text-foreground mb-3 flex items-center gap-2">
          <CalendarIcon className="w-5 h-5 text-primary" />
          Selecione a data
        </h2>
        
        <ScrollArea className="w-full whitespace-nowrap -mx-4 px-4">
          <div className="flex gap-2 py-1">
            {dates.map((date) => {
              const isSelected = selectedDate && isSameDay(date, selectedDate);
              const isToday = isSameDay(date, new Date());
              
              return (
                <button
                  key={date.toISOString()}
                  onClick={() => {
                    setSelectedDate(date);
                    setSelectedTime(null);
                  }}
                  className={cn(
                    "flex flex-col items-center justify-center w-16 h-20 rounded-xl shrink-0 transition-all",
                    isSelected
                      ? "bg-primary text-primary-foreground shadow-md"
                      : "bg-card border border-border hover:border-primary/50"
                  )}
                >
                  <span className={cn(
                    "text-xs font-medium uppercase",
                    isSelected ? "text-primary-foreground/80" : "text-muted-foreground"
                  )}>
                    {format(date, 'EEE', { locale: ptBR })}
                  </span>
                  <span className={cn(
                    "text-xl font-bold",
                    isSelected ? "text-primary-foreground" : "text-foreground"
                  )}>
                    {format(date, 'd')}
                  </span>
                  <span className={cn(
                    "text-xs",
                    isSelected ? "text-primary-foreground/80" : "text-muted-foreground"
                  )}>
                    {format(date, 'MMM', { locale: ptBR })}
                  </span>
                  {isToday && (
                    <span className={cn(
                      "text-[10px] font-medium",
                      isSelected ? "text-primary-foreground" : "text-primary"
                    )}>
                      Hoje
                    </span>
                  )}
                </button>
              );
            })}
          </div>
          <ScrollBar orientation="horizontal" className="invisible" />
        </ScrollArea>
      </section>

      {/* Time Selection */}
      {selectedDate && (
        <section className="px-4 py-4 animate-fade-in">
          <h2 className="text-lg font-semibold text-foreground mb-3 flex items-center gap-2">
            <Clock className="w-5 h-5 text-primary" />
            Selecione o horário
          </h2>
          
          <div className="grid grid-cols-4 gap-2">
            {timeSlots.map((time) => {
              const isAvailable = isSlotAvailable(time);
              const isSelected = selectedTime === time;
              
              return (
                <button
                  key={time}
                  onClick={() => isAvailable && setSelectedTime(time)}
                  disabled={!isAvailable}
                  className={cn(
                    "py-3 rounded-xl text-sm font-medium transition-all",
                    isSelected
                      ? "bg-primary text-primary-foreground shadow-md"
                      : isAvailable
                        ? "bg-card border border-border hover:border-primary/50 text-foreground"
                        : "bg-muted text-muted-foreground cursor-not-allowed"
                  )}
                >
                  {time}
                </button>
              );
            })}
          </div>
        </section>
      )}

      {/* Fixed Bottom CTA */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-card/95 backdrop-blur-lg border-t border-border safe-area-bottom">
        <div className="flex items-center justify-between mb-3">
          <div>
            <p className="text-sm text-muted-foreground">Total</p>
            <p className="text-xl font-bold text-foreground">
              R$ {Number(service.price).toFixed(2).replace('.', ',')}
            </p>
          </div>
          {selectedDate && selectedTime && (
            <div className="text-right">
              <p className="text-sm text-muted-foreground">
                {format(selectedDate, "d 'de' MMM", { locale: ptBR })}
              </p>
              <p className="font-medium text-foreground">{selectedTime}</p>
            </div>
          )}
        </div>
        <Button 
          size="lg" 
          className="w-full"
          disabled={!selectedDate || !selectedTime}
          onClick={handleContinue}
        >
          Continuar para pagamento
        </Button>
      </div>
    </div>
  );
}
