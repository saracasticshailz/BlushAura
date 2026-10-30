import type { Product } from '../../types/product';
import { ProductCard, type ProductCardProps } from './ProductCard';
type Props = Pick<ProductCardProps, 'onView' | 'onToggleWishlist' | 'onAdd'> & {
  products: Product[];
  wishlist: string[];
};
export function ProductGrid({ products, wishlist, ...actions }: Props) {
  return (
    <div className="product-grid">
      {products.map((product) => (
        <ProductCard
          key={product.id}
          product={product}
          saved={wishlist.includes(product.id)}
          {...actions}
        />
      ))}
    </div>
  );
}
