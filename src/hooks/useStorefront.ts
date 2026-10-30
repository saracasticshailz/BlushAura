import { useEffect, useState } from 'react';
import { products as demoProducts } from '../data/catalog';
import {
  serviceErrorMessage,
  useGetCategoriesQuery,
  useGetProductsQuery,
  usePlaceOrderMutation,
} from '../services/storeApi';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { storefrontActions as actions } from '../store/storefrontSlice';
import type { Product } from '../types/product';
export function useStorefront() {
  const dispatch = useAppDispatch();
  const {
    cart,
    wishlist,
    page,
    category,
    sub,
    search,
    searchOpen,
    sort,
    selectedId,
    cartOpen,
    mobile,
    toast,
    step,
    payment,
  } = useAppSelector((state) => state.storefront);
  const productsQuery = useGetProductsQuery();
  const categoriesQuery = useGetCategoriesQuery();
  const products = productsQuery.data ?? demoProducts;
  const categories = categoriesQuery.data ?? [];
  const apiState =
    productsQuery.isError || categoriesQuery.isError
      ? 'offline'
      : productsQuery.isLoading || categoriesQuery.isLoading
        ? 'loading'
        : 'connected';
  const selected = products.find((p) => p.id === selectedId) ?? null;
  const [submitOrder, { isLoading: placingOrder }] = usePlaceOrderMutation();
  const [order, setOrder] = useState('');
  const [address, setAddress] = useState({
    name: '',
    email: '',
    street: '',
    city: '',
    postal: '',
    country: 'India',
  });
  const setCategory = (value: string) => dispatch(actions.categoryChanged(value));
  const setSub = (value: string) => dispatch(actions.subcategoryChanged(value));
  const setSearch = (value: string) => dispatch(actions.searchChanged(value));
  const setSearchOpen = (value: boolean) => dispatch(actions.searchToggled(value));
  const setSort = (value: string) => dispatch(actions.sortChanged(value));
  const setSelected = (value: Product | null) =>
    dispatch(actions.productSelected(value?.id ?? null));
  const setCartOpen = (value: boolean) => dispatch(actions.cartToggled(value));
  const setMobile = (value: boolean) => dispatch(actions.mobileToggled(value));
  const setStep = (value: number) => dispatch(actions.checkoutStepChanged(value));
  const setPayment = (value: string) => dispatch(actions.paymentChanged(value));
  const notify = (value: string) => dispatch(actions.toastChanged(value));
  const removeFromCart = (id: string) => dispatch(actions.itemRemoved(id));
  const categoryNames = categories.length
    ? categories.map((c) => c.name)
    : [...new Set(products.map((p) => p.category))];
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => dispatch(actions.toastChanged('')), 2800);
      return () => clearTimeout(timer);
    }
  }, [toast, dispatch]);
  useEffect(() => {
    if (!selected && !cartOpen && !searchOpen) return;
    const old = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const close = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        dispatch(actions.productSelected(null));
        dispatch(actions.cartToggled(false));
        dispatch(actions.searchToggled(false));
      }
    };
    window.addEventListener('keydown', close);
    return () => {
      document.body.style.overflow = old;
      window.removeEventListener('keydown', close);
    };
  }, [selected, cartOpen, searchOpen, dispatch]);
  useEffect(() => {
    if (apiState === 'connected')
      dispatch(actions.unavailableItemsRemoved(products.map((p) => p.id)));
  }, [products, apiState, dispatch]);
  const count = Object.values(cart).reduce((sum, n) => sum + n, 0),
    total = products.reduce((sum, p) => sum + p.price * (cart[p.id] || 0), 0),
    shipping = total >= 1999 || total === 0 ? 0 : 99;
  function go(nextPage: string, nextCategory = 'All essentials') {
    dispatch(actions.navigate({ page: nextPage, category: nextCategory }));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
  function add(product: Product) {
    if ((cart[product.id] || 0) >= Math.min(product.stock ?? 99, 99)) {
      notify('No more stock is available for this item.');
      return;
    }
    dispatch(actions.itemAdded(product.id));
    notify(`${product.name} added to your bag`);
  }
  function change(id: string, delta: number) {
    if (
      delta > 0 &&
      (cart[id] || 0) >= Math.min(products.find((p) => p.id === id)?.stock ?? 99, 99)
    ) {
      notify('No more stock is available for this item.');
      return;
    }
    dispatch(actions.quantityChanged({ id, delta }));
  }
  const wish = (id: string) => dispatch(actions.wishlistToggled(id));
  function checkout() {
    setCartOpen(false);
    setStep(1);
    go('checkout');
  }
  async function placeOrder() {
    if (placingOrder) return;
    try {
      const result = await submitOrder({
        address,
        paymentMethod: payment,
        items: Object.entries(cart).map(([productId, quantity]) => ({ productId, quantity })),
      }).unwrap();
      setOrder(result.id);
      dispatch(actions.cartCleared());
      setAddress({ name: '', email: '', street: '', city: '', postal: '', country: 'India' });
      go('success');
    } catch (error) {
      notify(serviceErrorMessage(error));
    }
  }
  const visible = products
    .filter(
      (p) =>
        (page !== 'wishlist' || wishlist.includes(p.id)) &&
        (category === 'All essentials' || p.category === category) &&
        (sub === 'All' || p.subcategory === sub) &&
        `${p.name} ${p.subtitle} ${p.category}`.toLowerCase().includes(search.toLowerCase()),
    )
    .sort((a, b) => (sort === 'low' ? a.price - b.price : sort === 'high' ? b.price - a.price : 0));
  return {
    products,
    categories,
    apiState,
    categoryNames,
    placingOrder,
    placeOrder,
    page,
    category,
    setCategory,
    sub,
    setSub,
    search,
    setSearch,
    searchOpen,
    setSearchOpen,
    sort,
    setSort,
    selected,
    setSelected,
    cart,
    wishlist,
    removeFromCart,
    cartOpen,
    setCartOpen,
    mobile,
    setMobile,
    toast,
    step,
    setStep,
    order,
    payment,
    setPayment,
    address,
    setAddress,
    count,
    total,
    shipping,
    notify,
    go,
    add,
    change,
    wish,
    checkout,
    visible,
  };
}
export type StorefrontModel = ReturnType<typeof useStorefront>;
