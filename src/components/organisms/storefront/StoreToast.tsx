import { Check } from 'lucide-react';
import { type StorefrontModel } from '../../../hooks/useStorefront';
import { Button } from '../../atoms/Button';

type Props = Pick<StorefrontModel, 'toast' | 'toastCanOpenCart' | 'openCartFromToast'>;
export function StoreToast(props: Props) {
  const { toast, toastCanOpenCart, openCartFromToast } = props;
  return (
    <>
      {toast && (
        <div className="toast" role="status">
          <Check size={17} aria-hidden="true" />
          <span>{toast}</span>
          {toastCanOpenCart && (
            <Button className="toast-action" onClick={openCartFromToast}>
              View bag
            </Button>
          )}
        </div>
      )}
    </>
  );
}
