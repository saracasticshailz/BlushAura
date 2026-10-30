import { ArrowRight, LockKeyhole, ShoppingBag, X } from 'lucide-react';
import { type StorefrontModel } from '../../../hooks/useStorefront';
import { money } from '../../../utils/currency';
import { Button } from '../../atoms/Button';
import { ProductImage } from '../../atoms/ProductImage';
import { QuantityControl } from '../../molecules/QuantityControl';

type Props = Pick<
  StorefrontModel,
  | 'products'
  | 'cart'
  | 'removeFromCart'
  | 'cartOpen'
  | 'setCartOpen'
  | 'count'
  | 'total'
  | 'go'
  | 'change'
  | 'checkout'
>;
export function CartDrawer(props: Props) {
  const {
    products,
    cart,
    removeFromCart,
    cartOpen,
    setCartOpen,
    count,
    total,
    go,
    change,
    checkout,
  } = props;
  return (
    <>
      {cartOpen && (
        <div className="overlay drawer-overlay" onClick={() => setCartOpen(false)}>
          <aside
            className="cart-drawer"
            role="dialog"
            aria-modal="true"
            aria-label="Shopping bag"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="drawer-header">
              <h2>
                Your little bag <span>({count})</span>
              </h2>
              <Button variant="icon" aria-label="Close bag" onClick={() => setCartOpen(false)}>
                <X />
              </Button>
            </div>
            {count ? (
              <>
                <div className="shipping-progress">
                  {total >= 1999
                    ? 'Lovely! Your shipping is on us.'
                    : `${money(1999 - total)} away from free shipping`}
                  <div>
                    <span style={{ width: `${Math.min((total / 1999) * 100, 100)}%` }} />
                  </div>
                </div>
                <div className="cart-items">
                  {products
                    .filter((p) => cart[p.id])
                    .map((p) => (
                      <div className="cart-item" key={p.id}>
                        <div className="cart-art">
                          <ProductImage product={p} />
                        </div>
                        <div className="cart-item-info">
                          <strong>{p.name}</strong>
                          <p>{p.category}</p>
                          <b>{money(p.price)}</b>
                          <QuantityControl
                            name={p.name}
                            value={cart[p.id]}
                            onChange={(delta) => change(p.id, delta)}
                          />
                        </div>
                        <Button className="remove" onClick={() => removeFromCart(p.id)}>
                          Remove
                        </Button>
                      </div>
                    ))}
                </div>
                <div className="cart-bottom">
                  <p>
                    <span>Subtotal</span>
                    <strong>{money(total)}</strong>
                  </p>
                  <small>Shipping calculated at checkout.</small>
                  <Button variant="primary" className="wide" onClick={checkout}>
                    Continue to checkout <ArrowRight size={17} />
                  </Button>
                  <span className="secure">
                    <LockKeyhole size={13} /> Mock checkout · No real charges
                  </span>
                </div>
              </>
            ) : (
              <div className="empty">
                <ShoppingBag size={38} />
                <h2>A little room for good things.</h2>
                <p>Your bag is empty. Find something you love.</p>
                <Button
                  variant="primary"
                  onClick={() => {
                    setCartOpen(false);
                    go('shop');
                  }}
                >
                  Explore essentials <ArrowRight size={16} />
                </Button>
              </div>
            )}
          </aside>
        </div>
      )}
    </>
  );
}
