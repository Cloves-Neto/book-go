import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ArrowLeft, CreditCard, QrCode, Clock, Calendar, Check, Copy } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

type PaymentMethod = 'credit_card' | 'pix';

interface BookingState {
  partnerId: string;
  serviceId: string;
  serviceName: string;
  partnerName: string;
  price: number;
  duration: number;
  dateTime: string;
}

export default function Payment() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const booking = location.state as BookingState;
  
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('credit_card');
  const [loading, setLoading] = useState(false);
  const [cardData, setCardData] = useState({
    number: '',
    name: '',
    expiry: '',
    cvv: '',
  });
  const [showPixCode, setShowPixCode] = useState(false);
  const pixCode = 'PIX123456789ABCDEF'; // Simulated PIX code

  if (!booking) {
    navigate('/home');
    return null;
  }

  const handleCardChange = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value;
    
    if (field === 'number') {
      value = value.replace(/\D/g, '').slice(0, 16);
      value = value.replace(/(\d{4})/g, '$1 ').trim();
    }
    
    if (field === 'expiry') {
      value = value.replace(/\D/g, '').slice(0, 4);
      if (value.length > 2) {
        value = value.slice(0, 2) + '/' + value.slice(2);
      }
    }
    
    if (field === 'cvv') {
      value = value.replace(/\D/g, '').slice(0, 4);
    }
    
    setCardData(prev => ({ ...prev, [field]: value }));
  };

  const handlePayment = async () => {
    if (!user) return;
    
    if (paymentMethod === 'credit_card') {
      if (!cardData.number || !cardData.name || !cardData.expiry || !cardData.cvv) {
        toast.error('Preencha todos os dados do cartão');
        return;
      }
    }
    
    setLoading(true);
    
    try {
      // Create appointment
      const { data: appointment, error: appointmentError } = await supabase
        .from('appointments')
        .insert({
          user_id: user.id,
          service_id: booking.serviceId,
          partner_id: booking.partnerId,
          date_time: booking.dateTime,
          status: 'pending',
        })
        .select()
        .single();
      
      if (appointmentError) throw appointmentError;
      
      // Create payment
      const { error: paymentError } = await supabase
        .from('payments')
        .insert({
          appointment_id: appointment.id,
          user_id: user.id,
          method: paymentMethod,
          amount: booking.price,
          status: 'paid', // Simulating successful payment
          pix_code: paymentMethod === 'pix' ? pixCode : null,
        });
      
      if (paymentError) throw paymentError;
      
      // Update appointment status to confirmed
      await supabase
        .from('appointments')
        .update({ status: 'confirmed' })
        .eq('id', appointment.id);
      
      navigate('/confirmation', {
        state: {
          ...booking,
          appointmentId: appointment.id,
        },
      });
    } catch (error) {
      toast.error('Erro ao processar pagamento', {
        description: 'Tente novamente mais tarde',
      });
      setLoading(false);
    }
  };

  const copyPixCode = () => {
    navigator.clipboard.writeText(pixCode);
    toast.success('Código PIX copiado!');
  };

  return (
    <div className="min-h-screen bg-background pb-32">
      {/* Header */}
      <header className="bg-card border-b border-border sticky top-0 z-40 pt-safe-top">
        <div className="flex items-center gap-4 px-4 py-4">
          <button 
            onClick={() => navigate(-1)}
            className="p-2 rounded-xl hover:bg-muted transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-foreground" />
          </button>
          <h1 className="text-lg font-semibold text-foreground">Pagamento</h1>
        </div>
      </header>

      {/* Booking Summary */}
      <div className="px-4 py-4">
        <div className="bg-card rounded-xl border border-border p-4">
          <h3 className="font-semibold text-foreground">{booking.serviceName}</h3>
          <p className="text-sm text-muted-foreground">{booking.partnerName}</p>
          
          <div className="flex items-center gap-4 mt-3 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <Calendar className="w-4 h-4" />
              <span>{format(new Date(booking.dateTime), "d 'de' MMM", { locale: ptBR })}</span>
            </div>
            <div className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              <span>{format(new Date(booking.dateTime), 'HH:mm')}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Payment Method Selection */}
      <section className="px-4 py-4">
        <h2 className="text-lg font-semibold text-foreground mb-3">
          Forma de pagamento
        </h2>
        
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => {
              setPaymentMethod('credit_card');
              setShowPixCode(false);
            }}
            className={cn(
              "flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all",
              paymentMethod === 'credit_card'
                ? "border-primary bg-primary/5"
                : "border-border hover:border-primary/50"
            )}
          >
            <CreditCard className={cn(
              "w-8 h-8",
              paymentMethod === 'credit_card' ? "text-primary" : "text-muted-foreground"
            )} />
            <span className={cn(
              "text-sm font-medium",
              paymentMethod === 'credit_card' ? "text-primary" : "text-foreground"
            )}>
              Cartão
            </span>
          </button>
          
          <button
            onClick={() => setPaymentMethod('pix')}
            className={cn(
              "flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all",
              paymentMethod === 'pix'
                ? "border-primary bg-primary/5"
                : "border-border hover:border-primary/50"
            )}
          >
            <QrCode className={cn(
              "w-8 h-8",
              paymentMethod === 'pix' ? "text-primary" : "text-muted-foreground"
            )} />
            <span className={cn(
              "text-sm font-medium",
              paymentMethod === 'pix' ? "text-primary" : "text-foreground"
            )}>
              PIX
            </span>
          </button>
        </div>
      </section>

      {/* Payment Form */}
      <section className="px-4 py-4">
        {paymentMethod === 'credit_card' ? (
          <div className="space-y-4 animate-fade-in">
            <div className="space-y-2">
              <Label htmlFor="cardNumber">Número do cartão</Label>
              <Input
                id="cardNumber"
                placeholder="0000 0000 0000 0000"
                value={cardData.number}
                onChange={handleCardChange('number')}
                className="h-12"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="cardName">Nome no cartão</Label>
              <Input
                id="cardName"
                placeholder="Nome como está no cartão"
                value={cardData.name}
                onChange={handleCardChange('name')}
                className="h-12"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="expiry">Validade</Label>
                <Input
                  id="expiry"
                  placeholder="MM/AA"
                  value={cardData.expiry}
                  onChange={handleCardChange('expiry')}
                  className="h-12"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="cvv">CVV</Label>
                <Input
                  id="cvv"
                  placeholder="123"
                  value={cardData.cvv}
                  onChange={handleCardChange('cvv')}
                  className="h-12"
                />
              </div>
            </div>
          </div>
        ) : (
          <div className="animate-fade-in">
            {!showPixCode ? (
              <div className="text-center py-8">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
                  <QrCode className="w-8 h-8 text-primary" />
                </div>
                <h3 className="font-semibold text-foreground mb-2">
                  Pagamento via PIX
                </h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Clique em pagar para gerar o código PIX
                </p>
              </div>
            ) : (
              <div className="bg-card rounded-xl border border-border p-6 text-center">
                <div className="w-32 h-32 mx-auto mb-4 bg-muted rounded-xl flex items-center justify-center">
                  <QrCode className="w-20 h-20 text-foreground" />
                </div>
                <p className="text-sm text-muted-foreground mb-2">Código PIX</p>
                <div className="flex items-center gap-2 justify-center">
                  <code className="bg-muted px-3 py-1 rounded text-sm">{pixCode}</code>
                  <button onClick={copyPixCode} className="p-2 hover:bg-muted rounded-lg transition-colors">
                    <Copy className="w-4 h-4 text-muted-foreground" />
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </section>

      {/* Fixed Bottom CTA */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-card/95 backdrop-blur-lg border-t border-border safe-area-bottom">
        <div className="flex items-center justify-between mb-3">
          <p className="text-sm text-muted-foreground">Total a pagar</p>
          <p className="text-2xl font-bold text-foreground">
            R$ {booking.price.toFixed(2).replace('.', ',')}
          </p>
        </div>
        <Button 
          size="lg" 
          variant="accent"
          className="w-full"
          disabled={loading}
          onClick={() => {
            if (paymentMethod === 'pix' && !showPixCode) {
              setShowPixCode(true);
            } else {
              handlePayment();
            }
          }}
        >
          {loading ? (
            <div className="w-5 h-5 border-2 border-accent-foreground border-t-transparent rounded-full animate-spin" />
          ) : paymentMethod === 'pix' && !showPixCode ? (
            'Gerar código PIX'
          ) : (
            'Confirmar pagamento'
          )}
        </Button>
      </div>
    </div>
  );
}
