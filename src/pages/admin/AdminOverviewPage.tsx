import { ArrowUpRight, Box, Check, ClipboardList, FolderTree, Package } from 'lucide-react';
import { Button } from '../../components/atoms/Button';
import { ProductImage } from '../../components/atoms/ProductImage';
import { OrdersTable } from '../../components/organisms/admin/OrdersTable';
import { type AdminModel } from '../../hooks/useAdmin';
import { money } from '../../utils/currency';

type Props = Pick<
  AdminModel,
  'view' | 'products' | 'stats' | 'orders' | 'setProduct' | 'navigate' | 'openOrder'
>;
export function AdminOverviewPage(props: Props) {
  const { view, products, stats, orders, setProduct, navigate, openOrder } = props;
  return (
    <>
      {view === 'overview' && (
        <>
          <div className="admin-stat-grid">
            {[
              {
                label: 'Demo order value',
                value: money(stats?.demoRevenue || 0),
                note: 'Excludes cancelled orders',
                icon: Package,
              },
              {
                label: 'Total orders',
                value: stats?.orders || 0,
                note: `${stats?.newOrders || 0} waiting to be processed`,
                icon: ClipboardList,
              },
              {
                label: 'Active products',
                value: stats?.activeProducts || 0,
                note: `${stats?.products || 0} products in your collection`,
                icon: Box,
              },
              {
                label: 'Low stock',
                value: stats?.lowStock || 0,
                note: 'Active products with fewer than 5 units',
                icon: Package,
              },
            ].map((s) => (
              <div className="admin-stat" key={s.label}>
                <div>
                  <span>{s.label}</span>
                  <s.icon size={18} />
                </div>
                <strong>{s.value}</strong>
                <small>{s.note}</small>
              </div>
            ))}
          </div>
          <div className="admin-overview-grid">
            <section className="admin-panel">
              <div className="admin-panel-heading">
                <div>
                  <h2>The latest little orders</h2>
                  <p>Recent activity from your storefront</p>
                </div>
                <Button variant="text" onClick={() => navigate('orders')}>
                  View all <ArrowUpRight size={15} />
                </Button>
              </div>
              <OrdersTable orders={orders.slice(0, 5)} open={openOrder} />
            </section>
            <section className="admin-panel admin-quick">
              <span className="eyebrow">MAKE SOMETHING LOVELY</span>
              <h2>
                Your next
                <br />
                <em>little update.</em>
              </h2>
              <p>Freshen up a product, add a new ritual, or check in on an order.</p>
              <Button onClick={() => navigate('products')}>
                <Box size={19} />
                <span>Manage products</span>
                <ArrowUpRight size={17} />
              </Button>
              <Button onClick={() => navigate('categories')}>
                <FolderTree size={19} />
                <span>Organise categories</span>
                <ArrowUpRight size={17} />
              </Button>
              <div className="admin-demo-note">
                Payments are mocked. Order value here is demo activity, not collected revenue.
              </div>
            </section>
          </div>
          <section className="admin-panel admin-stock-panel">
            <div className="admin-panel-heading">
              <div>
                <h2>A little attention needed</h2>
                <p>Active products with low stock</p>
              </div>
            </div>
            {products.filter((p) => p.active && p.stock < 5).length ? (
              <div className="admin-low-stock">
                {products
                  .filter((p) => p.active && p.stock < 5)
                  .map((p) => (
                    <Button key={p.id} onClick={() => setProduct(p)}>
                      <div className="admin-thumb">
                        <ProductImage product={p} />
                      </div>
                      <span>{p.name}</span>
                      <b>{p.stock} left</b>
                      <ArrowUpRight size={16} />
                    </Button>
                  ))}
              </div>
            ) : (
              <div className="admin-empty compact">
                <Check size={24} />
                <p>All stocked up. Your active collection is looking good.</p>
              </div>
            )}
          </section>
        </>
      )}
    </>
  );
}
