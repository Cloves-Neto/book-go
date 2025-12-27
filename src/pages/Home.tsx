import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppLayout } from '@/components/layout/AppLayout';
import { SearchInput } from '@/components/common/SearchInput';
import { CategoryFilter } from '@/components/common/CategoryFilter';
import { PartnerCard } from '@/components/common/PartnerCard';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { MapPin } from 'lucide-react';

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

export default function Home() {
  const navigate = useNavigate();
  const { user, profile, loading: authLoading } = useAuth();
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('all');
  const [partners, setPartners] = useState<Partner[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/');
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    fetchPartners();
  }, [category, search]);

  const fetchPartners = async () => {
    setLoading(true);
    
    let query = supabase
      .from('partners')
      .select('*')
      .eq('is_active', true);
    
    if (category !== 'all') {
      query = query.ilike('category', `%${category}%`);
    }
    
    if (search) {
      query = query.or(`business_name.ilike.%${search}%,city.ilike.%${search}%,neighborhood.ilike.%${search}%`);
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
      <header className="bg-primary pt-safe-top">
        <div className="px-4 pt-6 pb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-primary-foreground/70 text-sm">Olá,</p>
              <h1 className="text-xl font-bold text-primary-foreground">
                {profile?.name || 'Visitante'}
              </h1>
            </div>
            <button className="flex items-center gap-1.5 px-3 py-1.5 bg-primary-foreground/10 rounded-full">
              <MapPin className="w-4 h-4 text-primary-foreground" />
              <span className="text-sm text-primary-foreground">São Paulo</span>
            </button>
          </div>
          
          <SearchInput 
            value={search} 
            onChange={setSearch} 
            placeholder="Buscar serviço ou profissional..."
          />
        </div>
      </header>

      {/* Categories */}
      <section className="py-4 -mt-2 bg-background rounded-t-3xl">
        <CategoryFilter selected={category} onSelect={setCategory} />
      </section>

      {/* Partners List */}
      <section className="px-4 pb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-foreground">
            {category === 'all' ? 'Profissionais em destaque' : `Profissionais de ${category}`}
          </h2>
          <span className="text-sm text-muted-foreground">
            {partners.length} {partners.length === 1 ? 'resultado' : 'resultados'}
          </span>
        </div>

        {loading ? (
          <div className="grid gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-48 rounded-2xl bg-muted shimmer" />
            ))}
          </div>
        ) : partners.length > 0 ? (
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
        ) : (
          <div className="text-center py-12">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
              <MapPin className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="font-semibold text-foreground mb-1">
              Nenhum profissional encontrado
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
