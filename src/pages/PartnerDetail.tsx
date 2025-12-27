import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Star, MapPin, Phone, Clock, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ServiceCard } from '@/components/common/ServiceCard';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

interface Partner {
  id: string;
  business_name: string;
  description: string | null;
  category: string;
  city: string;
  neighborhood: string | null;
  address: string | null;
  phone: string | null;
  avatar_url: string | null;
  cover_url: string | null;
  rating: number;
  total_reviews: number;
}

interface Service {
  id: string;
  name: string;
  description: string | null;
  price: number;
  duration: number;
}

interface Review {
  id: string;
  rating: number;
  comment: string | null;
  created_at: string;
  profiles: {
    name: string;
    avatar_url: string | null;
  } | null;
}

export default function PartnerDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const [partner, setPartner] = useState<Partner | null>(null);
  const [services, setServices] = useState<Service[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [selectedService, setSelectedService] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/');
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (id) {
      fetchPartnerData();
    }
  }, [id]);

  const fetchPartnerData = async () => {
    setLoading(true);
    
    // Fetch partner details
    const { data: partnerData } = await supabase
      .from('partners')
      .select('*')
      .eq('id', id)
      .single();
    
    if (partnerData) {
      setPartner(partnerData);
    }
    
    // Fetch services
    const { data: servicesData } = await supabase
      .from('services')
      .select('*')
      .eq('partner_id', id)
      .eq('is_active', true)
      .order('price');
    
    if (servicesData) {
      setServices(servicesData);
    }
    
    // Fetch reviews with profile info
    const { data: reviewsData } = await supabase
      .from('reviews')
      .select(`
        id,
        rating,
        comment,
        created_at,
        profiles (
          name,
          avatar_url
        )
      `)
      .eq('partner_id', id)
      .order('created_at', { ascending: false })
      .limit(5);
    
    if (reviewsData) {
      setReviews(reviewsData as Review[]);
    }
    
    setLoading(false);
  };

  const handleContinue = () => {
    if (selectedService && partner) {
      navigate(`/booking/${partner.id}/${selectedService}`);
    }
  };

  if (loading || authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!partner) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <p className="text-muted-foreground">Profissional não encontrado</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Cover & Header */}
      <div className="relative">
        <div className="h-48 bg-gradient-to-br from-primary/20 to-accent/20">
          {partner.cover_url && (
            <img 
              src={partner.cover_url} 
              alt={partner.business_name}
              className="w-full h-full object-cover"
            />
          )}
        </div>
        
        <button
          onClick={() => navigate(-1)}
          className="absolute top-4 left-4 p-2 rounded-full bg-card/80 backdrop-blur-sm shadow-md"
        >
          <ArrowLeft className="w-5 h-5 text-foreground" />
        </button>
      </div>

      {/* Partner Info */}
      <div className="px-4 -mt-8 relative z-10">
        <div className="bg-card rounded-2xl border border-border shadow-lg p-4">
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
              {partner.avatar_url ? (
                <img 
                  src={partner.avatar_url} 
                  alt={partner.business_name}
                  className="w-full h-full rounded-xl object-cover"
                />
              ) : (
                <span className="text-2xl font-bold text-primary">
                  {partner.business_name.charAt(0)}
                </span>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <h1 className="text-xl font-bold text-foreground truncate">
                {partner.business_name}
              </h1>
              <p className="text-sm text-muted-foreground">{partner.category}</p>
              <div className="flex items-center gap-2 mt-1">
                <div className="flex items-center gap-1">
                  <Star className="w-4 h-4 fill-accent text-accent" />
                  <span className="font-semibold text-foreground">{Number(partner.rating).toFixed(1)}</span>
                </div>
                <span className="text-sm text-muted-foreground">
                  ({partner.total_reviews} avaliações)
                </span>
              </div>
            </div>
          </div>

          {partner.description && (
            <p className="text-sm text-muted-foreground mt-4">{partner.description}</p>
          )}

          <div className="mt-4 space-y-2">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <MapPin className="w-4 h-4 shrink-0" />
              <span>{partner.address || `${partner.neighborhood || ''} ${partner.city}`}</span>
            </div>
            {partner.phone && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Phone className="w-4 h-4 shrink-0" />
                <span>{partner.phone}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Services */}
      <section className="px-4 mt-6">
        <h2 className="text-lg font-semibold text-foreground mb-4">Serviços</h2>
        <div className="space-y-3">
          {services.map((service) => (
            <ServiceCard
              key={service.id}
              id={service.id}
              name={service.name}
              description={service.description}
              price={Number(service.price)}
              duration={service.duration}
              selected={selectedService === service.id}
              onSelect={setSelectedService}
            />
          ))}
        </div>
      </section>

      {/* Reviews */}
      {reviews.length > 0 && (
        <section className="px-4 mt-6">
          <h2 className="text-lg font-semibold text-foreground mb-4">Avaliações</h2>
          <div className="space-y-4">
            {reviews.map((review) => (
              <div key={review.id} className="bg-card rounded-xl border border-border p-4">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <span className="text-sm font-medium text-primary">
                      {review.profiles?.name?.charAt(0) || '?'}
                    </span>
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-foreground">{review.profiles?.name || 'Anônimo'}</p>
                    <div className="flex items-center gap-1">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star 
                          key={i} 
                          className={`w-3 h-3 ${i < review.rating ? 'fill-accent text-accent' : 'text-muted'}`}
                        />
                      ))}
                    </div>
                  </div>
                </div>
                {review.comment && (
                  <p className="text-sm text-muted-foreground">{review.comment}</p>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Fixed Bottom CTA */}
      {services.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-card/95 backdrop-blur-lg border-t border-border safe-area-bottom">
          <Button 
            size="lg" 
            className="w-full"
            disabled={!selectedService}
            onClick={handleContinue}
          >
            {selectedService ? 'Continuar para agendamento' : 'Selecione um serviço'}
          </Button>
        </div>
      )}
    </div>
  );
}
