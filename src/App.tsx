import { lazy, Suspense } from 'react';
import { StorefrontPage } from './pages/StorefrontPage';
const AdminPage = lazy(() =>
  import('./pages/AdminPage').then((module) => ({ default: module.AdminPage })),
);
export function App() {
  return window.location.pathname.startsWith('/admin') ? (
    <Suspense
      fallback={
        <div className="admin-login">
          <p role="status">Opening your workspace…</p>
        </div>
      }
    >
      <AdminPage />
    </Suspense>
  ) : (
    <StorefrontPage />
  );
}
