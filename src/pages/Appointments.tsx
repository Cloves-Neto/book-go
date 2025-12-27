import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppLayout } from '@/components/layout/AppLayout';
import { AppointmentCard } from '@/components/common/AppointmentCard';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Calendar } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';

interface AppointmentWithDetails {
  id: string;
  date_time: string;
  status: 'pending' | 'confirmed' | 'canceled' | 'completed';
  services: {
    name: string;
    price: number;
  };
  partners: {
    business_name: string;
    city: string;
  };
  payments: {
    status: 'pending' | 'paid' | 'failed' | 'refunded';
  }[];
}

export default function Appointments() {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const [appointments, setAppointments] = useState<AppointmentWithDetails[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/');
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (user) {
      fetchAppointments();
    }
  }, [user]);

  const fetchAppointments = async () => {
    if (!user) return;
    
    setLoading(true);
    
    const { data, error } = await supabase
      .from('appointments')
      .select(`
        id,
        date_time,
        status,
        services (
          name,
          price
        ),
        partners (
          business_name,
          city
        ),
        payments (
          status
        )
      `)
      .eq('user_id', user.id)
      .order('date_time', { ascending: false });
    
    if (data && !error) {
      setAppointments(data as AppointmentWithDetails[]);
    }
    
    setLoading(false);
  };

  const handleCancel = async (id: string) => {
    const { error } = await supabase
      .from('appointments')
      .update({ status: 'canceled' })
      .eq('id', id);
    
    if (!error) {
      toast.success('Agendamento cancelado');
      fetchAppointments();
    } else {
      toast.error('Erro ao cancelar agendamento');
    }
  };

  const upcomingAppointments = appointments.filter(
    a => a.status !== 'canceled' && a.status !== 'completed' && new Date(a.date_time) >= new Date()
  );
  
  const pastAppointments = appointments.filter(
    a => a.status === 'completed' || a.status === 'canceled' || new Date(a.date_time) < new Date()
  );

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <AppLayout>
      {/* Header */}
      <header className="bg-card border-b border-border sticky top-0 z-40 pt-safe-top">
        <div className="px-4 py-4">
          <h1 className="text-xl font-bold text-foreground">Meus Agendamentos</h1>
        </div>
      </header>

      <div className="px-4 py-4">
        <Tabs defaultValue="upcoming" className="w-full">
          <TabsList className="w-full mb-4">
            <TabsTrigger value="upcoming" className="flex-1">
              Próximos ({upcomingAppointments.length})
            </TabsTrigger>
            <TabsTrigger value="past" className="flex-1">
              Histórico ({pastAppointments.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="upcoming">
            {loading ? (
              <div className="space-y-4">
                {[1, 2].map((i) => (
                  <div key={i} className="h-40 rounded-2xl bg-muted shimmer" />
                ))}
              </div>
            ) : upcomingAppointments.length > 0 ? (
              <div className="space-y-4">
                {upcomingAppointments.map((appointment) => (
                  <AppointmentCard
                    key={appointment.id}
                    id={appointment.id}
                    serviceName={appointment.services?.name || 'Serviço'}
                    partnerName={appointment.partners?.business_name || 'Profissional'}
                    partnerCity={appointment.partners?.city || ''}
                    dateTime={appointment.date_time}
                    status={appointment.status}
                    paymentStatus={appointment.payments?.[0]?.status || 'pending'}
                    price={Number(appointment.services?.price || 0)}
                    onCancel={handleCancel}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
                  <Calendar className="w-8 h-8 text-muted-foreground" />
                </div>
                <h3 className="font-semibold text-foreground mb-1">
                  Nenhum agendamento
                </h3>
                <p className="text-sm text-muted-foreground">
                  Você ainda não tem agendamentos próximos
                </p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="past">
            {loading ? (
              <div className="space-y-4">
                {[1, 2].map((i) => (
                  <div key={i} className="h-40 rounded-2xl bg-muted shimmer" />
                ))}
              </div>
            ) : pastAppointments.length > 0 ? (
              <div className="space-y-4">
                {pastAppointments.map((appointment) => (
                  <AppointmentCard
                    key={appointment.id}
                    id={appointment.id}
                    serviceName={appointment.services?.name || 'Serviço'}
                    partnerName={appointment.partners?.business_name || 'Profissional'}
                    partnerCity={appointment.partners?.city || ''}
                    dateTime={appointment.date_time}
                    status={appointment.status}
                    paymentStatus={appointment.payments?.[0]?.status || 'pending'}
                    price={Number(appointment.services?.price || 0)}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
                  <Calendar className="w-8 h-8 text-muted-foreground" />
                </div>
                <h3 className="font-semibold text-foreground mb-1">
                  Sem histórico
                </h3>
                <p className="text-sm text-muted-foreground">
                  Seu histórico de agendamentos aparecerá aqui
                </p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
}
