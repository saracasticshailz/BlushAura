import React, { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import {
  ArrowRight,
  ArrowLeft,
  Heart,
  ShoppingBag,
  Search,
  X,
  Plus,
  Minus,
  Check,
  Truck,
  ShieldCheck,
  Leaf,
  Package,
  Star,
  Menu,
  ChevronDown,
  LockKeyhole,
  Instagram,
} from 'lucide-react';
import { products as demoProducts, money, type Product } from './catalog';
import { ProductArt, ProductVisual } from './Art';
import { Admin } from './Admin';
import { api, jsonRequest, type Category } from './api';
import './styles.css';
type Cart = Record<string, number>;
function saved<T>(key: string, fallback: T): T {
  try {
    return JSON.parse(localStorage.getItem(key) || 'null') ?? fallback;
  } catch {
    return fallback;
  }
}
function App() {
  const [products, setProducts] = useState<Product[]>(demoProducts),
    [apiState, setApiState] = useState('loading'),
    [placingOrder, setPlacingOrder] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  async function refreshCatalog(signal?: AbortSignal) {
    try {
      const [data, cats] = await Promise.all([
        api<Product[]>('/api/products', { signal }),
        api<Category[]>('/api/categories', { signal }),
      ]);
      setProducts(data);
      setCategories(cats);
      setApiState('connected');
    } catch (error) {
      if (!(error instanceof DOMException && error.name === 'AbortError')) setApiState('offline');
    }
  }
  useEffect(() => {
    const controller = new AbortController();
    void refreshCatalog(controller.signal);
    const refresh = () => {
      void refreshCatalog(controller.signal);
    };
    window.addEventListener('focus', refresh);
    return () => {
      controller.abort();
      window.removeEventListener('focus', refresh);
    };
  }, []);
  const categoryNames = categories.length
    ? categories.map((c) => c.name)
    : [...new Set(products.map((p) => p.category))];

  async function placeOrder() {
    if (placingOrder) return;
    setPlacingOrder(true);
    try {
      const result = await api<{ id: string }>(
        '/api/orders',
        jsonRequest('POST', {
          address,
          paymentMethod: payment,
          items: Object.entries(cart).map(([productId, quantity]) => ({ productId, quantity })),
        }),
      );
      setOrder(result.id);
      setCart({});
      setAddress({ name: '', email: '', street: '', city: '', postal: '', country: 'India' });
      void refreshCatalog();
      go('success');
    } catch (error) {
      notify(
        error instanceof TypeError
          ? 'The backend is unavailable. Your bag is saved. Please try again.'
          : error instanceof Error
            ? error.message
            : 'Could not place the order.',
      );
    } finally {
      setPlacingOrder(false);
    }
  }

  const [page, setPage] = useState('home'),
    [category, setCategory] = useState('All essentials'),
    [sub, setSub] = useState('All'),
    [search, setSearch] = useState(''),
    [searchOpen, setSearchOpen] = useState(false),
    [sort, setSort] = useState('featured'),
    [selected, setSelected] = useState<Product | null>(null),
    [cart, setCart] = useState<Cart>(() => saved('blushaura.cart', {})),
    [wishlist, setWishlist] = useState<string[]>(() => saved('blushaura.wishlist', [])),
    [cartOpen, setCartOpen] = useState(false),
    [mobile, setMobile] = useState(false),
    [toast, setToast] = useState(''),
    [step, setStep] = useState(1),
    [order, setOrder] = useState(''),
    [payment, setPayment] = useState('card'),
    [address, setAddress] = useState({
      name: '',
      email: '',
      street: '',
      city: '',
      postal: '',
      country: 'India',
    });
  useEffect(() => {
    localStorage.setItem('blushaura.cart', JSON.stringify(cart));
  }, [cart]);
  useEffect(() => {
    localStorage.setItem('blushaura.wishlist', JSON.stringify(wishlist));
  }, [wishlist]);
  useEffect(() => {
    if (toast) {
      const t = setTimeout(() => setToast(''), 2800);
      return () => clearTimeout(t);
    }
  }, [toast]);
  useEffect(() => {
    const open = !!selected || cartOpen || searchOpen;
    if (!open) return;
    const old = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    function close(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        setSelected(null);
        setCartOpen(false);
        setSearchOpen(false);
      }
    }
    window.addEventListener('keydown', close);
    return () => {
      document.body.style.overflow = old;
      window.removeEventListener('keydown', close);
    };
  }, [selected, cartOpen, searchOpen]);
  useEffect(() => {
    if (apiState === 'connected')
      setCart((current) =>
        Object.fromEntries(
          Object.entries(current).filter(([id]) => products.some((p) => p.id === id)),
        ),
      );
  }, [products, apiState]);
  const count = Object.values(cart).reduce((a, b) => a + b, 0),
    total = products.reduce((n, p) => n + p.price * (cart[p.id] || 0), 0),
    shipping = total >= 1999 || total === 0 ? 0 : 99;
  function notify(text: string) {
    setToast(text);
  }
  function go(p: string, c = 'All essentials') {
    setPage(p);
    setCategory(c);
    setSub('All');
    setSelected(null);
    setMobile(false);
    setSearch('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
  function add(p: Product) {
    if ((cart[p.id] || 0) >= Math.min(p.stock ?? 99, 99)) {
      notify('No more stock is available for this item.');
      return;
    }
    setCart((c) => ({ ...c, [p.id]: (c[p.id] || 0) + 1 }));
    notify(`${p.name} added to your bag`);
  }
  function change(id: string, n: number) {
    if (n > 0 && (cart[id] || 0) >= Math.min(products.find((p) => p.id === id)?.stock ?? 99, 99)) {
      notify('No more stock is available for this item.');
      return;
    }
    setCart((c) => {
      const next = { ...c, [id]: (c[id] || 0) + n };
      if (next[id] <= 0) delete next[id];
      return next;
    });
  }
  function wish(id: string) {
    setWishlist((w) => (w.includes(id) ? w.filter((x) => x !== id) : [...w, id]));
  }
  function checkout() {
    setCartOpen(false);
    setStep(1);
    go('checkout');
  }
  const visible = products
    .filter(
      (p) =>
        (page !== 'wishlist' || wishlist.includes(p.id)) &&
        (category === 'All essentials' || p.category === category) &&
        (sub === 'All' || p.subcategory === sub) &&
        `${p.name} ${p.subtitle} ${p.category}`.toLowerCase().includes(search.toLowerCase()),
    )
    .sort((a, b) => (sort === 'low' ? a.price - b.price : sort === 'high' ? b.price - a.price : 0));
  function card(p: Product) {
    return (
      <article className="product-card" key={p.id}>
        <div className={`product-image ${p.kind}`}>
          <button
            className="art-button"
            onClick={() => setSelected(p)}
            aria-label={`View ${p.name}`}
          >
            <ProductVisual product={p} />
          </button>
          {p.badge && <span className="badge">{p.badge}</span>}
          <button
            className={`heart icon-button ${wishlist.includes(p.id) ? 'active' : ''}`}
            onClick={() => wish(p.id)}
            aria-label={`${wishlist.includes(p.id) ? 'Remove' : 'Save'} ${p.name} ${wishlist.includes(p.id) ? 'from' : 'to'} wishlist`}
          >
            <Heart size={18} fill={wishlist.includes(p.id) ? 'currentColor' : 'none'} />
          </button>
        </div>
        <div className="product-rating">
          <Star size={11} fill="currentColor" /> <span>4.8</span>
          <span className="muted"> · Demo rating</span>
        </div>
        <button className="product-name" onClick={() => setSelected(p)}>
          {p.name}
        </button>
        <p className="product-subtitle">{p.subtitle}</p>
        <div className="price-line">
          <span>{money(p.price)}</span>
          <del>{money(p.original)}</del>
          <button
            className="add-button"
            onClick={() => add(p)}
            disabled={p.stock === 0}
            aria-label={`Add ${p.name} to bag`}
          >
            <Plus size={17} />
          </button>
        </div>
      </article>
    );
  }
  return (
    <>
      <div className="announcement">
        A little treat, on us. Free shipping on orders over ₹1,999 <span>✦</span> Thoughtfully
        packed. Discreetly delivered.
      </div>
      <header>
        <div className="header-main">
          <button
            className="mobile-menu icon-button"
            aria-label="Open menu"
            onClick={() => setMobile(!mobile)}
          >
            <Menu />
          </button>
          <button className="logo" onClick={() => go('home')}>
            blush aura<span>FEEL GOOD. FEEL YOU.</span>
          </button>
          <nav className={mobile ? 'open' : ''}>
            {['All essentials', ...categoryNames].map((c) => (
              <button key={c} onClick={() => go('shop', c)}>
                {c === 'All essentials' ? 'Shop all' : c}
                {c === 'Massagers' && <ChevronDown size={12} />}
              </button>
            ))}
            <button
              onClick={() => {
                go('home');
                setTimeout(
                  () => document.getElementById('story')?.scrollIntoView({ behavior: 'smooth' }),
                  100,
                );
              }}
            >
              Our story
            </button>
          </nav>
          <div className="header-actions">
            <button
              className="icon-button"
              onClick={() => setSearchOpen(true)}
              aria-label="Search products"
            >
              <Search size={21} />
            </button>
            <button
              className="icon-button counter"
              onClick={() => go('wishlist')}
              aria-label={`Wishlist, ${wishlist.length} items`}
            >
              <Heart size={21} />
              {wishlist.length > 0 && <small>{wishlist.length}</small>}
            </button>
            <button
              className="icon-button counter"
              onClick={() => setCartOpen(true)}
              aria-label={`Shopping bag, ${count} items`}
            >
              <ShoppingBag size={21} />
              <small>{count}</small>
            </button>
          </div>
        </div>
      </header>
      <main>
        {apiState === 'offline' && (
          <div className="api-notice" role="status">
            The local backend is unavailable. Showing preview products; checkout requires the
            backend.
          </div>
        )}
        {page === 'home' ? (
          <>
            <section className="hero">
              <div className="hero-copy">
                <div className="eyebrow">
                  <span /> YOUR EVERYDAY, A LITTLE SOFTER
                </div>
                <h1>
                  A little pause.
                  <br />A little pleasure.
                  <br />
                  <em>A little more you.</em>
                </h1>
                <p>
                  Thoughtfully designed massage and self-care essentials.
                  <br className="desktop" /> For slowing down, tuning in, and feeling good.
                </p>
                <button className="primary" onClick={() => go('shop')}>
                  Find your feel-good <ArrowRight size={17} />
                </button>
                <div className="hero-proof">
                  <div className="little-stars">★★★★★</div>
                  <span>Small rituals. Beautiful possibilities.</span>
                </div>
              </div>
              <div className="hero-art">
                <ProductArt hero />
                <div className="hero-note">
                  <span>THE ART OF UNWINDING</span>
                  <p>
                    Your me-time.
                    <br />
                    Reimagined.
                  </p>
                  <ArrowRight size={18} />
                </div>
                <span className="image-caption">BLUSH AURA · THE EVERYDAY COLLECTION</span>
              </div>
            </section>
            <div className="trust-strip">
              <span>
                <Package />
                Discreet packaging
              </span>
              <span>
                <Leaf />
                Thoughtfully selected
              </span>
              <span>
                <Truck />
                Free shipping over ₹1,999
              </span>
              <span>
                <ShieldCheck />
                Secure checkout
              </span>
            </div>
            <section className="section categories">
              <div className="section-heading">
                <div>
                  <div className="eyebrow">A MOMENT FOR EVERY MOOD</div>
                  <h2>
                    Find your kind of <em>feel-good.</em>
                  </h2>
                </div>
                <span className="section-aside">Your ritual. Your rules.</span>
              </div>
              <div className="category-grid">
                {categoryNames
                  .map((name, i) => ({
                    name,
                    kind: products.find((p) => p.category === name)?.kind || 'bundle',
                    color: products.find((p) => p.category === name)?.color || '#b47780',
                    label: 'Discover your next little ritual',
                    num: String(i + 1).padStart(2, '0'),
                  }))
                  .map((c) => (
                    <button
                      className="category-card"
                      key={c.name}
                      onClick={() => go('shop', c.name)}
                    >
                      <span className="category-number">{c.num} / THE COLLECTION</span>
                      <div className="category-art">
                        <ProductArt kind={c.kind} color={c.color} />
                      </div>
                      <div className="category-title">
                        <div>
                          <h3>{c.name}</h3>
                          <p>{c.label}</p>
                        </div>
                        <span className="round-arrow">
                          <ArrowRight size={20} />
                        </span>
                      </div>
                    </button>
                  ))}
              </div>
            </section>
            <section className="section bestsellers">
              <div className="section-heading">
                <div>
                  <div className="eyebrow">A GOOD PLACE TO BEGIN</div>
                  <h2>
                    Little favourites. <em>Big feelings.</em>
                  </h2>
                </div>
                <button className="text-link" onClick={() => go('shop')}>
                  Explore all essentials <ArrowRight size={17} />
                </button>
              </div>
              <div className="product-grid">{products.slice(0, 4).map(card)}</div>
            </section>
            <section className="story" id="story">
              <div className="story-art">
                <div className="orb orb1" />
                <div className="orb orb2" />
                <span className="story-word">
                  make time
                  <br />
                  for <em>you.</em>
                </span>
                <span className="story-art-caption">A SMALL RITUAL. A BEAUTIFUL SHIFT.</span>
              </div>
              <div className="story-copy">
                <div className="eyebrow">A NOTE FROM BLUSH AURA</div>
                <h2>
                  Feeling good
                  <br />
                  comes <em>naturally.</em>
                </h2>
                <p>
                  We believe taking care of yourself should feel as good as it sounds. No
                  complicated routines. No expectations. Just thoughtful essentials that make room
                  for a little more you.
                </p>
                <p>For the slow mornings, the long days, and every beautiful in-between.</p>
                <button className="text-link" onClick={() => go('shop')}>
                  Make yourself a priority <ArrowRight size={18} />
                </button>
              </div>
            </section>
            <section className="newsletter">
              <span className="eyebrow">LET’S STAY CLOSE</span>
              <h2>A little good in your inbox.</h2>
              <p>New rituals, thoughtful reads, and first dibs on all things Blush Aura.</p>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  notify('Thank you! Newsletter signup is a preview — no email was sent.');
                  e.currentTarget.reset();
                }}
              >
                <input
                  required
                  type="email"
                  aria-label="Your email address"
                  placeholder="Your email address"
                />
                <button aria-label="Subscribe">
                  <ArrowRight size={21} />
                </button>
              </form>
              <small>By subscribing, you agree to hear from Blush Aura. Unsubscribe anytime.</small>
            </section>
          </>
        ) : page === 'shop' || page === 'wishlist' ? (
          <section className="section collection">
            <div className="breadcrumb">
              <button onClick={() => go('home')}>Home</button> /{' '}
              {page === 'wishlist' ? 'Wishlist' : category}
            </div>
            <div className="collection-intro">
              <div className="eyebrow">CURATED FOR YOUR EVERYDAY</div>
              <h1>
                {page === 'wishlist'
                  ? 'Saved for a softer day.'
                  : category === 'All essentials'
                    ? 'Your feel-good starts here.'
                    : category}
              </h1>
              <p>
                {page === 'wishlist'
                  ? 'The things you love, all in one little place.'
                  : 'Discover thoughtful essentials for your own kind of unwind.'}
              </p>
            </div>
            <div className="collection-toolbar">
              <div className="filter-tabs">
                {['All essentials', ...categoryNames].map((c) => (
                  <button
                    className={c === category ? 'selected' : ''}
                    key={c}
                    onClick={() => {
                      setCategory(c);
                      setSub('All');
                    }}
                  >
                    {c}
                  </button>
                ))}
              </div>
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value)}
                aria-label="Sort products"
              >
                <option value="featured">Featured</option>
                <option value="low">Price: low to high</option>
                <option value="high">Price: high to low</option>
              </select>
            </div>
            {category !== 'All essentials' && (
              <div className="subfilters">
                {[
                  'All',
                  ...(categories.find((c) => c.name === category)?.subcategories ?? [
                    ...new Set(
                      products.filter((p) => p.category === category).map((p) => p.subcategory),
                    ),
                  ]),
                ].map((s) => (
                  <button className={s === sub ? 'selected' : ''} key={s} onClick={() => setSub(s)}>
                    {s}
                  </button>
                ))}
              </div>
            )}
            <div className="results-line">
              <span>{visible.length} essentials</span>
              <input
                placeholder="Search this collection…"
                aria-label="Search collection"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            {visible.length ? (
              <div className="product-grid">{visible.map(card)}</div>
            ) : (
              <div className="empty">
                <Heart size={36} />
                <h2>
                  {page === 'wishlist' ? 'Your favourites are waiting.' : 'No essentials found.'}
                </h2>
                <p>
                  {page === 'wishlist'
                    ? 'Tap the heart on something you love.'
                    : 'Try another search or category.'}
                </p>
                <button className="primary" onClick={() => go('shop')}>
                  Explore the collection <ArrowRight size={16} />
                </button>
              </div>
            )}
          </section>
        ) : page === 'checkout' ? (
          <section className="section checkout">
            <button className="text-link" onClick={() => go('shop')}>
              <ArrowLeft size={16} /> Back to shopping
            </button>
            {!count ? (
              <div className="empty">
                <ShoppingBag size={40} />
                <h2>Your bag is taking a breather.</h2>
                <button className="primary" onClick={() => go('shop')}>
                  Find your favourites
                </button>
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
                        <button className="primary wide">
                          Continue to payment <ArrowRight size={17} />
                        </button>
                      </form>
                    ) : (
                      <>
                        <h2>Review & payment</h2>
                        <div className="demo-notice">
                          <LockKeyhole size={20} />
                          <div>
                            <strong>Demo checkout</strong>
                            <p>
                              No payment will be taken. Delivery details will be saved in this
                              project's local database.
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
                          <button className="text-link" onClick={() => setStep(1)}>
                            Edit details
                          </button>
                        </div>
                        {['card', 'paypal'].map((p) => (
                          <label
                            className={`payment-option ${payment === p ? 'selected' : ''}`}
                            key={p}
                          >
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
                          This simulates a successful {payment === 'card' ? 'card' : 'PayPal'}{' '}
                          payment. A real gateway will be connected in a later phase.
                        </p>
                        <button
                          className="primary wide"
                          disabled={placingOrder}
                          onClick={placeOrder}
                        >
                          {placingOrder
                            ? 'Placing order…'
                            : 'Place demo order · ' + money(total + shipping)}{' '}
                          <ArrowRight size={17} />
                        </button>
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
                            <ProductVisual product={p} />
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
                      <small>
                        Demo prices in INR. Tax calculations will be added with the backend.
                      </small>
                    </div>
                  </aside>
                </div>
              </>
            )}
          </section>
        ) : (
          <section className="section success">
            <div className="success-check">
              <Check size={38} />
            </div>
            <div className="eyebrow">A LITTLE GOOD IS ON ITS WAY</div>
            <h1>
              That felt good, <em>didn’t it?</em>
            </h1>
            <p>
              Your demo order <strong>{order}</strong> has been placed.
            </p>
            <p>
              Saved in your local Blush Aura database. No payment was collected, email sent, or
              delivery scheduled.
            </p>
            <button className="primary" onClick={() => go('shop')}>
              Keep exploring <ArrowRight size={17} />
            </button>
          </section>
        )}
      </main>
      <footer>
        <div className="footer-top">
          <div>
            <button className="logo" onClick={() => go('home')}>
              blush aura<span>FEEL GOOD. FEEL YOU.</span>
            </button>
            <p>Little rituals for a softer everyday.</p>
          </div>
          <div>
            <h4>FIND YOUR FEEL-GOOD</h4>
            <button onClick={() => go('shop')}>Shop all</button>
            <button onClick={() => go('shop', 'Massagers')}>Massagers</button>
            <button onClick={() => go('shop', 'Oils & essentials')}>Oils & essentials</button>
            <button onClick={() => go('shop', 'Bundles & gifts')}>Bundles & gifts</button>
          </div>
          <div>
            <h4>YOUR LITTLE CORNER</h4>
            <button onClick={() => go('wishlist')}>Your wishlist</button>
            <button onClick={() => setCartOpen(true)}>Your bag</button>
            <a href="/admin" className="admin-footer-link">
              Store admin
            </a>
            <button
              onClick={() =>
                notify('Preview support: customer support details will be added before launch.')
              }
            >
              Here to help
            </button>
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
          <span>© {new Date().getFullYear()} Blush Aura. Made for your kind of calm.</span>
          <span>Local storefront · Mock payments</span>
        </div>
      </footer>
      {selected && (
        <div className="overlay" onClick={() => setSelected(null)}>
          <section
            className="product-modal"
            role="dialog"
            aria-modal="true"
            aria-label={selected.name}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="close icon-button"
              aria-label="Close product"
              onClick={() => setSelected(null)}
            >
              <X />
            </button>
            <div className={`detail-art ${selected.kind}`}>
              <ProductVisual product={selected} />
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
                <button
                  className="primary"
                  disabled={selected.stock === 0}
                  onClick={() => add(selected)}
                >
                  {selected.stock === 0 ? 'Out of stock' : 'Add to bag'} <ShoppingBag size={17} />
                </button>
                <button
                  className="outline"
                  onClick={() => wish(selected.id)}
                  aria-label="Toggle wishlist"
                >
                  <Heart
                    fill={wishlist.includes(selected.id) ? 'currentColor' : 'none'}
                    size={21}
                  />
                </button>
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
              <button
                className="icon-button"
                aria-label="Close bag"
                onClick={() => setCartOpen(false)}
              >
                <X />
              </button>
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
                          <ProductVisual product={p} />
                        </div>
                        <div className="cart-item-info">
                          <strong>{p.name}</strong>
                          <p>{p.category}</p>
                          <b>{money(p.price)}</b>
                          <div className="quantity">
                            <button
                              aria-label={`Decrease ${p.name}`}
                              onClick={() => change(p.id, -1)}
                            >
                              <Minus size={13} />
                            </button>
                            <span>{cart[p.id]}</span>
                            <button
                              aria-label={`Increase ${p.name}`}
                              onClick={() => change(p.id, 1)}
                            >
                              <Plus size={13} />
                            </button>
                          </div>
                        </div>
                        <button
                          className="remove"
                          onClick={() =>
                            setCart((c) => {
                              const n = { ...c };
                              delete n[p.id];
                              return n;
                            })
                          }
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                </div>
                <div className="cart-bottom">
                  <p>
                    <span>Subtotal</span>
                    <strong>{money(total)}</strong>
                  </p>
                  <small>Shipping calculated at checkout.</small>
                  <button className="primary wide" onClick={checkout}>
                    Continue to checkout <ArrowRight size={17} />
                  </button>
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
                <button
                  className="primary"
                  onClick={() => {
                    setCartOpen(false);
                    go('shop');
                  }}
                >
                  Explore essentials <ArrowRight size={16} />
                </button>
              </div>
            )}
          </aside>
        </div>
      )}
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
              <button
                className="icon-button"
                aria-label="Close search"
                onClick={() => setSearchOpen(false)}
              >
                <X />
              </button>
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
                  <button
                    key={p.id}
                    onClick={() => {
                      setSearchOpen(false);
                      setSelected(p);
                    }}
                  >
                    <div>
                      <ProductVisual product={p} />
                    </div>
                    <span>
                      <strong>{p.name}</strong>
                      <small>{p.subtitle}</small>
                    </span>
                    <b>{money(p.price)}</b>
                    <ArrowRight size={17} />
                  </button>
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
      {toast && (
        <div className="toast" role="status">
          <Check size={17} />
          {toast}
        </div>
      )}
    </>
  );
}
createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    {window.location.pathname.startsWith('/admin') ? <Admin /> : <App />}
  </React.StrictMode>,
);
