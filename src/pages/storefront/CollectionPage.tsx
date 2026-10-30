import { ArrowRight, Heart } from 'lucide-react';
import { Button } from '../../components/atoms/Button';
import { ProductGrid } from '../../components/molecules/ProductGrid';
import { type StorefrontModel } from '../../hooks/useStorefront';

type Props = Pick<
  StorefrontModel,
  | 'products'
  | 'categories'
  | 'categoryNames'
  | 'page'
  | 'category'
  | 'setCategory'
  | 'sub'
  | 'setSub'
  | 'search'
  | 'setSearch'
  | 'sort'
  | 'setSort'
  | 'setSelected'
  | 'wishlist'
  | 'go'
  | 'add'
  | 'wish'
  | 'visible'
>;
export function CollectionPage(props: Props) {
  const {
    products,
    categories,
    categoryNames,
    page,
    category,
    setCategory,
    sub,
    setSub,
    search,
    setSearch,
    sort,
    setSort,
    setSelected,
    wishlist,
    go,
    add,
    wish,
    visible,
  } = props;
  return (
    <section className="section collection">
      <div className="breadcrumb">
        <Button onClick={() => go('home')}>Home</Button> /{' '}
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
            <Button
              className={c === category ? 'selected' : ''}
              key={c}
              onClick={() => {
                setCategory(c);
                setSub('All');
              }}
            >
              {c}
            </Button>
          ))}
        </div>
        <select value={sort} onChange={(e) => setSort(e.target.value)} aria-label="Sort products">
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
              ...new Set(products.filter((p) => p.category === category).map((p) => p.subcategory)),
            ]),
          ].map((s) => (
            <Button className={s === sub ? 'selected' : ''} key={s} onClick={() => setSub(s)}>
              {s}
            </Button>
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
        <ProductGrid
          products={visible}
          wishlist={wishlist}
          onView={setSelected}
          onToggleWishlist={wish}
          onAdd={add}
        />
      ) : (
        <div className="empty">
          <Heart size={36} />
          <h2>{page === 'wishlist' ? 'Your favourites are waiting.' : 'No essentials found.'}</h2>
          <p>
            {page === 'wishlist'
              ? 'Tap the heart on something you love.'
              : 'Try another search or category.'}
          </p>
          <Button variant="primary" onClick={() => go('shop')}>
            Explore the collection <ArrowRight size={16} />
          </Button>
        </div>
      )}
    </section>
  );
}
