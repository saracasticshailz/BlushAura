import { configureStore } from '@reduxjs/toolkit';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { products } from '../src/data/catalog';
import { storeApi } from '../src/services/storeApi';
import { adminActions, adminSlice } from '../src/store/adminSlice';
import { storefrontActions, storefrontSlice } from '../src/store/storefrontSlice';

const makeStore = () =>
  configureStore({
    reducer: {
      [storeApi.reducerPath]: storeApi.reducer,
      storefront: storefrontSlice.reducer,
      admin: adminSlice.reducer,
    },
    middleware: (defaults) => defaults().concat(storeApi.middleware),
  });
const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } });
let stores: ReturnType<typeof makeStore>[] = [];
let record = { ...products[0], stock: 25, active: true, displayOrder: 0 };
let orderCount = 0;
let rejectEdit = false;
let mutationHeaders: Headers | undefined;
beforeEach(() => {
  record = { ...products[0], stock: 25, active: true, displayOrder: 0 };
  orderCount = 0;
  rejectEdit = false;
  mutationHeaders = undefined;
  vi.stubGlobal(
    'fetch',
    vi.fn(async (url: string, options: RequestInit = {}) => {
      if (url === '/api/csrf')
        return json({ headerName: 'X-CSRF-TOKEN', token: 'test-session-token' });
      if (url === '/api/products' || url === '/api/admin/products') return json([record]);
      if (url === '/api/admin/dashboard')
        return json({
          orders: orderCount,
          products: 1,
          activeProducts: 1,
          newOrders: orderCount,
          lowStock: 0,
          categories: 1,
          demoRevenue: orderCount * record.price,
        });
      if (url.startsWith('/api/admin/orders?'))
        return json(
          orderCount
            ? [
                {
                  id: 'BA-TEST',
                  customerName: 'Demo Customer',
                  total: record.price,
                  currency: 'INR',
                  fulfillment: 'NEW',
                  createdAt: '2026-10-30T00:00:00Z',
                  paymentMethod: 'card',
                },
              ]
            : [],
        );
      mutationHeaders = new Headers(options.headers);
      if (url === '/api/admin/products/aura' && options.method === 'PUT') {
        if (rejectEdit) return json({ detail: 'This update is not allowed' }, 403);
        record = { ...record, ...JSON.parse(String(options.body)) };
        return json(record);
      }
      if (url === '/api/orders' && options.method === 'POST') {
        record = { ...record, stock: record.stock - 1 };
        orderCount++;
        return json({ id: 'BA-TEST' }, 201);
      }
      throw new Error(`Unexpected request: ${options.method || 'GET'} ${url}`);
    }),
  );
});
afterEach(() => {
  for (const store of stores) store.dispatch(storeApi.util.resetApiState());
  stores = [];
  vi.unstubAllGlobals();
});
function createStore() {
  const store = makeStore();
  stores.push(store);
  return store;
}

describe('one customer/admin workflow', () => {
  it('refreshes the customer catalogue and admin catalogue after an admin product edit', async () => {
    const store = createStore();
    await Promise.all([
      store.dispatch(storeApi.endpoints.getProducts.initiate()).unwrap(),
      store.dispatch(storeApi.endpoints.getAdminProducts.initiate()).unwrap(),
    ]);
    const { id, ...data } = record;
    await store
      .dispatch(
        storeApi.endpoints.saveProduct.initiate({ id, data: { ...data, name: 'Fresh ritual' } }),
      )
      .unwrap();
    await vi.waitFor(() => {
      expect(storeApi.endpoints.getProducts.select()(store.getState()).data?.[0].name).toBe(
        'Fresh ritual',
      );
      expect(storeApi.endpoints.getAdminProducts.select()(store.getState()).data?.[0].name).toBe(
        'Fresh ritual',
      );
    });
    expect(mutationHeaders?.get('X-CSRF-TOKEN')).toBe('test-session-token');
  });
  it('refreshes inventory and the admin order list after customer checkout', async () => {
    const store = createStore();
    await Promise.all([
      store.dispatch(storeApi.endpoints.getProducts.initiate()).unwrap(),
      store.dispatch(storeApi.endpoints.getAdminOrders.initiate(0)).unwrap(),
      store.dispatch(storeApi.endpoints.getDashboard.initiate()).unwrap(),
    ]);
    await store
      .dispatch(
        storeApi.endpoints.placeOrder.initiate({
          address: {
            name: 'Demo Customer',
            email: 'demo@example.com',
            street: 'Example Street',
            city: 'Demo City',
            postal: '100001',
            country: 'India',
          },
          paymentMethod: 'card',
          items: [{ productId: 'aura', quantity: 1 }],
        }),
      )
      .unwrap();
    await vi.waitFor(() => {
      expect(storeApi.endpoints.getProducts.select()(store.getState()).data?.[0].stock).toBe(24);
      expect(storeApi.endpoints.getAdminOrders.select(0)(store.getState()).data).toHaveLength(1);
      expect(storeApi.endpoints.getDashboard.select()(store.getState()).data?.orders).toBe(1);
    });
  });
  it('retains the previous catalogue when an admin mutation fails', async () => {
    const store = createStore();
    await store.dispatch(storeApi.endpoints.getProducts.initiate()).unwrap();
    rejectEdit = true;
    const { id, ...data } = record;
    await expect(
      store
        .dispatch(
          storeApi.endpoints.saveProduct.initiate({ id, data: { ...data, name: 'Rejected edit' } }),
        )
        .unwrap(),
    ).rejects.toMatchObject({ status: 403 });
    expect(storeApi.endpoints.getProducts.select()(store.getState()).data?.[0].name).toBe('Aura');
  });
  it('keeps customer cart and wishlist while admin navigation changes', () => {
    const store = createStore();
    store.dispatch(storefrontActions.cartCleared());
    store.dispatch(storefrontActions.itemAdded('aura'));
    store.dispatch(storefrontActions.wishlistToggled('glow'));
    store.dispatch(adminActions.viewChanged('orders'));
    store.dispatch(adminActions.resetAdminView());
    expect(store.getState().storefront.cart).toEqual({ aura: 1 });
    expect(store.getState().storefront.wishlist).toContain('glow');
    store.dispatch(storefrontActions.quantityChanged({ id: 'aura', delta: -1 }));
    expect(store.getState().storefront.cart).toEqual({});
  });
});
