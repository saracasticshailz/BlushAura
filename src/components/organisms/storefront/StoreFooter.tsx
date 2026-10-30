import { Instagram, Leaf } from 'lucide-react';
import { brand } from '../../../config';
import { type StorefrontModel } from '../../../hooks/useStorefront';
import { BrandLogo } from '../../atoms/BrandLogo';
import { Button } from '../../atoms/Button';

type Props = Pick<StorefrontModel, 'setCartOpen' | 'notify' | 'go'>;
export function StoreFooter(props: Props) {
  const { setCartOpen, notify, go } = props;
  return (
    <footer>
      <div className="footer-top">
        <div>
          <BrandLogo onClick={() => go('home')} />
          <p>Little rituals for a softer everyday.</p>
        </div>
        <div>
          <h4>FIND YOUR FEEL-GOOD</h4>
          <Button onClick={() => go('shop')}>Shop all</Button>
          <Button onClick={() => go('shop', 'Massagers')}>Massagers</Button>
          <Button onClick={() => go('shop', 'Oils & essentials')}>Oils & essentials</Button>
          <Button onClick={() => go('shop', 'Bundles & gifts')}>Bundles & gifts</Button>
        </div>
        <div>
          <h4>YOUR LITTLE CORNER</h4>
          <Button onClick={() => go('wishlist')}>Your wishlist</Button>
          <Button onClick={() => setCartOpen(true)}>Your bag</Button>
          <a href="/admin" className="admin-footer-link">
            Store admin
          </a>
          <Button
            onClick={() =>
              notify('Preview support: customer support details will be added before launch.')
            }
          >
            Here to help
          </Button>
        </div>
        <div className="footer-note">
          <Leaf size={25} />
          <p>
            Thoughtfully chosen.
            <br />
            Beautifully yours.
          </p>
          <Instagram size={18} />
        </div>
      </div>
      <div className="footer-bottom">
        <span>
          © {new Date().getFullYear()} {brand.name}. Made for your kind of calm.
        </span>
        <span>Local storefront · Mock payments</span>
      </div>
    </footer>
  );
}
