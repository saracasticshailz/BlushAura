import { ArrowLeft, ArrowRight, LockKeyhole, ShoppingBag } from 'lucide-react';
import { Button } from '../../components/atoms/Button';
import { ProductImage } from '../../components/atoms/ProductImage';
import { type StorefrontModel } from '../../hooks/useStorefront';
import { money } from '../../utils/currency';

type Props = Pick<
  StorefrontModel,
  | 'products'
  | 'placingOrder'
  | 'placeOrder'
  | 'cart'
  | 'step'
  | 'setStep'
  | 'payment'
  | 'setPayment'
  | 'address'
  | 'setAddress'
  | 'count'
  | 'total'
  | 'shipping'
  | 'go'
>;
export function CheckoutPage(props: Props) {
  const {
    products,
    placingOrder,
    placeOrder,
    cart,
    step,
    setStep,
    payment,
    setPayment,
    address,
    setAddress,
    count,
    total,
    shipping,
    go,
  } = props;
  return (
    <section className="section checkout">
      <Button variant="text" onClick={() => go('shop')}>
        <ArrowLeft size={16} /> Back to shopping
      </Button>
      {!count ? (
        <div className="empty">
          <ShoppingBag size={40} />
          <h2>Your bag is taking a breather.</h2>
          <Button variant="primary" onClick={() => go('shop')}>
            Find your favourites
          </Button>
        </div>
      ) : (
        <>
          <h1>
            A little closer to <em>feel-good.</em>
          </h1>
          <div className="checkout-steps">
            <span className="current">1. Your details</span>
            <span className={step >= 2 ? 'current' : ''}>2. Review & payment</span>
          </div>
          <div className="checkout-grid">
            <div className="checkout-form">
              {step === 1 ? (
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    setStep(2);
                    window.scrollTo(0, 0);
                  }}
                >
                  <h2>Where should we send your ritual?</h2>
                  <p>All orders arrive in discreet, unbranded outer packaging.</p>
                  <label>
                    Full name
                    <input
                      required
                      autoComplete="name"
                      value={address.name}
                      onChange={(e) => setAddress({ ...address, name: e.target.value })}
                    />
                  </label>
                  <label>
                    Email address
                    <input
                      required
                      type="email"
                      autoComplete="email"
                      value={address.email}
                      onChange={(e) => setAddress({ ...address, email: e.target.value })}
                    />
                  </label>
                  <label>
                    Street address
                    <input
                      required
                      autoComplete="street-address"
                      value={address.street}
                      onChange={(e) => setAddress({ ...address, street: e.target.value })}
                    />
                  </label>
                  <div className="form-row">
                    <label>
                      City
                      <input
                        required
                        autoComplete="address-level2"
                        value={address.city}
                        onChange={(e) => setAddress({ ...address, city: e.target.value })}
                      />
                    </label>
                    <label>
                      Postal code
                      <input
                        required
                        autoComplete="postal-code"
                        value={address.postal}
                        onChange={(e) => setAddress({ ...address, postal: e.target.value })}
                      />
                    </label>
                  </div>
                  <label>
                    Country
                    <select
                      value={address.country}
                      onChange={(e) => setAddress({ ...address, country: e.target.value })}
                    >
                      <option>India</option>
                      <option>United Arab Emirates</option>
                      <option>United Kingdom</option>
                      <option>United States</option>
                    </select>
                  </label>
                  <Button variant="primary" className="wide">
                    Continue to payment <ArrowRight size={17} />
                  </Button>
                </form>
              ) : (
                <>
                  <h2>Review & payment</h2>
                  <div className="demo-notice">
                    <LockKeyhole size={20} />
                    <div>
                      <strong>Demo checkout</strong>
                      <p>
                        No payment will be taken. Delivery details will be saved in this project's
                        local database.
                      </p>
                    </div>
                  </div>
                  <div className="shipping-address">
                    <strong>Deliver to {address.name}</strong>
                    <p>
                      {address.street}, {address.city}, {address.postal}
                      <br />
                      {address.country}
                      <br />
                      {address.email}
                    </p>
                    <Button variant="text" onClick={() => setStep(1)}>
                      Edit details
                    </Button>
                  </div>
                  {['card', 'paypal'].map((p) => (
                    <label className={`payment-option ${payment === p ? 'selected' : ''}`} key={p}>
                      <input
                        type="radio"
                        name="payment"
                        checked={payment === p}
                        onChange={() => setPayment(p)}
                      />
                      <span>
                        {p === 'card' ? 'Credit / debit card' : 'PayPal'}{' '}
                        <small>Mock payment</small>
                      </span>
                      <LockKeyhole size={17} />
                    </label>
                  ))}
                  <p className="payment-note">
                    This simulates a successful {payment === 'card' ? 'card' : 'PayPal'} payment. A
                    real gateway will be connected in a later phase.
                  </p>
                  <Button
                    variant="primary"
                    className="wide"
                    disabled={placingOrder}
                    onClick={placeOrder}
                  >
                    {placingOrder
                      ? 'Placing order…'
                      : 'Place demo order · ' + money(total + shipping)}{' '}
                    <ArrowRight size={17} />
                  </Button>
                </>
              )}
            </div>
            <aside className="order-summary">
              <h2>
                Your feel-good bag <small>({count})</small>
              </h2>
              {products
                .filter((p) => cart[p.id])
                .map((p) => (
                  <div className="summary-item" key={p.id}>
                    <div className="summary-art">
                      <ProductImage product={p} />
                    </div>
                    <div>
                      <strong>{p.name}</strong>
                      <span>Qty {cart[p.id]}</span>
                    </div>
                    <b>{money(p.price * cart[p.id])}</b>
                  </div>
                ))}
              <div className="totals">
                <p>
                  <span>Subtotal</span>
                  <span>{money(total)}</span>
                </p>
                <p>
                  <span>Shipping</span>
                  <span>{shipping ? money(shipping) : 'On us'}</span>
                </p>
                <p className="grand-total">
                  <span>Total</span>
                  <span>{money(total + shipping)}</span>
                </p>
                <small>Demo prices in INR. Tax calculations will be added with the backend.</small>
              </div>
            </aside>
          </div>
        </>
      )}
    </section>
  );
}
