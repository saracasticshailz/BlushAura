import { Check } from 'lucide-react';
import { type StorefrontModel } from '../../../hooks/useStorefront';

type Props = Pick<StorefrontModel, 'toast'>;
export function StoreToast(props: Props) {
  const { toast } = props;
  return (
    <>
      {toast && (
        <div className="toast" role="status">
          <Check size={17} />
          {toast}
        </div>
      )}
    </>
  );
}
