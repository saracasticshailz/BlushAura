import { createApi, type BaseQueryFn } from '@reduxjs/toolkit/query/react';
import type { AdminProduct, Order, OrderDetail, Stats } from '../types/admin';
import type { Product } from '../types/product';
import { api, ApiError, jsonRequest, type Category } from './http';
type Request = { url: string; method?: string; body?: unknown };
export type ServiceError = { status: number; data: { detail: string } };
const baseQuery: BaseQueryFn<Request, unknown, ServiceError> = async (
  { url, method, body },
  { signal },
) => {
  try {
    return { data: await api(url, { ...(method ? jsonRequest(method, body) : {}), signal }) };
  } catch (error) {
    return {
      error: {
        status: error instanceof ApiError ? error.status : 0,
        data: {
          detail: error instanceof Error ? error.message : 'The request could not be completed.',
        },
      },
    };
  }
};
export const storeApi = createApi({
  reducerPath: 'storeApi',
  baseQuery,
  tagTypes: ['Products', 'Categories', 'Orders', 'Dashboard'],
  refetchOnFocus: true,
  refetchOnReconnect: true,
  endpoints: (build) => ({
    getProducts: build.query<Product[], void>({
      query: () => ({ url: '/api/products' }),
      providesTags: ['Products'],
    }),
    getCategories: build.query<Category[], void>({
      query: () => ({ url: '/api/categories' }),
      providesTags: ['Categories'],
    }),
    getAdminProducts: build.query<AdminProduct[], void>({
      query: () => ({ url: '/api/admin/products' }),
      providesTags: ['Products'],
    }),
    getAdminCategories: build.query<Category[], void>({
      query: () => ({ url: '/api/admin/categories' }),
      providesTags: ['Categories'],
    }),
    getDashboard: build.query<Stats, void>({
      query: () => ({ url: '/api/admin/dashboard' }),
      providesTags: ['Dashboard'],
    }),
    getAdminOrders: build.query<Order[], number>({
      query: (page) => ({ url: `/api/admin/orders?page=${page}` }),
      providesTags: ['Orders'],
    }),
    getAdminOrder: build.query<OrderDetail, string>({
      query: (id) => ({ url: '/api/admin/orders/' + encodeURIComponent(id) }),
      providesTags: ['Orders'],
    }),
    saveProduct: build.mutation<AdminProduct, { id?: string; data: Omit<AdminProduct, 'id'> }>({
      query: ({ id, data }) => ({
        url: '/api/admin/products' + (id ? '/' + encodeURIComponent(id) : ''),
        method: id ? 'PUT' : 'POST',
        body: data,
      }),
      invalidatesTags: (result, error) => (error ? [] : ['Products', 'Dashboard']),
    }),
    archiveProduct: build.mutation<void, string>({
      query: (id) => ({ url: '/api/admin/products/' + encodeURIComponent(id), method: 'DELETE' }),
      invalidatesTags: (result, error) => (error ? [] : ['Products', 'Dashboard']),
    }),
    saveCategory: build.mutation<void, { original?: string; data: Category }>({
      query: ({ original, data }) => ({
        url: '/api/admin/categories' + (original ? '/' + encodeURIComponent(original) : ''),
        method: original ? 'PUT' : 'POST',
        body: data,
      }),
      invalidatesTags: (result, error) => (error ? [] : ['Categories', 'Products', 'Dashboard']),
    }),
    deleteCategory: build.mutation<void, string>({
      query: (name) => ({
        url: '/api/admin/categories/' + encodeURIComponent(name),
        method: 'DELETE',
      }),
      invalidatesTags: (result, error) => (error ? [] : ['Categories', 'Dashboard']),
    }),
    updateOrder: build.mutation<void, { id: string; fulfillment: string }>({
      query: ({ id, fulfillment }) => ({
        url: '/api/admin/orders/' + encodeURIComponent(id),
        method: 'PATCH',
        body: { fulfillment },
      }),
      invalidatesTags: (result, error) => (error ? [] : ['Orders', 'Products', 'Dashboard']),
    }),
    placeOrder: build.mutation<
      { id: string },
      {
        address: {
          name: string;
          email: string;
          street: string;
          city: string;
          postal: string;
          country: string;
        };
        paymentMethod: string;
        items: { productId: string; quantity: number }[];
      }
    >({
      query: (body) => ({ url: '/api/orders', method: 'POST', body }),
      invalidatesTags: (result, error) => (error ? [] : ['Orders', 'Products', 'Dashboard']),
    }),
  }),
});
export const {
  useGetProductsQuery,
  useGetCategoriesQuery,
  useGetAdminProductsQuery,
  useGetAdminCategoriesQuery,
  useGetDashboardQuery,
  useGetAdminOrdersQuery,
  useLazyGetAdminOrderQuery,
  useSaveProductMutation,
  useArchiveProductMutation,
  useSaveCategoryMutation,
  useDeleteCategoryMutation,
  useUpdateOrderMutation,
  usePlaceOrderMutation,
} = storeApi;
export function serviceErrorMessage(error: unknown) {
  if (error && typeof error === 'object' && 'data' in error) {
    const data = error.data as { detail?: string };
    if (data?.detail) return data.detail;
  }
  return error instanceof Error ? error.message : 'The request could not be completed.';
}
