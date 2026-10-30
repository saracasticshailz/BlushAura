import { ChevronDown, Heart, Menu, Search, ShoppingBag } from 'lucide-react';
import { type StorefrontModel } from '../../../hooks/useStorefront';
import { BrandLogo } from '../../atoms/BrandLogo';
import { Button } from '../../atoms/Button';

type Props = Pick<
  StorefrontModel,
  | 'categoryNames'
  | 'setSearchOpen'
  | 'wishlist'
  | 'setCartOpen'
  | 'mobile'
  | 'setMobile'
  | 'count'
  | 'go'
>;
export function StoreHeader(props: Props) {
  const { categoryNames, setSearchOpen, wishlist, setCartOpen, mobile, setMobile, count, go } =
    props;
  return (
    <>
      <div className="announcement">
        A little treat, on us. Free shipping on orders over ₹1,999 <span>✦</span> Thoughtfully
        packed. Discreetly delivered.
      </div>
      <header>
        <div className="header-main">
          <Button
            className="mobile-menu icon-button"
            aria-label="Open menu"
            onClick={() => setMobile(!mobile)}
          >
            <Menu />
          </Button>
          <BrandLogo onClick={() => go('home')} />
          <nav className={mobile ? 'open' : ''}>
            {['All essentials', ...categoryNames].map((c) => (
              <Button key={c} onClick={() => go('shop', c)}>
                {c === 'All essentials' ? 'Shop all' : c}
                {c === 'Massagers' && <ChevronDown size={12} />}
              </Button>
            ))}
            <Button
              onClick={() => {
                go('home');
                setTimeout(
                  () => document.getElementById('story')?.scrollIntoView({ behavior: 'smooth' }),
                  100,
                );
              }}
            >
              Our story
            </Button>
          </nav>
          <div className="header-actions">
            <Button variant="icon" onClick={() => setSearchOpen(true)} aria-label="Search products">
              <Search size={21} />
            </Button>
            <Button
              className="icon-button counter"
              onClick={() => go('wishlist')}
              aria-label={`Wishlist, ${wishlist.length} items`}
            >
              <Heart size={21} />
              {wishlist.length > 0 && <small>{wishlist.length}</small>}
            </Button>
            <Button
              className="icon-button counter"
              onClick={() => setCartOpen(true)}
              aria-label={`Shopping bag, ${count} items`}
            >
              <ShoppingBag size={21} />
              <small>{count}</small>
            </Button>
          </div>
        </div>
      </header>
    </>
  );
}
