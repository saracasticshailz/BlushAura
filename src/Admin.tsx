import { brand } from './config';
import { useEffect, useState, type FormEvent } from 'react';
import {
  ArrowUpRight,
  Box,
  ChevronLeft,
  ChevronRight,
  ClipboardList,
  FolderTree,
  ImagePlus,
  LayoutDashboard,
  LogOut,
  Package,
  Plus,
  Search,
  ShieldCheck,
  Trash2,
  X,
  Check,
  Eye,
  RefreshCw,
} from 'lucide-react';
import { api, ApiError, jsonRequest, type Category } from './api';
import { money, type Product } from './catalog';
import { ProductArt } from './Art';
import './admin.css';
import { ImageUploadEditor, type ImageSize } from './ImageUploadEditor';
type AdminProduct = Product & { stock: number; active: boolean; displayOrder: number };
type Stats = {
  products: number;
  activeProducts: number;
  lowStock: number;
  categories: number;
  orders: number;
  newOrders: number;
  demoRevenue: number;
};
type Order = {
  id: string;
  customerName: string;
  total: number;
  currency: string;
  fulfillment: string;
  createdAt: string;
  paymentMethod: string;
};
type OrderDetail = Order & {
  email: string;
  street: string;
  city: string;
  postal: string;
  country: string;
  subtotal: number;
  shipping: number;
  items: { name: string; quantity: number; unitPrice: number }[];
};
const blank: AdminProduct = {
  id: '',
  name: '',
  subtitle: '',
  category: '',
  subcategory: '',
  price: 0,
  original: 0,
  color: '#b56a7d',
  kind: 'wand',
  badge: '',
  description: '',
  imageUrl: '',
  stock: 25,
  active: false,
  displayOrder: 0,
};
const statuses: Record<string, string[]> = {
  NEW: ['PROCESSING', 'CANCELLED'],
  PROCESSING: ['SHIPPED', 'CANCELLED'],
  SHIPPED: ['COMPLETED'],
  COMPLETED: [],
  CANCELLED: [],
};
const date = (value: string) =>
  new Date(value).toLocaleString('en-GB', { dateStyle: 'medium', timeStyle: 'short' });
function Thumb({ p }: { p: Product }) {
  return p.imageUrl ? (
    <img src={p.imageUrl} alt={p.name} />
  ) : (
    <ProductArt kind={p.kind} color={p.color} />
  );
}
export function Admin() {
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [user, setUser] = useState<string | null>(null),
    [checking, setChecking] = useState(true),
    [view, setView] = useState('overview'),
    [products, setProducts] = useState<AdminProduct[]>([]),
    [categories, setCategories] = useState<Category[]>([]),
    [stats, setStats] = useState<Stats | null>(null),
    [orders, setOrders] = useState<Order[]>([]),
    [orderPage, setOrderPage] = useState(0),
    [query, setQuery] = useState(''),
    [product, setProduct] = useState<AdminProduct | null>(null),
    [category, setCategory] = useState<Category | null>(null),
    [categoryOriginal, setCategoryOriginal] = useState(''),
    [order, setOrder] = useState<OrderDetail | null>(null),
    [nextStatus, setNextStatus] = useState(''),
    [error, setError] = useState(''),
    [success, setSuccess] = useState(''),
    [busy, setBusy] = useState(false),
    [loading, setLoading] = useState(false),
    [uploading, setUploading] = useState(false),
    [confirm, setConfirm] = useState<{
      title: string;
      body: string;
      action: () => Promise<void>;
    } | null>(null);
  function fail(e: unknown) {
    setError(
      e instanceof TypeError
        ? 'Cannot reach the local backend. Start the API and try again.'
        : e instanceof Error
          ? e.message
          : 'Something went wrong.',
    );
    if (e instanceof ApiError && e.status === 401) setUser(null);
  }
  async function refresh(page = orderPage) {
    setLoading(true);
    try {
      const [p, c, s, o] = await Promise.all([
        api<AdminProduct[]>('/api/admin/products'),
        api<Category[]>('/api/admin/categories'),
        api<Stats>('/api/admin/dashboard'),
        api<Order[]>(`/api/admin/orders?page=${page}`),
      ]);
      setProducts(p);
      setCategories(c);
      setStats(s);
      setOrders(o);
    } catch (e) {
      fail(e);
    } finally {
      setLoading(false);
    }
  }
  useEffect(() => {
    api<{ email: string }>('/api/admin/session')
      .then((s) => setUser(s.email))
      .catch((e) => {
        if (!(e instanceof ApiError && e.status === 401)) fail(e);
      })
      .finally(() => setChecking(false));
  }, []);
  useEffect(() => {
    if (user) void refresh();
  }, [user, orderPage]);
  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => setSuccess(''), 4000);
      return () => clearTimeout(timer);
    }
  }, [success]);
  useEffect(() => {
    const open = !!product || !!category || !!order || !!confirm;
    if (!open) return;
    const old = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = old;
    };
  }, [product, category, order, confirm]);
  function navigate(tab: string) {
    setView(tab);
    setQuery('');
    setError('');
  }
  async function login(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    setBusy(true);
    setError('');
    try {
      await api('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          username: String(form.get('email')),
          password: String(form.get('password')),
        }),
      });
      const session = await api<{ email: string }>('/api/admin/session');
      setUser(session.email);
    } catch (e) {
      fail(e);
    } finally {
      setBusy(false);
    }
  }
  async function logout() {
    setBusy(true);
    try {
      await api('/api/admin/logout', { method: 'POST' });
      setUser(null);
      setProducts([]);
      setOrders([]);
      setStats(null);
      setOrder(null);
      setProduct(null);
      setCategory(null);
    } catch (e) {
      fail(e);
    } finally {
      setBusy(false);
    }
  }
  async function saveProduct(e: FormEvent) {
    e.preventDefault();
    if (!product) return;
    setBusy(true);
    setError('');
    try {
      const { id, ...payload } = product;
      await api(
        `/api/admin/products${id ? '/' + encodeURIComponent(id) : ''}`,
        jsonRequest(id ? 'PUT' : 'POST', payload),
      );
      setProduct(null);
      setSuccess(id ? 'Product updated. Changes are live in the storefront.' : 'Product created.');
      await refresh();
    } catch (e) {
      fail(e);
    } finally {
      setBusy(false);
    }
  }
  async function upload(file: File, size: ImageSize) {
    if (!file || !product) return;
    if (!['image/jpeg', 'image/png'].includes(file.type) || file.size > 5 * 1024 * 1024) {
      setError('Choose a JPEG or PNG image up to 5 MB.');
      return;
    }
    setUploading(true);
    setError('');
    try {
      const form = new FormData();
      form.set('file', file);
      form.set('width', String(size.width));
      form.set('height', String(size.height));
      form.set('scale', String(size.scale));
      if (size.crop) {
        form.set('cropX', String(size.crop.x));
        form.set('cropY', String(size.crop.y));
        form.set('cropWidth', String(size.crop.width));
        form.set('cropHeight', String(size.crop.height));
      }
      const result = await api<{ url: string }>('/api/admin/media', { method: 'POST', body: form });
      setProduct((p) => (p ? { ...p, imageUrl: result.url } : p));
      setImageFile(null);
      setSuccess('Resized image uploaded. Save the product to publish it.');
    } catch (e) {
      fail(e);
      throw e;
    } finally {
      setUploading(false);
    }
  }
  function chooseImage(file?: File) {
    if (!file) return;
    if (!['image/jpeg', 'image/png'].includes(file.type) || file.size > 5 * 1024 * 1024) {
      setError('Choose a JPEG or PNG image up to 5 MB.');
      return;
    }
    setError('');
    setImageFile(file);
  }
  async function resizeExisting() {
    if (!product?.imageUrl) return;
    setUploading(true);
    setError('');
    try {
      const response = await fetch(product.imageUrl);
      if (!response.ok)
        throw new Error('Could not load the current image. Please upload it again.');
      const blob = await response.blob();
      chooseImage(new File([blob], 'product-image', { type: blob.type }));
    } catch (e) {
      fail(e);
    } finally {
      setUploading(false);
    }
  }
  async function saveCategory(e: FormEvent) {
    e.preventDefault();
    if (!category) return;
    setBusy(true);
    setError('');
    try {
      const payload = {
        name: category.name.trim(),
        subcategories: category.subcategories.map((s) => s.trim()).filter(Boolean),
      };
      await api(
        '/api/admin/categories' +
          (categoryOriginal ? '/' + encodeURIComponent(categoryOriginal) : ''),
        jsonRequest(categoryOriginal ? 'PUT' : 'POST', payload),
      );
      setCategory(null);
      setSuccess('Category saved.');
      await refresh();
    } catch (e) {
      fail(e);
    } finally {
      setBusy(false);
    }
  }
  async function openOrder(id: string) {
    setLoading(true);
    try {
      const value = await api<OrderDetail>('/api/admin/orders/' + encodeURIComponent(id));
      setOrder(value);
      setNextStatus('');
    } catch (e) {
      fail(e);
    } finally {
      setLoading(false);
    }
  }
  async function changeStatus() {
    if (!order || !nextStatus) return;
    setBusy(true);
    try {
      await api('/api/admin/orders/' + order.id, jsonRequest('PATCH', { fulfillment: nextStatus }));
      setOrder({ ...order, fulfillment: nextStatus });
      setNextStatus('');
      setSuccess('Order status updated.');
      await refresh();
    } catch (e) {
      fail(e);
    } finally {
      setBusy(false);
    }
  }
  const shown = products.filter((p) =>
    `${p.name} ${p.category} ${p.subcategory}`.toLowerCase().includes(query.toLowerCase()),
  );
  const shownOrders = orders.filter((o) =>
    `${o.id} ${o.customerName} ${o.fulfillment}`.toLowerCase().includes(query.toLowerCase()),
  );
  const banner = (
    <>
      {error && (
        <div className="admin-alert error" role="alert">
          <span>{error}</span>
          <button aria-label="Dismiss error" onClick={() => setError('')}>
            <X size={16} />
          </button>
        </div>
      )}
      {success && (
        <div className="admin-alert success" role="status">
          <Check size={17} />
          {success}
        </div>
      )}
    </>
  );
  if (checking)
    return (
      <div className="admin-login">
        <div className="admin-login-card">
          <div className="logo">{brand.name}</div>
          <p>Opening your workspace…</p>
        </div>
      </div>
    );
  if (!user)
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
            {banner}
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
              <button className="primary wide" disabled={busy}>
                {busy ? 'Signing in…' : 'Sign in to your store'}
                <ArrowUpRight size={17} />
              </button>
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
  return (
    <div className="admin-shell">
      <aside className="admin-sidebar">
        <a className="logo" href="/admin">
          {brand.name}
          <span>THE ADMIN EDIT</span>
        </a>
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
            <button
              key={n.id}
              className={view === n.id ? 'active' : ''}
              onClick={() => navigate(n.id)}
            >
              <n.icon size={18} />
              {n.label}
              {n.id === 'orders' && !!stats?.newOrders && <small>{stats.newOrders}</small>}
            </button>
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
          <button onClick={logout} disabled={busy}>
            <LogOut size={16} /> Sign out
          </button>
        </div>
      </aside>
      <div className="admin-main">
        <header className="admin-topbar">
          <span>
            <span className="workspace-dot" /> Your store is local
          </span>
          <div>
            <span className="admin-db">One shared PostgreSQL database</span>
            <button onClick={() => refresh()} disabled={loading} aria-label="Refresh admin data">
              <RefreshCw size={16} />
            </button>
          </div>
        </header>
        <main className="admin-content">
          <div className="admin-page-heading">
            <div>
              <span className="eyebrow">A LITTLE CARE GOES A LONG WAY</span>
              <h1>
                {view === 'overview'
                  ? 'Your store, at a glance.'
                  : view === 'products'
                    ? 'The feel-good collection.'
                    : view === 'categories'
                      ? 'A place for everything.'
                      : 'Every little order.'}
              </h1>
              <p>
                {view === 'overview'
                  ? `Here’s what’s happening at ${brand.name} today.`
                  : view === 'products'
                    ? 'Curate the essentials your customers will fall in love with.'
                    : view === 'categories'
                      ? 'Give your collection a thoughtful structure.'
                      : 'Real local records. Mock payments. Thoughtful service.'}
              </p>
            </div>
            {view === 'products' && (
              <button
                className="primary"
                onClick={() => {
                  setError('');
                  setProduct({
                    ...blank,
                    category: categories[0]?.name || '',
                    subcategory: categories[0]?.subcategories[0] || '',
                  });
                }}
              >
                <Plus size={16} />
                Add product
              </button>
            )}
            {view === 'categories' && (
              <button
                className="primary"
                onClick={() => {
                  setError('');
                  setCategoryOriginal('');
                  setCategory({ name: '', subcategories: [''] });
                }}
              >
                <Plus size={16} />
                Add category
              </button>
            )}
          </div>
          {banner}
          {loading && (
            <p className="admin-loading" role="status">
              Refreshing your workspace…
            </p>
          )}
          {view === 'overview' && (
            <>
              <div className="admin-stat-grid">
                {[
                  {
                    label: 'Demo order value',
                    value: money(stats?.demoRevenue || 0),
                    note: 'Excludes cancelled orders',
                    icon: ShoppingIcon,
                  },
                  {
                    label: 'Total orders',
                    value: stats?.orders || 0,
                    note: `${stats?.newOrders || 0} waiting to be processed`,
                    icon: ClipboardList,
                  },
                  {
                    label: 'Active products',
                    value: stats?.activeProducts || 0,
                    note: `${stats?.products || 0} products in your collection`,
                    icon: Box,
                  },
                  {
                    label: 'Low stock',
                    value: stats?.lowStock || 0,
                    note: 'Active products with fewer than 5 units',
                    icon: Package,
                  },
                ].map((s) => (
                  <div className="admin-stat" key={s.label}>
                    <div>
                      <span>{s.label}</span>
                      <s.icon size={18} />
                    </div>
                    <strong>{s.value}</strong>
                    <small>{s.note}</small>
                  </div>
                ))}
              </div>
              <div className="admin-overview-grid">
                <section className="admin-panel">
                  <div className="admin-panel-heading">
                    <div>
                      <h2>The latest little orders</h2>
                      <p>Recent activity from your storefront</p>
                    </div>
                    <button className="text-link" onClick={() => navigate('orders')}>
                      View all <ArrowUpRight size={15} />
                    </button>
                  </div>
                  <OrderTable orders={orders.slice(0, 5)} open={openOrder} />
                </section>
                <section className="admin-panel admin-quick">
                  <span className="eyebrow">MAKE SOMETHING LOVELY</span>
                  <h2>
                    Your next
                    <br />
                    <em>little update.</em>
                  </h2>
                  <p>Freshen up a product, add a new ritual, or check in on an order.</p>
                  <button onClick={() => navigate('products')}>
                    <Box size={19} />
                    <span>Manage products</span>
                    <ArrowUpRight size={17} />
                  </button>
                  <button onClick={() => navigate('categories')}>
                    <FolderTree size={19} />
                    <span>Organise categories</span>
                    <ArrowUpRight size={17} />
                  </button>
                  <div className="admin-demo-note">
                    Payments are mocked. Order value here is demo activity, not collected revenue.
                  </div>
                </section>
              </div>
              <section className="admin-panel admin-stock-panel">
                <div className="admin-panel-heading">
                  <div>
                    <h2>A little attention needed</h2>
                    <p>Active products with low stock</p>
                  </div>
                </div>
                {products.filter((p) => p.active && p.stock < 5).length ? (
                  <div className="admin-low-stock">
                    {products
                      .filter((p) => p.active && p.stock < 5)
                      .map((p) => (
                        <button key={p.id} onClick={() => setProduct(p)}>
                          <div className="admin-thumb">
                            <Thumb p={p} />
                          </div>
                          <span>{p.name}</span>
                          <b>{p.stock} left</b>
                          <ArrowUpRight size={16} />
                        </button>
                      ))}
                  </div>
                ) : (
                  <div className="admin-empty compact">
                    <Check size={24} />
                    <p>All stocked up. Your active collection is looking good.</p>
                  </div>
                )}
              </section>
            </>
          )}
          {view === 'products' && (
            <section className="admin-panel">
              <div className="admin-table-toolbar">
                <span>
                  {products.length} products{' '}
                  <small>· {products.filter((p) => p.active).length} published</small>
                </span>
                <div className="admin-search">
                  <Search size={16} />
                  <input
                    placeholder="Search products…"
                    aria-label="Search admin products"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                  />
                </div>
              </div>
              <div className="admin-table-scroll">
                <table>
                  <thead>
                    <tr>
                      <th>Product</th>
                      <th>Category</th>
                      <th>Price</th>
                      <th>Stock</th>
                      <th>Visibility</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {shown.map((p) => (
                      <tr key={p.id}>
                        <td>
                          <div className="admin-product-cell">
                            <div className="admin-thumb">
                              <Thumb p={p} />
                            </div>
                            <div>
                              <strong>{p.name}</strong>
                              <small>{p.subtitle}</small>
                            </div>
                          </div>
                        </td>
                        <td>
                          {p.category}
                          <small>{p.subcategory}</small>
                        </td>
                        <td>{money(p.price)}</td>
                        <td>
                          <span className={p.stock < 5 ? 'admin-stock-low' : ''}>
                            {p.stock} units
                          </span>
                        </td>
                        <td>
                          <span className={`admin-pill ${p.active ? 'published' : 'draft'}`}>
                            {p.active ? 'Published' : 'Draft'}
                          </span>
                        </td>
                        <td>
                          <div className="admin-row-actions">
                            <button
                              onClick={() => {
                                setError('');
                                setProduct({
                                  ...p,
                                  badge: p.badge || '',
                                  imageUrl: p.imageUrl || '',
                                });
                              }}
                            >
                              Edit
                            </button>
                            {p.active && (
                              <button
                                aria-label={`Archive ${p.name}`}
                                onClick={() =>
                                  setConfirm({
                                    title: 'Archive this product?',
                                    body: `${p.name} will be hidden from the storefront. Its order history stays intact. You can publish it again later.`,
                                    action: async () => {
                                      await api('/api/admin/products/' + p.id, {
                                        method: 'DELETE',
                                      });
                                      await refresh();
                                      setSuccess('Product archived.');
                                    },
                                  })
                                }
                              >
                                <Trash2 size={15} />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {!shown.length && (
                <div className="admin-empty">
                  <Box size={30} />
                  <h2>No products found.</h2>
                  <p>Try another search, or add your first essential.</p>
                </div>
              )}
            </section>
          )}
          {view === 'categories' && (
            <div className="admin-category-grid">
              {categories.map((c) => (
                <section className="admin-panel admin-category" key={c.name}>
                  <div className="admin-category-icon">
                    <FolderTree size={22} />
                  </div>
                  <h2>{c.name}</h2>
                  <p>
                    {products.filter((p) => p.category === c.name).length} products ·{' '}
                    {c.subcategories.length} subcategories
                  </p>
                  <div className="admin-category-tags">
                    {c.subcategories.map((s) => (
                      <span key={s}>{s}</span>
                    ))}
                  </div>
                  <div className="admin-category-bottom">
                    <button
                      onClick={() => {
                        setError('');
                        setCategoryOriginal(c.name);
                        setCategory({ ...c, subcategories: [...c.subcategories] });
                      }}
                    >
                      Edit category <ArrowUpRight size={14} />
                    </button>
                    <button
                      aria-label={`Delete category ${c.name}`}
                      onClick={() =>
                        setConfirm({
                          title: 'Delete this category?',
                          body: 'Only unused categories can be removed. Move any products, including drafts, to another category first.',
                          action: async () => {
                            await api('/api/admin/categories/' + encodeURIComponent(c.name), {
                              method: 'DELETE',
                            });
                            await refresh();
                            setSuccess('Category removed.');
                          },
                        })
                      }
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </section>
              ))}
              {!categories.length && (
                <div className="admin-empty">
                  <FolderTree size={30} />
                  <h2>Your categories start here.</h2>
                  <p>Add a category before creating products.</p>
                </div>
              )}
            </div>
          )}
          {view === 'orders' && (
            <section className="admin-panel">
              <div className="admin-table-toolbar">
                <span>
                  Customer orders <small>· Payments mocked</small>
                </span>
                <div className="admin-search">
                  <Search size={16} />
                  <input
                    aria-label="Search orders on this page"
                    placeholder="Search this page…"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                  />
                </div>
              </div>
              <OrderTable orders={shownOrders} open={openOrder} />
              <div className="admin-pagination">
                <button
                  disabled={orderPage === 0 || loading}
                  onClick={() => setOrderPage((p) => p - 1)}
                >
                  <ChevronLeft size={16} />
                  Previous
                </button>
                <span>Page {orderPage + 1}</span>
                <button
                  disabled={orders.length < 50 || loading}
                  onClick={() => setOrderPage((p) => p + 1)}
                >
                  Next
                  <ChevronRight size={16} />
                </button>
              </div>
            </section>
          )}
          <div className="admin-footnote">
            <ShieldCheck size={14} /> {brand.name} admin · Connected to the same catalogue and
            orders as your storefront
          </div>
        </main>
      </div>
      {product && (
        <div className="admin-overlay">
          <section
            className="admin-modal product-editor"
            role="dialog"
            aria-modal="true"
            aria-label={product.id ? 'Edit product' : 'Add product'}
          >
            <div className="admin-modal-heading">
              <div>
                <span className="eyebrow">THE COLLECTION EDIT</span>
                <h2>{product.id ? 'A little product refresh.' : 'Something new to love.'}</h2>
              </div>
              <button
                disabled={busy || uploading || !!imageFile}
                aria-label="Close product editor"
                onClick={() => setProduct(null)}
              >
                <X />
              </button>
            </div>
            {error && (
              <div className="admin-alert error" role="alert">
                {error}
              </div>
            )}
            <form onSubmit={saveProduct}>
              <div className="admin-product-form">
                <div>
                  <div className="admin-upload-preview">
                    <Thumb p={product} />
                  </div>
                  <label className="admin-upload-button">
                    <ImagePlus size={17} />
                    {uploading ? 'Uploading…' : 'Upload product image'}
                    <input
                      type="file"
                      accept="image/jpeg,image/png"
                      disabled={uploading || busy}
                      onChange={(e) => {
                        chooseImage(e.target.files?.[0]);
                        e.target.value = '';
                      }}
                    />
                  </label>
                  <small className="admin-help">
                    JPEG or PNG · Up to 5 MB. Crop and preview before uploading. Size adjusts
                    automatically.
                  </small>
                  {product.imageUrl && (
                    <button
                      type="button"
                      className="text-link"
                      disabled={busy || uploading || !!imageFile}
                      onClick={resizeExisting}
                    >
                      Crop / resize current image
                    </button>
                  )}
                  {product.imageUrl && (
                    <button
                      type="button"
                      className="text-link"
                      onClick={() => setProduct({ ...product, imageUrl: '' })}
                    >
                      Use illustration instead
                    </button>
                  )}
                  <label>
                    Illustration style
                    <select
                      value={product.kind}
                      onChange={(e) => setProduct({ ...product, kind: e.target.value })}
                    >
                      {['wand', 'oil', 'pebble', 'bundle', 'candle'].map((k) => (
                        <option key={k}>{k}</option>
                      ))}
                    </select>
                  </label>
                  <label>
                    Illustration colour
                    <input
                      type="color"
                      value={product.color}
                      onChange={(e) => setProduct({ ...product, color: e.target.value })}
                    />
                  </label>
                </div>
                <div>
                  <label>
                    Product name
                    <input
                      required
                      maxLength={120}
                      value={product.name}
                      onChange={(e) => setProduct({ ...product, name: e.target.value })}
                    />
                  </label>
                  <label>
                    Short description
                    <input
                      required
                      maxLength={250}
                      value={product.subtitle}
                      onChange={(e) => setProduct({ ...product, subtitle: e.target.value })}
                    />
                  </label>
                  <div className="admin-form-row">
                    <label>
                      Category
                      <select
                        required
                        value={product.category}
                        onChange={(e) =>
                          setProduct({
                            ...product,
                            category: e.target.value,
                            subcategory:
                              categories.find((c) => c.name === e.target.value)?.subcategories[0] ||
                              '',
                          })
                        }
                      >
                        <option value="">Choose category</option>
                        {categories.map((c) => (
                          <option key={c.name}>{c.name}</option>
                        ))}
                      </select>
                    </label>
                    <label>
                      Subcategory
                      <select
                        required
                        value={product.subcategory}
                        onChange={(e) => setProduct({ ...product, subcategory: e.target.value })}
                      >
                        <option value="">Choose subcategory</option>
                        {categories
                          .find((c) => c.name === product.category)
                          ?.subcategories.map((s) => (
                            <option key={s}>{s}</option>
                          ))}
                      </select>
                    </label>
                  </div>
                  <div className="admin-form-row">
                    <label>
                      Price (INR)
                      <input
                        required
                        type="number"
                        min="0.01"
                        max="999999999"
                        step="0.01"
                        value={product.price}
                        onChange={(e) => setProduct({ ...product, price: Number(e.target.value) })}
                      />
                    </label>
                    <label>
                      Compare-at price (INR)
                      <input
                        required
                        type="number"
                        min={product.price}
                        max="999999999"
                        step="0.01"
                        value={product.original}
                        onChange={(e) =>
                          setProduct({ ...product, original: Number(e.target.value) })
                        }
                      />
                    </label>
                  </div>
                  <label>
                    Full description
                    <textarea
                      required
                      maxLength={10000}
                      rows={4}
                      value={product.description}
                      onChange={(e) => setProduct({ ...product, description: e.target.value })}
                    />
                  </label>
                  <div className="admin-form-row">
                    <label>
                      Stock available
                      <input
                        required
                        type="number"
                        min="0"
                        max="1000000"
                        value={product.stock}
                        onChange={(e) => setProduct({ ...product, stock: Number(e.target.value) })}
                      />
                    </label>
                    <label>
                      Display order
                      <input
                        required
                        type="number"
                        min="0"
                        max="100000"
                        value={product.displayOrder}
                        onChange={(e) =>
                          setProduct({ ...product, displayOrder: Number(e.target.value) })
                        }
                      />
                    </label>
                  </div>
                  <label>
                    Badge (optional)
                    <input
                      maxLength={80}
                      placeholder="e.g. NEW ARRIVAL"
                      value={product.badge || ''}
                      onChange={(e) => setProduct({ ...product, badge: e.target.value })}
                    />
                  </label>
                  <label className="admin-checkbox">
                    <input
                      type="checkbox"
                      checked={product.active}
                      onChange={(e) => setProduct({ ...product, active: e.target.checked })}
                    />
                    <span>
                      Publish in customer storefront
                      <small>Uncheck to keep this product as a draft.</small>
                    </span>
                  </label>
                </div>
              </div>
              <div className="admin-modal-footer">
                <button
                  type="button"
                  disabled={busy || uploading || !!imageFile}
                  className="admin-secondary"
                  onClick={() => setProduct(null)}
                >
                  Cancel
                </button>
                <button className="primary" disabled={busy || uploading || !!imageFile}>
                  {busy ? 'Saving…' : 'Save product'}
                  <Check size={17} />
                </button>
              </div>
            </form>
          </section>
        </div>
      )}
      {category && (
        <div className="admin-overlay">
          <section
            className="admin-modal category-editor"
            role="dialog"
            aria-modal="true"
            aria-label="Category editor"
          >
            <div className="admin-modal-heading">
              <div>
                <span className="eyebrow">A THOUGHTFUL STRUCTURE</span>
                <h2>{categoryOriginal ? 'Edit category' : 'New category'}</h2>
              </div>
              <button
                disabled={busy}
                aria-label="Close category editor"
                onClick={() => setCategory(null)}
              >
                <X />
              </button>
            </div>
            {error && (
              <div className="admin-alert error" role="alert">
                {error}
              </div>
            )}
            <form onSubmit={saveCategory}>
              <div className="admin-form-body">
                <label>
                  Category name
                  <input
                    required
                    maxLength={120}
                    value={category.name}
                    onChange={(e) => setCategory({ ...category, name: e.target.value })}
                  />
                </label>
                <label>Subcategories</label>
                {category.subcategories.map((s, i) => (
                  <div className="admin-subcategory-input" key={i}>
                    <input
                      required
                      maxLength={120}
                      aria-label={`Subcategory ${i + 1}`}
                      value={s}
                      onChange={(e) =>
                        setCategory({
                          ...category,
                          subcategories: category.subcategories.map((v, j) =>
                            i === j ? e.target.value : v,
                          ),
                        })
                      }
                    />
                    <button
                      type="button"
                      aria-label={`Remove subcategory ${i + 1}`}
                      disabled={category.subcategories.length <= 1}
                      onClick={() =>
                        setCategory({
                          ...category,
                          subcategories: category.subcategories.filter((_, j) => i !== j),
                        })
                      }
                    >
                      <X size={16} />
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  className="text-link"
                  onClick={() =>
                    setCategory({ ...category, subcategories: [...category.subcategories, ''] })
                  }
                >
                  <Plus size={15} />
                  Add subcategory
                </button>
                <p className="admin-help">
                  Renaming a category updates its products automatically. A subcategory in use
                  cannot be removed; move its products first.
                </p>
              </div>
              <div className="admin-modal-footer">
                <button
                  type="button"
                  className="admin-secondary"
                  disabled={busy}
                  onClick={() => setCategory(null)}
                >
                  Cancel
                </button>
                <button className="primary" disabled={busy}>
                  {busy ? 'Saving…' : 'Save category'}
                  <Check size={16} />
                </button>
              </div>
            </form>
          </section>
        </div>
      )}
      {order && (
        <div className="admin-overlay">
          <section
            className="admin-modal order-editor"
            role="dialog"
            aria-modal="true"
            aria-label="Order details"
          >
            <div className="admin-modal-heading">
              <div>
                <span className="eyebrow">EVERY ORDER MATTERS</span>
                <h2>Order details</h2>
              </div>
              <button
                aria-label="Close order details"
                disabled={busy}
                onClick={() => setOrder(null)}
              >
                <X />
              </button>
            </div>
            <div className="admin-form-body">
              {error && (
                <div className="admin-alert error" role="alert">
                  {error}
                </div>
              )}
              <p className="admin-order-id">{order.id}</p>
              <div className="admin-order-meta">
                <span>{date(order.createdAt)}</span>
                <span className={'admin-pill ' + order.fulfillment.toLowerCase()}>
                  {order.fulfillment}
                </span>
              </div>
              <div className="admin-order-address">
                <h3>Deliver to</h3>
                <strong>{order.customerName}</strong>
                <p>
                  {order.email}
                  <br />
                  {order.street}
                  <br />
                  {order.city}, {order.postal}
                  <br />
                  {order.country}
                </p>
              </div>
              {order.items.map((item, i) => (
                <div className="admin-order-line" key={i}>
                  <span>
                    {item.name}
                    <small>
                      Qty {item.quantity} × {money(item.unitPrice)}
                    </small>
                  </span>
                  <strong>{money(item.quantity * item.unitPrice)}</strong>
                </div>
              ))}
              <div className="admin-order-totals">
                <p>
                  <span>Subtotal</span>
                  <span>{money(order.subtotal)}</span>
                </p>
                <p>
                  <span>Shipping</span>
                  <span>{money(order.shipping)}</span>
                </p>
                <p>
                  <strong>Total</strong>
                  <strong>{money(order.total)}</strong>
                </p>
              </div>
              <div className="admin-demo-note">
                {order.paymentMethod === 'paypal' ? 'PayPal' : 'Card'} · Mock payment. No money was
                collected.
              </div>
              {!!statuses[order.fulfillment]?.length && (
                <div className="admin-status-form">
                  <label>
                    Update fulfillment
                    <select value={nextStatus} onChange={(e) => setNextStatus(e.target.value)}>
                      <option value="">Choose next status</option>
                      {statuses[order.fulfillment].map((s) => (
                        <option key={s}>{s}</option>
                      ))}
                    </select>
                  </label>
                  <button
                    className="primary"
                    disabled={!nextStatus || busy}
                    onClick={() =>
                      nextStatus === 'CANCELLED'
                        ? setConfirm({
                            title: 'Cancel this demo order?',
                            body: 'Its stock will be returned to the catalogue once. This order will remain in your history.',
                            action: changeStatus,
                          })
                        : void changeStatus()
                    }
                  >
                    {busy ? 'Updating…' : 'Update status'}
                  </button>
                </div>
              )}
            </div>
          </section>
        </div>
      )}
      {imageFile && product && (
        <ImageUploadEditor
          file={imageFile}
          busy={uploading}
          onClose={() => setImageFile(null)}
          onApply={upload}
        />
      )}
      {confirm && (
        <div className="admin-overlay confirmation">
          <section
            className="admin-modal confirm-modal"
            role="alertdialog"
            aria-modal="true"
            aria-label={confirm.title}
          >
            <h2>{confirm.title}</h2>
            <p>{confirm.body}</p>
            <div className="admin-modal-footer">
              <button className="admin-secondary" disabled={busy} onClick={() => setConfirm(null)}>
                Keep as is
              </button>
              <button
                className="primary"
                disabled={busy}
                onClick={async () => {
                  setBusy(true);
                  setError('');
                  try {
                    await confirm.action();
                    setConfirm(null);
                  } catch (e) {
                    fail(e);
                    setConfirm(null);
                  } finally {
                    setBusy(false);
                  }
                }}
              >
                {busy ? 'Working…' : 'Confirm'}
              </button>
            </div>
          </section>
        </div>
      )}
    </div>
  );
}
const ShoppingIcon = Package;
function OrderTable({ orders, open }: { orders: Order[]; open: (id: string) => void }) {
  return orders.length ? (
    <div className="admin-table-scroll">
      <table>
        <thead>
          <tr>
            <th>Order</th>
            <th>Customer</th>
            <th>Total</th>
            <th>Status</th>
            <th />
          </tr>
        </thead>
        <tbody>
          {orders.map((o) => (
            <tr key={o.id}>
              <td>
                <strong className="admin-order-short">{o.id.slice(0, 11).toUpperCase()}</strong>
                <small>{date(o.createdAt)}</small>
              </td>
              <td>{o.customerName}</td>
              <td>{money(o.total)}</td>
              <td>
                <span className={'admin-pill ' + o.fulfillment.toLowerCase()}>{o.fulfillment}</span>
              </td>
              <td>
                <button
                  className="admin-view-order"
                  onClick={() => open(o.id)}
                  aria-label={`View order ${o.id}`}
                >
                  <ArrowUpRight size={17} />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  ) : (
    <div className="admin-empty">
      <ClipboardList size={30} />
      <h2>A little quiet here.</h2>
      <p>Orders placed in the customer storefront will appear here.</p>
    </div>
  );
}
