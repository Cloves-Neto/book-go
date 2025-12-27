import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Calendar, Shield, CreditCard, Star } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

const features = [
  {
    icon: Calendar,
    title: 'Agende Fácil',
    description: 'Encontre e reserve serviços em segundos',
  },
  {
    icon: CreditCard,
    title: 'Pagamento Seguro',
    description: 'Pague antecipadamente com cartão ou PIX',
  },
  {
    icon: Shield,
    title: '100% Garantido',
    description: 'Profissionais verificados e confiáveis',
  },
  {
    icon: Star,
    title: 'Avaliações Reais',
    description: 'Escolha baseado em opiniões reais',
  },
];

export default function Landing() {
  const navigate = useNavigate();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading && user) {
      navigate('/home');
    }
  }, [user, loading, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div 
        className="relative min-h-[70vh] flex flex-col items-center justify-center px-6 text-center overflow-hidden"
        style={{
          background: 'linear-gradient(180deg, hsl(210 100% 45%) 0%, hsl(210 100% 30%) 100%)',
        }}
      >
        {/* Background decoration */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-1/2 -right-1/2 w-full h-full rounded-full bg-accent/10 blur-3xl" />
          <div className="absolute -bottom-1/2 -left-1/2 w-full h-full rounded-full bg-primary-light/20 blur-3xl" />
        </div>
        
        <div className="relative z-10 max-w-md mx-auto">
          {/* Logo/Brand */}
          <div className="mb-6 animate-fade-in">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-card/10 backdrop-blur-lg mb-4">
              <Calendar className="w-10 h-10 text-accent" />
            </div>
            <h1 className="text-4xl font-bold text-primary-foreground mb-2">
              AgendaFácil
            </h1>
            <p className="text-lg text-primary-foreground/80">
              Serviços profissionais na palma da sua mão
            </p>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col gap-3 mt-8 animate-slide-up" style={{ animationDelay: '0.2s' }}>
            <Button 
              variant="hero" 
              size="xl"
              onClick={() => navigate('/register')}
              className="w-full"
            >
              Começar Agora
            </Button>
            <Button 
              variant="glass" 
              size="lg"
              onClick={() => navigate('/login')}
              className="w-full text-primary-foreground border-primary-foreground/20"
            >
              Já tenho conta
            </Button>
          </div>
        </div>

        {/* Wave decoration */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full">
            <path 
              d="M0 120L60 105C120 90 240 60 360 45C480 30 600 30 720 37.5C840 45 960 60 1080 67.5C1200 75 1320 75 1380 75L1440 75V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z" 
              fill="hsl(var(--background))"
            />
          </svg>
        </div>
      </div>

      {/* Features Section */}
      <div className="px-6 py-12 max-w-md mx-auto">
        <h2 className="text-2xl font-bold text-foreground text-center mb-8">
          Por que usar o AgendaFácil?
        </h2>
        
        <div className="grid grid-cols-2 gap-4">
          {features.map((feature, index) => (
            <div 
              key={feature.title}
              className="p-4 rounded-2xl bg-card border border-border shadow-sm animate-fade-in"
              style={{ animationDelay: `${0.3 + index * 0.1}s` }}
            >
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-3">
                <feature.icon className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-semibold text-foreground mb-1">{feature.title}</h3>
              <p className="text-sm text-muted-foreground">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom CTA */}
      <div className="px-6 pb-12 max-w-md mx-auto">
        <div className="p-6 rounded-2xl bg-gradient-to-br from-primary to-primary-dark text-primary-foreground text-center">
          <h3 className="text-xl font-bold mb-2">Pronto para começar?</h3>
          <p className="text-sm text-primary-foreground/80 mb-4">
            Junte-se a milhares de clientes satisfeitos
          </p>
          <Button 
            variant="hero" 
            size="lg"
            onClick={() => navigate('/register')}
            className="w-full"
          >
            Criar Conta Grátis
          </Button>
        </div>
      </div>
    </div>
  );
}
