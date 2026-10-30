import {
  ArrowUpRight,
  Box,
  ClipboardList,
  Eye,
  FolderTree,
  LayoutDashboard,
  LogOut,
} from 'lucide-react';
import { brand } from '../../../config';
import { type AdminModel } from '../../../hooks/useAdmin';
import { BrandLogo } from '../../atoms/BrandLogo';
import { Button } from '../../atoms/Button';

type Props = Pick<AdminModel, 'user' | 'view' | 'stats' | 'busy' | 'navigate' | 'logout'>;
export function AdminSidebar(props: Props) {
  const { user, view, stats, busy, navigate, logout } = props;
  return (
    <aside className="admin-sidebar">
      <BrandLogo href="/admin" tagline="THE ADMIN EDIT" />
      <div className="admin-workspace">
        <span className="workspace-dot" />
        <div>
          <strong>{brand.name} store</strong>
          <small>Local workspace</small>
        </div>
      </div>
      <span className="admin-nav-label">YOUR WORKSPACE</span>
      <nav>
        {[
          { id: 'overview', label: 'Overview', icon: LayoutDashboard },
          { id: 'products', label: 'Products', icon: Box },
          { id: 'categories', label: 'Categories', icon: FolderTree },
          { id: 'orders', label: 'Orders', icon: ClipboardList },
        ].map((n) => (
          <Button
            key={n.id}
            className={view === n.id ? 'active' : ''}
            onClick={() => navigate(n.id)}
          >
            <n.icon size={18} />
            {n.label}
            {n.id === 'orders' && !!stats?.newOrders && <small>{stats.newOrders}</small>}
          </Button>
        ))}
      </nav>
      <div className="admin-sidebar-bottom">
        <a href="/" target="_blank" rel="noreferrer">
          <Eye size={17} /> Visit storefront <ArrowUpRight size={15} />
        </a>
        <div className="admin-user">
          <span>BA</span>
          <div>
            <strong>Super admin</strong>
            <small>{user}</small>
          </div>
        </div>
        <Button onClick={logout} disabled={busy}>
          <LogOut size={16} /> Sign out
        </Button>
      </div>
    </aside>
  );
}
