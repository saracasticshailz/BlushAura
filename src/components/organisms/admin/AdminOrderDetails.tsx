import { X } from 'lucide-react';
import { statuses } from '../../../data/admin';
import { type AdminModel } from '../../../hooks/useAdmin';
import { money } from '../../../utils/currency';
import { date } from '../../../utils/date';
import { Button } from '../../atoms/Button';

type Props = Pick<
  AdminModel,
  | 'order'
  | 'setOrder'
  | 'nextStatus'
  | 'setNextStatus'
  | 'error'
  | 'busy'
  | 'setConfirm'
  | 'changeStatus'
>;
export function AdminOrderDetails(props: Props) {
  const { order, setOrder, nextStatus, setNextStatus, error, busy, setConfirm, changeStatus } =
    props;
  return (
    <>
      {order && (
        <div className="admin-overlay">
          <section
            className="admin-modal order-editor"
            role="dialog"
            aria-modal="true"
            aria-label="Order details"
          >
            <div className="admin-modal-heading">
              <div>
                <span className="eyebrow">EVERY ORDER MATTERS</span>
                <h2>Order details</h2>
              </div>
              <Button
                aria-label="Close order details"
                disabled={busy}
                onClick={() => setOrder(null)}
              >
                <X />
              </Button>
            </div>
            <div className="admin-form-body">
              {error && (
                <div className="admin-alert error" role="alert">
                  {error}
                </div>
              )}
              <p className="admin-order-id">{order.id}</p>
              <div className="admin-order-meta">
                <span>{date(order.createdAt)}</span>
                <span className={'admin-pill ' + order.fulfillment.toLowerCase()}>
                  {order.fulfillment}
                </span>
              </div>
              <div className="admin-order-address">
                <h3>Deliver to</h3>
                <strong>{order.customerName}</strong>
                <p>
                  {order.email}
                  <br />
                  {order.street}
                  <br />
                  {order.city}, {order.postal}
                  <br />
                  {order.country}
                </p>
              </div>
              {order.items.map((item, i) => (
                <div className="admin-order-line" key={i}>
                  <span>
                    {item.name}
                    <small>
                      Qty {item.quantity} × {money(item.unitPrice)}
                    </small>
                  </span>
                  <strong>{money(item.quantity * item.unitPrice)}</strong>
                </div>
              ))}
              <div className="admin-order-totals">
                <p>
                  <span>Subtotal</span>
                  <span>{money(order.subtotal)}</span>
                </p>
                <p>
                  <span>Shipping</span>
                  <span>{money(order.shipping)}</span>
                </p>
                <p>
                  <strong>Total</strong>
                  <strong>{money(order.total)}</strong>
                </p>
              </div>
              <div className="admin-demo-note">
                {order.paymentMethod === 'paypal' ? 'PayPal' : 'Card'} · Mock payment. No money was
                collected.
              </div>
              {!!statuses[order.fulfillment]?.length && (
                <div className="admin-status-form">
                  <label>
                    Update fulfillment
                    <select value={nextStatus} onChange={(e) => setNextStatus(e.target.value)}>
                      <option value="">Choose next status</option>
                      {statuses[order.fulfillment].map((s) => (
                        <option key={s}>{s}</option>
                      ))}
                    </select>
                  </label>
                  <Button
                    variant="primary"
                    disabled={!nextStatus || busy}
                    onClick={() =>
                      nextStatus === 'CANCELLED'
                        ? setConfirm({
                            title: 'Cancel this demo order?',
                            body: 'Its stock will be returned to the catalogue once. This order will remain in your history.',
                            action: changeStatus,
                          })
                        : void changeStatus()
                    }
                  >
                    {busy ? 'Updating…' : 'Update status'}
                  </Button>
                </div>
              )}
            </div>
          </section>
        </div>
      )}
    </>
  );
}
