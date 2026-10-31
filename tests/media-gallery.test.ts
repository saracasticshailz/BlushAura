import { describe, expect, it } from 'vitest';
import { productMedia } from '../src/utils/media';
import { products } from '../src/data/catalog';

describe('Existing covers and ordered mixed galleries', () => {
  it('keeps an existing cover first when adding gallery media', () => {
    expect(
      productMedia({
        ...products[0],
        imageUrl: '/cover',
        media: [{ url: '/clip', type: 'video', caption: 'A ritual' }],
      }).map((item) => item.url),
    ).toEqual(['/cover', '/clip']);
  });
  it('preserves admin ordering when the cover is already in the gallery', () => {
    const media = [
      { url: '/clip', type: 'video' as const, caption: 'A ritual' },
      { url: '/cover', type: 'image' as const, caption: 'Close-up' },
    ];
    expect(productMedia({ ...products[0], imageUrl: '/cover', media })).toEqual(media);
  });
  it('supports legacy illustrated products without gallery media', () => {
    expect(productMedia({ ...products[0], imageUrl: undefined, media: undefined })).toEqual([]);
  });
});
