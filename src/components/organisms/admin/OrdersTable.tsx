import { ArrowUpRight, ClipboardList } from 'lucide-react';
import type { Order } from '../../../types/admin';
import { money } from '../../../utils/currency';
import { date } from '../../../utils/date';
import { Button } from '../../atoms/Button';
export function OrdersTable({ orders, open }: { orders: Order[]; open: (id: string) => void }) {
  return orders.length ? (
    <div className="admin-table-scroll">
      <table>
        <thead>
          <tr>
            <th>Order</th>
            <th>Customer</th>
            <th>Total</th>
            <th>Status</th>
            <th />
          </tr>
        </thead>
        <tbody>
          {orders.map((o) => (
            <tr key={o.id}>
              <td>
                <strong className="admin-order-short">{o.id.slice(0, 11).toUpperCase()}</strong>
                <small>{date(o.createdAt)}</small>
              </td>
              <td>{o.customerName}</td>
              <td>{money(o.total)}</td>
              <td>
                <span className={'admin-pill ' + o.fulfillment.toLowerCase()}>{o.fulfillment}</span>
              </td>
              <td>
                <Button
                  className="admin-view-order"
                  onClick={() => open(o.id)}
                  aria-label={`View order ${o.id}`}
                >
                  <ArrowUpRight size={17} />
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  ) : (
    <div className="admin-empty">
      <ClipboardList size={30} />
      <h2>A little quiet here.</h2>
      <p>Orders placed in the customer storefront will appear here.</p>
    </div>
  );
}
