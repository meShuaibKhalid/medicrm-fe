export interface Product {
  id: string;
  title: string;
  slug: string;
  description: string;
  image: string;
  brand: string;
  price: number;
  salePrice?: number;
  salePercent?: number;
  stock: number;
  maxOrder: number;
  prescriptionRequired: boolean;
  usedFor: string;
  categoryIds: string[];
  primaryCategoryId: string;
  isActive: boolean;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  parentId: string | null;
  children?: Category[];
  level: number;
  order?: number;
  isActive: boolean;
  createdAt?: string
}

export interface CartItem {
  product: Product;
  quantity: number;
  price: number;
  salePrice?: number;
  discountAmount: number;
  lineTotal: number;
}

export interface Cart {
  items: CartItem[];
  subtotal: number;
  discountTotal: number;
  deliveryFee: number;
  grandTotal: number;
}

export interface Address {
  id: string;
  fullName: string;
  phone: string;
  city: string;
  area: string;
  addressLine: string;
  nearestLandmark: string;
  latitude?: number | null;
  longitude?: number | null;
  isDefault: boolean;
}

export type OrderStatus = 'pending' | 'confirmed' | 'dispatched' | 'completed' | 'cancelled';

export interface Order {
  id: string;
  orderNumber: string;
  status: OrderStatus;
  paymentMethod: string;
  user?: User;
  items: CartItem[];
  address: Address;
  subtotal: number;
  discountTotal: number;
  deliveryFee: number;
  grandTotal: number;
  createdAt: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: 'user' | 'admin';
  isActive: boolean;
}
