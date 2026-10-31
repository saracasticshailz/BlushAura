import type { Product } from '../../../types/product';
import { productMedia } from '../../../utils/media';
import { ProductArt } from '../../atoms/ProductArt';
import { MediaCarousel, type MediaSlide } from '../../molecules/MediaCarousel';

export function HomeMediaShowcase({ products }: { products: Product[] }) {
  const uploaded: MediaSlide[] = products
    .flatMap((product) =>
      productMedia(product).map((media) => ({
        id: product.id + media.url,
        media,
        label: media.caption || product.name,
        poster: product.imageUrl || undefined,
        fallback: <ProductArt kind={product.kind} color={product.color} />,
      })),
    )
    .slice(0, 6);
  const scenes: MediaSlide[] = [
    { id: 'everyday', label: 'Your everyday, reimagined', fallback: <ProductArt hero /> },
    {
      id: 'golden',
      label: 'Golden moments. Softer evenings.',
      fallback: (
        <div className="showcase-scene scene-golden">
          <span>
            slow down.
            <br />
            <em>glow on.</em>
          </span>
          <ProductArt kind="oil" color="#ba8c50" />
          <i>THE GOLDEN HOUR RITUAL</i>
        </div>
      ),
    },
    {
      id: 'unwind',
      label: 'A little more room for you',
      fallback: (
        <div className="showcase-scene scene-unwind">
          <span>
            good things.
            <br />
            <em>little rituals.</em>
          </span>
          <ProductArt kind="bundle" color="#b47780" />
          <i>UNWRAP YOUR FEEL-GOOD</i>
        </div>
      ),
    },
  ];
  return (
    <div className="hero-art hero-showcase">
      <MediaCarousel
        label="Featured rituals"
        className="hero-carousel"
        slides={uploaded.length ? [...uploaded, ...scenes].slice(0, 8) : scenes}
      />
      <span className="showcase-sticker">
        A LITTLE
        <br />
        <em>feel-good</em>
        <br />
        EVERY DAY ✦
      </span>
    </div>
  );
}
