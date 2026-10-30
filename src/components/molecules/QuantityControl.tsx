import { Minus, Plus } from 'lucide-react';
import { Button } from '../atoms/Button';
export function QuantityControl({
  name,
  value,
  onChange,
}: {
  name: string;
  value: number;
  onChange: (delta: number) => void;
}) {
  return (
    <div className="quantity">
      <Button aria-label={`Decrease ${name}`} onClick={() => onChange(-1)}>
        <Minus size={13} />
      </Button>
      <span>{value}</span>
      <Button aria-label={`Increase ${name}`} onClick={() => onChange(1)}>
        <Plus size={13} />
      </Button>
    </div>
  );
}
