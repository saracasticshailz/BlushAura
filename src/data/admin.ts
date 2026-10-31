import type { AdminProduct } from '../types/admin';
export const blank: AdminProduct = {
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
  media: [],
  stock: 25,
  active: false,
  displayOrder: 0,
};
export const statuses: Record<string, string[]> = {
  NEW: ['PROCESSING', 'CANCELLED'],
  PROCESSING: ['SHIPPED', 'CANCELLED'],
  SHIPPED: ['COMPLETED'],
  COMPLETED: [],
  CANCELLED: [],
};
