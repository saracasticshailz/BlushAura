import { RefreshCw } from 'lucide-react';
import { type AdminModel } from '../../../hooks/useAdmin';
import { Button } from '../../atoms/Button';

type Props = Pick<AdminModel, 'loading' | 'refresh'>;
export function AdminTopbar(props: Props) {
  const { loading, refresh } = props;
  return (
    <header className="admin-topbar">
      <span>
        <span className="workspace-dot" /> Your store is local
      </span>
      <div>
        <span className="admin-db">One shared PostgreSQL database</span>
        <Button onClick={() => refresh()} disabled={loading} aria-label="Refresh admin data">
          <RefreshCw size={16} />
        </Button>
      </div>
    </header>
  );
}
