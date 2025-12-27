import { Star, MapPin } from 'lucide-react';
import { Link } from 'react-router-dom';

interface PartnerCardProps {
  id: string;
  businessName: string;
  category: string;
  city: string;
  neighborhood?: string | null;
  avatarUrl?: string | null;
  coverUrl?: string | null;
  rating: number;
  totalReviews: number;
}

export const PartnerCard = ({
  id,
  businessName,
  category,
  city,
  neighborhood,
  avatarUrl,
  coverUrl,
  rating,
  totalReviews,
}: PartnerCardProps) => {
  return (
    <Link
      to={`/partner/${id}`}
      className="block bg-card rounded-2xl overflow-hidden border border-border shadow-sm hover:shadow-md transition-all duration-200 hover:-translate-y-0.5"
    >
      {/* Cover Image */}
      <div className="relative h-32 bg-gradient-to-br from-primary/20 to-accent/20">
        {coverUrl ? (
          <img
            src={coverUrl}
            alt={businessName}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center">
              <span className="text-2xl font-bold text-primary">
                {businessName.charAt(0)}
              </span>
            </div>
          </div>
        )}
        
        {/* Category Badge */}
        <div className="absolute top-3 left-3">
          <span className="px-2.5 py-1 bg-card/90 backdrop-blur-sm text-xs font-medium rounded-full text-foreground">
            {category}
          </span>
        </div>
      </div>
      
      {/* Content */}
      <div className="p-4">
        <h3 className="font-semibold text-foreground text-lg leading-tight">
          {businessName}
        </h3>
        
        <div className="flex items-center gap-1.5 mt-2 text-muted-foreground text-sm">
          <MapPin className="w-4 h-4 shrink-0" />
          <span className="truncate">
            {neighborhood ? `${neighborhood}, ${city}` : city}
          </span>
        </div>
        
        {/* Rating */}
        <div className="flex items-center gap-2 mt-3">
          <div className="flex items-center gap-1 px-2 py-1 bg-accent/10 rounded-lg">
            <Star className="w-4 h-4 fill-accent text-accent" />
            <span className="font-semibold text-accent text-sm">
              {rating.toFixed(1)}
            </span>
          </div>
          <span className="text-sm text-muted-foreground">
            ({totalReviews} {totalReviews === 1 ? 'avaliação' : 'avaliações'})
          </span>
        </div>
      </div>
    </Link>
  );
};
