import { ArrowRight, Check } from 'lucide-react';
import { Button } from '../../components/atoms/Button';
import { brand } from '../../config';
import { type StorefrontModel } from '../../hooks/useStorefront';

type Props = Pick<StorefrontModel, 'order' | 'go'>;
export function OrderSuccessPage(props: Props) {
  const { order, go } = props;
  return (
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
        Saved in your local {brand.name} database. No payment was collected, email sent, or delivery
        scheduled.
      </p>
      <Button variant="primary" onClick={() => go('shop')}>
        Keep exploring <ArrowRight size={17} />
      </Button>
    </section>
  );
}
