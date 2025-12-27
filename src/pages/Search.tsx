import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppLayout } from '@/components/layout/AppLayout';
import { SearchInput } from '@/components/common/SearchInput';
import { PartnerCard } from '@/components/common/PartnerCard';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { MapPin, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Partner {
  id: string;
  business_name: string;
  category: string;
  city: string;
  neighborhood: string | null;
  avatar_url: string | null;
  cover_url: string | null;
  rating: number;
  total_reviews: number;
}

export default function Search() {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const [search, setSearch] = useState('');
  const [city, setCity] = useState('');
  const [partners, setPartners] = useState<Partner[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/');
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (search || city) {
      const timer = setTimeout(() => {
        fetchPartners();
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [search, city]);

  const fetchPartners = async () => {
    setLoading(true);
    setHasSearched(true);
    
    let query = supabase
      .from('partners')
      .select('*')
      .eq('is_active', true);
    
    if (search) {
      query = query.or(`business_name.ilike.%${search}%,category.ilike.%${search}%`);
    }
    
    if (city) {
      query = query.or(`city.ilike.%${city}%,neighborhood.ilike.%${city}%`);
    }
    
    const { data, error } = await query.order('rating', { ascending: false });
    
    if (data && !error) {
      setPartners(data);
    }
    
    setLoading(false);
  };

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
          <h1 className="text-xl font-bold text-foreground mb-4">Buscar</h1>
          
          <div className="space-y-3">
            <SearchInput 
              value={search} 
              onChange={setSearch} 
              placeholder="Serviço ou profissional..."
            />
            
            <div className="flex gap-2">
              <div className="relative flex-1">
                <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="Cidade ou bairro"
                  className="w-full h-10 pl-10 pr-4 bg-muted rounded-xl text-sm border-0 focus:ring-2 focus:ring-primary outline-none"
                />
              </div>
              <Button variant="outline" size="icon" className="h-10 w-10 shrink-0">
                <Filter className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Results */}
      <section className="px-4 py-6">
        {!hasSearched ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
              <MapPin className="w-8 h-8 text-primary" />
            </div>
            <h3 className="font-semibold text-foreground mb-1">
              Encontre o profissional ideal
            </h3>
            <p className="text-sm text-muted-foreground">
              Busque por serviço, nome ou localização
            </p>
          </div>
        ) : loading ? (
          <div className="grid gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-48 rounded-2xl bg-muted shimmer" />
            ))}
          </div>
        ) : partners.length > 0 ? (
          <>
            <p className="text-sm text-muted-foreground mb-4">
              {partners.length} {partners.length === 1 ? 'resultado encontrado' : 'resultados encontrados'}
            </p>
            <div className="grid gap-4">
              {partners.map((partner) => (
                <PartnerCard
                  key={partner.id}
                  id={partner.id}
                  businessName={partner.business_name}
                  category={partner.category}
                  city={partner.city}
                  neighborhood={partner.neighborhood}
                  avatarUrl={partner.avatar_url}
                  coverUrl={partner.cover_url}
                  rating={Number(partner.rating)}
                  totalReviews={partner.total_reviews}
                />
              ))}
            </div>
          </>
        ) : (
          <div className="text-center py-12">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
              <MapPin className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="font-semibold text-foreground mb-1">
              Nenhum resultado encontrado
            </h3>
            <p className="text-sm text-muted-foreground">
              Tente buscar com outros termos
            </p>
          </div>
        )}
      </section>
    </AppLayout>
  );
}
