import type { ReactNode } from 'react';
export function StorefrontTemplate({
  header,
  footer,
  children,
  overlays,
}: {
  header: ReactNode;
  footer: ReactNode;
  children: ReactNode;
  overlays?: ReactNode;
}) {
  return (
    <>
      {header}
      <main>{children}</main>
      {footer}
      {overlays}
    </>
  );
}
