import type { Product } from './product';
export type AdminProduct = Product & { stock: number; active: boolean; displayOrder: number };
export type Stats = {
  products: number;
  activeProducts: number;
  lowStock: number;
  categories: number;
  orders: number;
  newOrders: number;
  demoRevenue: number;
};
export type Order = {
  id: string;
  customerName: string;
  total: number;
  currency: string;
  fulfillment: string;
  createdAt: string;
  paymentMethod: string;
};
export type OrderDetail = Order & {
  email: string;
  street: string;
  city: string;
  postal: string;
  country: string;
  subtotal: number;
  shipping: number;
  items: { name: string; quantity: number; unitPrice: number }[];
};
