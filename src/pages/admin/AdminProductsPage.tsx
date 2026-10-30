import { Box, Trash2 } from 'lucide-react';
import { Button } from '../../components/atoms/Button';
import { ProductImage } from '../../components/atoms/ProductImage';
import { SearchField } from '../../components/molecules/SearchField';
import { type AdminModel } from '../../hooks/useAdmin';
import { money } from '../../utils/currency';

type Props = Pick<
  AdminModel,
  | 'confirmArchive'
  | 'view'
  | 'products'
  | 'query'
  | 'setQuery'
  | 'setProduct'
  | 'setError'
  | 'shown'
>;
export function AdminProductsPage(props: Props) {
  const { confirmArchive, view, products, query, setQuery, setProduct, setError, shown } = props;
  return (
    <>
      {view === 'products' && (
        <section className="admin-panel">
          <div className="admin-table-toolbar">
            <span>
              {products.length} products{' '}
              <small>· {products.filter((p) => p.active).length} published</small>
            </span>
            <SearchField
              label="Search admin products"
              placeholder="Search products…"
              value={query}
              onChange={setQuery}
            />
          </div>
          <div className="admin-table-scroll">
            <table>
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Category</th>
                  <th>Price</th>
                  <th>Stock</th>
                  <th>Visibility</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {shown.map((p) => (
                  <tr key={p.id}>
                    <td>
                      <div className="admin-product-cell">
                        <div className="admin-thumb">
                          <ProductImage product={p} />
                        </div>
                        <div>
                          <strong>{p.name}</strong>
                          <small>{p.subtitle}</small>
                        </div>
                      </div>
                    </td>
                    <td>
                      {p.category}
                      <small>{p.subcategory}</small>
                    </td>
                    <td>{money(p.price)}</td>
                    <td>
                      <span className={p.stock < 5 ? 'admin-stock-low' : ''}>{p.stock} units</span>
                    </td>
                    <td>
                      <span className={`admin-pill ${p.active ? 'published' : 'draft'}`}>
                        {p.active ? 'Published' : 'Draft'}
                      </span>
                    </td>
                    <td>
                      <div className="admin-row-actions">
                        <Button
                          onClick={() => {
                            setError('');
                            setProduct({
                              ...p,
                              badge: p.badge || '',
                              imageUrl: p.imageUrl || '',
                            });
                          }}
                        >
                          Edit
                        </Button>
                        {p.active && (
                          <Button
                            aria-label={`Archive ${p.name}`}
                            onClick={() => confirmArchive(p)}
                          >
                            <Trash2 size={15} />
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {!shown.length && (
            <div className="admin-empty">
              <Box size={30} />
              <h2>No products found.</h2>
              <p>Try another search, or add your first essential.</p>
            </div>
          )}
        </section>
      )}
    </>
  );
}
