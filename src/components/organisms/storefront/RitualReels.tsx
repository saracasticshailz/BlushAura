import { ArrowRight, Film } from 'lucide-react';
import { useRef } from 'react';
import type { Product } from '../../../types/product';
import { productMedia } from '../../../utils/media';
import { Button } from '../../atoms/Button';
import { MediaFrame } from '../../atoms/MediaFrame';
import { ProductArt } from '../../atoms/ProductArt';

export function RitualReels({
  products,
  onView,
}: {
  products: Product[];
  onView: (product: Product) => void;
}) {
  const rail = useRef<HTMLDivElement>(null);
  const clips = products.flatMap((product) =>
    (product.media ?? [])
      .filter((media) => media.type === 'video')
      .map((media) => ({ product, media })),
  );
  const fillers = products
    .filter((product) => !clips.some((clip) => clip.product.id === product.id))
    .map((product) => ({ product, media: productMedia(product)[0] }));
  const cards = clips.length
    ? [...clips, ...fillers.slice(0, Math.max(0, 4 - clips.length))].slice(0, 12)
    : fillers.slice(0, 4);
  if (!cards.length) return null;
  return (
    <section className="section ritual-section">
      <div className="section-heading">
        <div>
          <div className="eyebrow">THE FEEL-GOOD EDIT</div>
          <h2>
            Little rituals. <em>In motion.</em>
          </h2>
          <p className="section-intro">A closer look at the little things that make your day.</p>
        </div>
        <Button
          variant="text"
          onClick={() => rail.current?.scrollBy({ left: 320, behavior: 'smooth' })}
          aria-label="See more rituals"
        >
          Explore the edit <ArrowRight size={19} />
        </Button>
      </div>
      <div ref={rail} className="reel-rail" aria-label="Shoppable rituals">
        {cards.map(({ product, media }, index) => (
          <article
            className={`reel-card reel-tone-${index % 4}`}
            key={product.id + (media?.url ?? '')}
          >
            <div className="reel-visual">
              <MediaFrame
                media={media}
                autoPlay
                poster={product.imageUrl || undefined}
                fallback={<ProductArt kind={product.kind} color={product.color} />}
              />
              <span className="reel-tag">
                {media?.type === 'video' ? (
                  <>
                    <Film size={14} /> WATCH THE RITUAL
                  </>
                ) : (
                  `0${index + 1} / A MOMENT FOR YOU`
                )}
              </span>
            </div>
            <div className="reel-copy">
              <div>
                <span>{media?.caption || 'Make time for yourself'}</span>
                <h3>{product.name}</h3>
              </div>
              <Button
                className="reel-shop"
                aria-label={`Discover ${product.name}`}
                onClick={() => onView(product)}
              >
                <ArrowRight size={22} />
              </Button>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
