import { ArrowRight, Leaf, Package, ShieldCheck, Truck } from 'lucide-react';
import { Button } from '../../components/atoms/Button';
import { ProductArt } from '../../components/atoms/ProductArt';
import { ProductGrid } from '../../components/molecules/ProductGrid';
import { brand } from '../../config';
import { type StorefrontModel } from '../../hooks/useStorefront';

type Props = Pick<
  StorefrontModel,
  'products' | 'categoryNames' | 'setSelected' | 'wishlist' | 'notify' | 'go' | 'add' | 'wish'
>;
export function HomePage(props: Props) {
  const { products, categoryNames, setSelected, wishlist, notify, go, add, wish } = props;
  return (
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
          <Button variant="primary" onClick={() => go('shop')}>
            Find your feel-good <ArrowRight size={17} />
          </Button>
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
          <span className="image-caption">{brand.uppercaseName} · THE EVERYDAY COLLECTION</span>
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
              <Button className="category-card" key={c.name} onClick={() => go('shop', c.name)}>
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
              </Button>
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
          <Button variant="text" onClick={() => go('shop')}>
            Explore all essentials <ArrowRight size={17} />
          </Button>
        </div>
        <ProductGrid
          products={products.slice(0, 4)}
          wishlist={wishlist}
          onView={setSelected}
          onToggleWishlist={wish}
          onAdd={add}
        />
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
          <div className="eyebrow">A NOTE FROM {brand.uppercaseName}</div>
          <h2>
            Feeling good
            <br />
            comes <em>naturally.</em>
          </h2>
          <p>
            We believe taking care of yourself should feel as good as it sounds. No complicated
            routines. No expectations. Just thoughtful essentials that make room for a little more
            you.
          </p>
          <p>For the slow mornings, the long days, and every beautiful in-between.</p>
          <Button variant="text" onClick={() => go('shop')}>
            Make yourself a priority <ArrowRight size={18} />
          </Button>
        </div>
      </section>
      <section className="newsletter">
        <span className="eyebrow">LET’S STAY CLOSE</span>
        <h2>A little good in your inbox.</h2>
        <p>New rituals, thoughtful reads, and first dibs on all things {brand.name}.</p>
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
          <Button aria-label="Subscribe">
            <ArrowRight size={21} />
          </Button>
        </form>
        <small>By subscribing, you agree to hear from {brand.name}. Unsubscribe anytime.</small>
      </section>
    </>
  );
}
