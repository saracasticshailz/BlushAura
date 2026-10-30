export type Product = {
  id: string;
  name: string;
  subtitle: string;
  category: string;
  subcategory: string;
  price: number;
  original: number;
  color: string;
  kind: string;
  badge?: string | null;
  imageUrl?: string | null;
  stock?: number;
  description: string;
};
