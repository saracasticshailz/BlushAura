import type { ReactNode } from 'react';
export function AdminTemplate({
  sidebar,
  header,
  children,
  overlays,
}: {
  sidebar: ReactNode;
  header: ReactNode;
  children: ReactNode;
  overlays?: ReactNode;
}) {
  return (
    <div className="admin-shell">
      {sidebar}
      <div className="admin-main">
        {header}
        <main className="admin-content">{children}</main>
      </div>
      {overlays}
    </div>
  );
}
