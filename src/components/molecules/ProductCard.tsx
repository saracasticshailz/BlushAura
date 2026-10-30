import { Heart, Plus, Star } from 'lucide-react';
import type { Product } from '../../types/product';
import { money } from '../../utils/currency';
import { Badge } from '../atoms/Badge';
import { Button } from '../atoms/Button';
import { ProductImage } from '../atoms/ProductImage';
export type ProductCardProps = {
  product: Product;
  saved: boolean;
  onView: (product: Product) => void;
  onToggleWishlist: (id: string) => void;
  onAdd: (product: Product) => void;
};
export function ProductCard({
  product: p,
  saved,
  onView,
  onToggleWishlist,
  onAdd,
}: ProductCardProps) {
  return (
    <article className="product-card">
      <div className={`product-image ${p.kind}`}>
        <Button className="art-button" onClick={() => onView(p)} aria-label={`View ${p.name}`}>
          <ProductImage product={p} />
        </Button>
        {p.badge && <Badge>{p.badge}</Badge>}
        <Button
          className={`heart icon-button ${saved ? 'active' : ''}`}
          onClick={() => onToggleWishlist(p.id)}
          aria-label={`${saved ? 'Remove' : 'Save'} ${p.name} ${saved ? 'from' : 'to'} wishlist`}
        >
          <Heart size={18} fill={saved ? 'currentColor' : 'none'} />
        </Button>
      </div>
      <div className="product-rating">
        <Star size={11} fill="currentColor" />
        <span>4.8</span>
        <span className="muted"> · Demo rating</span>
      </div>
      <Button className="product-name" onClick={() => onView(p)}>
        {p.name}
      </Button>
      <p className="product-subtitle">{p.subtitle}</p>
      <div className="price-line">
        <span>{money(p.price)}</span>
        <del>{money(p.original)}</del>
        <Button
          className="add-button"
          onClick={() => onAdd(p)}
          disabled={p.stock === 0}
          aria-label={`Add ${p.name} to bag`}
        >
          <Plus size={17} />
        </Button>
      </div>
    </article>
  );
}
