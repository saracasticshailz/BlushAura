import { useEffect, useState, type FormEvent } from 'react';
import type { ImageSize } from '../components/organisms/media/ImageUploadEditor';
import { api, ApiError, type Category } from '../services/http';
import {
  serviceErrorMessage,
  storeApi,
  useArchiveProductMutation,
  useDeleteCategoryMutation,
  useGetAdminCategoriesQuery,
  useGetAdminOrdersQuery,
  useGetAdminProductsQuery,
  useGetDashboardQuery,
  useLazyGetAdminOrderQuery,
  useSaveCategoryMutation,
  useSaveProductMutation,
  useUpdateOrderMutation,
} from '../services/storeApi';
import { adminActions } from '../store/adminSlice';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import type { AdminProduct, OrderDetail } from '../types/admin';
export function useAdmin() {
  const dispatch = useAppDispatch();
  const [imageTarget, setImageTarget] = useState<'cover' | 'gallery'>('cover');
  const { view, query, orderPage } = useAppSelector((state) => state.admin);
  const [imageFile, setImageFile] = useState<File | null>(null),
    [user, setUser] = useState<string | null>(null),
    [checking, setChecking] = useState(true),
    [product, setProduct] = useState<AdminProduct | null>(null),
    [category, setCategory] = useState<Category | null>(null),
    [categoryOriginal, setCategoryOriginal] = useState(''),
    [order, setOrder] = useState<OrderDetail | null>(null),
    [nextStatus, setNextStatus] = useState(''),
    [error, setError] = useState(''),
    [success, setSuccess] = useState(''),
    [busy, setBusy] = useState(false),
    [detailLoading, setDetailLoading] = useState(false),
    [uploading, setUploading] = useState(false),
    [confirm, setConfirm] = useState<{
      title: string;
      body: string;
      action: () => Promise<void>;
    } | null>(null);
  const options = { skip: !user };
  const productsQuery = useGetAdminProductsQuery(undefined, options),
    categoriesQuery = useGetAdminCategoriesQuery(undefined, options),
    dashboardQuery = useGetDashboardQuery(undefined, options),
    ordersQuery = useGetAdminOrdersQuery(orderPage, options);
  const products = productsQuery.data ?? [],
    categories = categoriesQuery.data ?? [],
    stats = dashboardQuery.data ?? null,
    orders = ordersQuery.data ?? [];
  const loading =
    detailLoading ||
    productsQuery.isFetching ||
    categoriesQuery.isFetching ||
    dashboardQuery.isFetching ||
    ordersQuery.isFetching;
  const [saveProductRequest] = useSaveProductMutation(),
    [archiveProductRequest] = useArchiveProductMutation(),
    [saveCategoryRequest] = useSaveCategoryMutation(),
    [deleteCategoryRequest] = useDeleteCategoryMutation(),
    [updateOrderRequest] = useUpdateOrderMutation();
  const [fetchOrder] = useLazyGetAdminOrderQuery();
  const setQuery = (value: string) => dispatch(adminActions.queryChanged(value));
  const setOrderPage = (value: number | ((previous: number) => number)) =>
    dispatch(adminActions.orderPageChanged(typeof value === 'function' ? value(orderPage) : value));
  function fail(e: unknown) {
    setError(
      e instanceof TypeError
        ? 'Cannot reach the local backend. Start the API and try again.'
        : serviceErrorMessage(e),
    );
    if (
      (e instanceof ApiError && e.status === 401) ||
      (typeof e === 'object' && e !== null && 'status' in e && e.status === 401)
    ) {
      setUser(null);
      dispatch(storeApi.util.resetApiState());
    }
  }
  async function refresh() {
    if (!user) return;
    try {
      await Promise.all([
        productsQuery.refetch().unwrap(),
        categoriesQuery.refetch().unwrap(),
        dashboardQuery.refetch().unwrap(),
        ordersQuery.refetch().unwrap(),
      ]);
    } catch (e) {
      fail(e);
    }
  }
  useEffect(() => {
    let mounted = true;
    api<{ email: string }>('/api/admin/session')
      .then((s) => {
        if (mounted) setUser(s.email);
      })
      .catch((e) => {
        if (mounted && !(e instanceof ApiError && e.status === 401)) fail(e);
      })
      .finally(() => {
        if (mounted) setChecking(false);
      });
    return () => {
      mounted = false;
    };
  }, []);
  useEffect(() => {
    const queryError =
      productsQuery.error || categoriesQuery.error || dashboardQuery.error || ordersQuery.error;
    if (queryError) {
      setError(serviceErrorMessage(queryError));
      if ('status' in queryError && queryError.status === 401) {
        setUser(null);
        dispatch(storeApi.util.resetApiState());
      }
    }
  }, [
    productsQuery.error,
    categoriesQuery.error,
    dashboardQuery.error,
    ordersQuery.error,
    dispatch,
  ]);
  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => setSuccess(''), 4000);
      return () => clearTimeout(timer);
    }
  }, [success]);
  useEffect(() => {
    if (!product && !category && !order && !confirm) return;
    const old = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = old;
    };
  }, [product, category, order, confirm]);
  function navigate(tab: string) {
    dispatch(adminActions.viewChanged(tab));
    setError('');
  }
  // Credentials and image files never enter Redux actions or query arguments.
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
      setOrder(null);
      setProduct(null);
      setCategory(null);
      setImageFile(null);
      dispatch(storeApi.util.resetApiState());
      dispatch(adminActions.resetAdminView());
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
      const { id, ...data } = product;
      await saveProductRequest({ id, data }).unwrap();
      setProduct(null);
      setSuccess(id ? 'Product updated. Changes are live in the storefront.' : 'Product created.');
    } catch (e) {
      fail(e);
    } finally {
      setBusy(false);
    }
  }
  async function upload(file: File, size: ImageSize) {
    if (!product) return;
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
      setProduct((p) =>
        p
          ? imageTarget === 'gallery'
            ? {
                ...p,
                imageUrl: p.imageUrl || result.url,
                media: [...(p.media ?? []), { url: result.url, type: 'image', caption: p.name }],
              }
            : { ...p, imageUrl: result.url }
          : p,
      );
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
    setImageTarget('cover');
    setImageFile(file);
  }
  async function chooseGalleryMedia(file?: File) {
    if (!file || !product || uploading) return;
    if ((product.media?.length ?? 0) >= 8) {
      setError('You can add up to 8 gallery items.');
      return;
    }
    if (['image/jpeg', 'image/png'].includes(file.type)) {
      if (file.size > 5 * 1024 * 1024) {
        setError('Choose an image up to 5 MB.');
        return;
      }
      setError('');
      setImageTarget('gallery');
      setImageFile(file);
      return;
    }
    if (!['video/mp4', 'video/webm'].includes(file.type) || file.size > 20 * 1024 * 1024) {
      setError('Choose JPEG/PNG up to 5 MB or MP4/WebM up to 20 MB.');
      return;
    }
    setError('');
    setUploading(true);
    try {
      const form = new FormData();
      form.set('file', file);
      const result = await api<{ url: string }>('/api/admin/media', { method: 'POST', body: form });
      setProduct((p) =>
        p
          ? {
              ...p,
              media: [...(p.media ?? []), { url: result.url, type: 'video', caption: p.name }],
            }
          : p,
      );
      setSuccess('Video uploaded. Save the product to publish it.');
    } catch (e) {
      fail(e);
    } finally {
      setUploading(false);
    }
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
      await saveCategoryRequest({
        original: categoryOriginal,
        data: {
          name: category.name.trim(),
          subcategories: category.subcategories.map((s) => s.trim()).filter(Boolean),
        },
      }).unwrap();
      setCategory(null);
      setSuccess('Category saved.');
    } catch (e) {
      fail(e);
    } finally {
      setBusy(false);
    }
  }
  async function openOrder(id: string) {
    setDetailLoading(true);
    try {
      const value = await fetchOrder(id).unwrap();
      setOrder(value);
      setNextStatus('');
    } catch (e) {
      fail(e);
    } finally {
      setDetailLoading(false);
    }
  }
  async function changeStatus() {
    if (!order || !nextStatus) return;
    setBusy(true);
    try {
      await updateOrderRequest({ id: order.id, fulfillment: nextStatus }).unwrap();
      setOrder({ ...order, fulfillment: nextStatus });
      setNextStatus('');
      setSuccess('Order status updated.');
    } catch (e) {
      fail(e);
    } finally {
      setBusy(false);
    }
  }
  function confirmArchive(p: AdminProduct) {
    setConfirm({
      title: 'Archive this product?',
      body: `${p.name} will be hidden from the storefront. Its order history stays intact. You can publish it again later.`,
      action: async () => {
        await archiveProductRequest(p.id).unwrap();
        setSuccess('Product archived.');
      },
    });
  }
  function confirmDeleteCategory(name: string) {
    setConfirm({
      title: 'Delete this category?',
      body: 'Only unused categories can be removed. Move any products, including drafts, to another category first.',
      action: async () => {
        await deleteCategoryRequest(name).unwrap();
        setSuccess('Category removed.');
      },
    });
  }
  const shown = products.filter((p) =>
    `${p.name} ${p.category} ${p.subcategory}`.toLowerCase().includes(query.toLowerCase()),
  );
  const shownOrders = orders.filter((o) =>
    `${o.id} ${o.customerName} ${o.fulfillment}`.toLowerCase().includes(query.toLowerCase()),
  );
  return {
    imageFile,
    setImageFile,
    user,
    checking,
    view,
    products,
    categories,
    stats,
    orders,
    orderPage,
    setOrderPage,
    query,
    setQuery,
    product,
    setProduct,
    category,
    setCategory,
    categoryOriginal,
    setCategoryOriginal,
    order,
    setOrder,
    nextStatus,
    setNextStatus,
    error,
    setError,
    success,
    setSuccess,
    busy,
    setBusy,
    loading,
    uploading,
    confirm,
    setConfirm,
    fail,
    refresh,
    navigate,
    login,
    logout,
    saveProduct,
    upload,
    chooseImage,
    chooseGalleryMedia,
    resizeExisting,
    saveCategory,
    openOrder,
    changeStatus,
    shown,
    shownOrders,
    confirmArchive,
    confirmDeleteCategory,
  };
}
export type AdminModel = ReturnType<typeof useAdmin>;
