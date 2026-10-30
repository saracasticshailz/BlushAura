import { Check, X } from 'lucide-react';
import type { ReactNode } from 'react';
import { Button } from '../atoms/Button';
export function Notice({
  tone,
  children,
  onDismiss,
}: {
  tone: 'error' | 'success';
  children: ReactNode;
  onDismiss?: () => void;
}) {
  return (
    <div className={`admin-alert ${tone}`} role={tone === 'error' ? 'alert' : 'status'}>
      {tone === 'success' && <Check size={17} />}
      <span>{children}</span>
      {onDismiss && (
        <Button aria-label="Dismiss error" onClick={onDismiss}>
          <X size={16} />
        </Button>
      )}
    </div>
  );
}
