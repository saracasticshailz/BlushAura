import { Heart, Package, ShoppingBag, Truck, X } from 'lucide-react';
import { type StorefrontModel } from '../../../hooks/useStorefront';
import { money } from '../../../utils/currency';
import { productMedia } from '../../../utils/media';
import { Button } from '../../atoms/Button';
import { ProductImage } from '../../atoms/ProductImage';
import { MediaCarousel } from '../../molecules/MediaCarousel';

type Props = Pick<StorefrontModel, 'selected' | 'setSelected' | 'wishlist' | 'add' | 'wish'>;
export function ProductDetailDialog(props: Props) {
  const { selected, setSelected, wishlist, add, wish } = props;
  return (
    <>
      {selected && (
        <div className="overlay" onClick={() => setSelected(null)}>
          <section
            className="product-modal"
            role="dialog"
            aria-modal="true"
            aria-label={selected.name}
            onClick={(e) => e.stopPropagation()}
          >
            <Button
              className="close icon-button"
              aria-label="Close product"
              onClick={() => setSelected(null)}
            >
              <X />
            </Button>
            <div className={`detail-art ${selected.kind}`}>
              <MediaCarousel
                key={selected.id}
                label={`${selected.name} gallery`}
                className="product-gallery"
                thumbnails
                slides={
                  productMedia(selected).length
                    ? productMedia(selected).map((media) => ({
                        id: media.url,
                        media,
                        label: media.caption || selected.name,
                        poster: selected.imageUrl || undefined,
                        fallback: <ProductImage product={{ ...selected, imageUrl: '' }} />,
                      }))
                    : [
                        {
                          id: selected.id,
                          label: selected.name,
                          fallback: <ProductImage product={selected} />,
                        },
                      ]
                }
              />
            </div>
            <div className="detail-copy">
              <div className="eyebrow">
                {selected.category} / {selected.subcategory}
              </div>
              <h2>{selected.name}</h2>
              <p className="detail-subtitle">{selected.subtitle}</p>
              <div className="detail-price">
                {money(selected.price)} <del>{money(selected.original)}</del>
              </div>
              <p>{selected.description}</p>
              <div className="detail-actions">
                <Button
                  variant="primary"
                  disabled={selected.stock === 0}
                  onClick={() => add(selected)}
                >
                  {selected.stock === 0 ? 'Out of stock' : 'Add to bag'} <ShoppingBag size={17} />
                </Button>
                <Button
                  className="outline"
                  onClick={() => wish(selected.id)}
                  aria-label="Toggle wishlist"
                >
                  <Heart
                    fill={wishlist.includes(selected.id) ? 'currentColor' : 'none'}
                    size={21}
                  />
                </Button>
              </div>
              <div className="detail-perks">
                <span>
                  <Package size={17} />
                  Discreet packaging
                </span>
                <span>
                  <Truck size={17} />
                  Shipping calculated at checkout
                </span>
              </div>
              <small>
                Illustrative demo product. Final specifications will be managed in the admin panel.
              </small>
            </div>
          </section>
        </div>
      )}
    </>
  );
}
