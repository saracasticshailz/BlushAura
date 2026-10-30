import type { Product } from '../../types/product';
import { ProductArt } from './ProductArt';
export function ProductImage({ product }: { product: Product }) {
  return product.imageUrl ? (
    <img className="product-photo" src={product.imageUrl} alt={product.name} />
  ) : (
    <ProductArt kind={product.kind} color={product.color} />
  );
}
