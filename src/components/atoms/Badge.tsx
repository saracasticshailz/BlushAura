import type { ReactNode } from 'react';
export function Badge({
  children,
  className = 'badge',
}: {
  children: ReactNode;
  className?: string;
}) {
  return <span className={className}>{children}</span>;
}
