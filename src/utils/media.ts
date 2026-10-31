import type { Product, ProductMedia } from '../types/product';

export function productMedia(product: Product): ProductMedia[] {
  const media = product.media ?? [];
  return product.imageUrl && !media.some((item) => item.url === product.imageUrl)
    ? [{ url: product.imageUrl, type: 'image', caption: product.name }, ...media]
    : media;
}
