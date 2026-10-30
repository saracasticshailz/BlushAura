import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '../../components/atoms/Button';
import { SearchField } from '../../components/molecules/SearchField';
import { OrdersTable } from '../../components/organisms/admin/OrdersTable';
import { type AdminModel } from '../../hooks/useAdmin';

type Props = Pick<
  AdminModel,
  | 'view'
  | 'orders'
  | 'orderPage'
  | 'setOrderPage'
  | 'query'
  | 'setQuery'
  | 'loading'
  | 'openOrder'
  | 'shownOrders'
>;
export function AdminOrdersPage(props: Props) {
  const {
    view,
    orders,
    orderPage,
    setOrderPage,
    query,
    setQuery,
    loading,
    openOrder,
    shownOrders,
  } = props;
  return (
    <>
      {view === 'orders' && (
        <section className="admin-panel">
          <div className="admin-table-toolbar">
            <span>
              Customer orders <small>· Payments mocked</small>
            </span>
            <SearchField
              label="Search orders on this page"
              placeholder="Search this page…"
              value={query}
              onChange={setQuery}
            />
          </div>
          <OrdersTable orders={shownOrders} open={openOrder} />
          <div className="admin-pagination">
            <Button
              disabled={orderPage === 0 || loading}
              onClick={() => setOrderPage((p) => p - 1)}
            >
              <ChevronLeft size={16} />
              Previous
            </Button>
            <span>Page {orderPage + 1}</span>
            <Button
              disabled={orders.length < 50 || loading}
              onClick={() => setOrderPage((p) => p + 1)}
            >
              Next
              <ChevronRight size={16} />
            </Button>
          </div>
        </section>
      )}
    </>
  );
}
