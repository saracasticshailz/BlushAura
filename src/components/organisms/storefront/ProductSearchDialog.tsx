import { ArrowRight, Search, X } from 'lucide-react';
import { type StorefrontModel } from '../../../hooks/useStorefront';
import { money } from '../../../utils/currency';
import { Button } from '../../atoms/Button';
import { ProductImage } from '../../atoms/ProductImage';

type Props = Pick<
  StorefrontModel,
  'products' | 'search' | 'setSearch' | 'searchOpen' | 'setSearchOpen' | 'setSelected'
>;
export function ProductSearchDialog(props: Props) {
  const { products, search, setSearch, searchOpen, setSearchOpen, setSelected } = props;
  return (
    <>
      {searchOpen && (
        <div className="overlay search-overlay" onClick={() => setSearchOpen(false)}>
          <section
            className="search-panel"
            role="dialog"
            aria-modal="true"
            aria-label="Search products"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="drawer-header">
              <h2>Find your feel-good.</h2>
              <Button variant="icon" aria-label="Close search" onClick={() => setSearchOpen(false)}>
                <X />
              </Button>
            </div>
            <div className="search-input">
              <Search size={22} />
              <input
                autoFocus
                placeholder="Try massage oil, Aura, or a gift…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <div className="search-results">
              {products
                .filter((p) =>
                  `${p.name} ${p.category} ${p.subtitle}`
                    .toLowerCase()
                    .includes(search.toLowerCase()),
                )
                .map((p) => (
                  <Button
                    key={p.id}
                    onClick={() => {
                      setSearchOpen(false);
                      setSelected(p);
                    }}
                  >
                    <div>
                      <ProductImage product={p} />
                    </div>
                    <span>
                      <strong>{p.name}</strong>
                      <small>{p.subtitle}</small>
                    </span>
                    <b>{money(p.price)}</b>
                    <ArrowRight size={17} />
                  </Button>
                ))}
              {!products.some((p) =>
                `${p.name} ${p.category} ${p.subtitle}`
                  .toLowerCase()
                  .includes(search.toLowerCase()),
              ) && <p>No matches. Try “oil” or “massager”.</p>}
            </div>
          </section>
        </div>
      )}
    </>
  );
}
