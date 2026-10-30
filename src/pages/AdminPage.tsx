import { ShieldCheck } from 'lucide-react';
import { AdminNotices } from '../components/molecules/AdminNotices';
import { AdminCategoryEditor } from '../components/organisms/admin/AdminCategoryEditor';
import { AdminImageEditor } from '../components/organisms/admin/AdminImageEditor';
import { AdminOrderDetails } from '../components/organisms/admin/AdminOrderDetails';
import { AdminPageHeading } from '../components/organisms/admin/AdminPageHeading';
import { AdminProductEditor } from '../components/organisms/admin/AdminProductEditor';
import { AdminSidebar } from '../components/organisms/admin/AdminSidebar';
import { AdminTopbar } from '../components/organisms/admin/AdminTopbar';
import { ConfirmationDialog } from '../components/organisms/admin/ConfirmationDialog';
import { AdminTemplate } from '../components/templates/AdminTemplate';
import { brand } from '../config';
import { useAdmin } from '../hooks/useAdmin';
import { AdminCategoriesPage } from './admin/AdminCategoriesPage';
import { AdminOrdersPage } from './admin/AdminOrdersPage';
import { AdminOverviewPage } from './admin/AdminOverviewPage';
import { AdminProductsPage } from './admin/AdminProductsPage';
import { AdminSignInPage } from './admin/AdminSignInPage';
export function AdminPage() {
  const model = useAdmin();
  if (model.checking)
    return (
      <div className="admin-login">
        <div className="admin-login-card">
          <div className="logo">{brand.name}</div>
          <p>Opening your workspace…</p>
        </div>
      </div>
    );
  if (!model.user) return <AdminSignInPage {...model} />;
  return (
    <AdminTemplate
      sidebar={<AdminSidebar {...model} />}
      header={<AdminTopbar {...model} />}
      overlays={
        <>
          <AdminProductEditor {...model} />
          <AdminCategoryEditor {...model} />
          <AdminOrderDetails {...model} />
          <AdminImageEditor {...model} />
          <ConfirmationDialog {...model} />
        </>
      }
    >
      <AdminPageHeading {...model} />
      <AdminNotices
        error={model.error}
        success={model.success}
        onDismiss={() => model.setError('')}
      />
      {model.loading && (
        <p className="admin-loading" role="status">
          Refreshing your workspace…
        </p>
      )}
      <AdminOverviewPage {...model} />
      <AdminProductsPage {...model} />
      <AdminCategoriesPage {...model} />
      <AdminOrdersPage {...model} />
      <div className="admin-footnote">
        <ShieldCheck size={14} />
        {brand.name} admin · Connected to the same catalogue and orders as your storefront
      </div>
    </AdminTemplate>
  );
}
