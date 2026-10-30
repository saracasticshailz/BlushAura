import { ArrowUpRight, ShieldCheck } from 'lucide-react';
import { Button } from '../../components/atoms/Button';
import { ProductArt } from '../../components/atoms/ProductArt';
import { AdminNotices } from '../../components/molecules/AdminNotices';
import { brand } from '../../config';
import { type AdminModel } from '../../hooks/useAdmin';

type Props = Pick<AdminModel, 'setError' | 'success' | 'error' | 'busy' | 'login'>;
export function AdminSignInPage(props: Props) {
  const { setError, success, error, busy, login } = props;
  return (
    <div className="admin-login">
      <div className="admin-login-story">
        <div className="logo">
          {brand.name}
          <span>THE THOUGHTFUL SIDE OF BUSINESS</span>
        </div>
        <span className="eyebrow">YOUR STORE, BEAUTIFULLY IN HAND</span>
        <h1>
          Good things
          <br />
          start{' '}
          <em>
            behind
            <br />
            the scenes.
          </em>
        </h1>
        <p>
          Your collection. Your customers.
          <br />
          One little space to bring it all together.
        </p>
        <div className="admin-login-art">
          <ProductArt hero />
        </div>
      </div>
      <div className="admin-login-form">
        <a className="admin-back" href="/">
          ← Back to the storefront
        </a>
        <div className="admin-login-card">
          <div className="admin-lock">
            <ShieldCheck size={25} />
          </div>
          <span className="eyebrow">{brand.uppercaseName} · SUPER ADMIN</span>
          <h2>Welcome to your space.</h2>
          <p>Sign in to take care of the little details.</p>
          <AdminNotices error={error} success={success} onDismiss={() => setError('')} />
          <form onSubmit={login}>
            <label>
              Email address
              <input
                required
                type="email"
                name="email"
                autoComplete="username"
                defaultValue="admin@blushaura.local"
              />
            </label>
            <label>
              Password
              <input required type="password" name="password" autoComplete="current-password" />
            </label>
            <Button variant="primary" className="wide" disabled={busy}>
              {busy ? 'Signing in…' : 'Sign in to your store'}
              <ArrowUpRight size={17} />
            </Button>
          </form>
          <div className="admin-login-help">
            <ShieldCheck size={16} />
            <p>
              Your local admin credentials are in
              <br />
              <code>backend/.local/admin-credentials.txt</code>
            </p>
          </div>
        </div>
        <small>Local workspace · Customer and admin data share the same database</small>
      </div>
    </div>
  );
}
