export interface Product {
  id: string;
  title: string;
  slug: string;
  description: string;
  image: string;
  brand: string;
  brandId?: string | null;
  brandSlug?: string;
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

export interface Brand {
  id: string;
  name: string;
  slug: string;
  isActive: boolean;
  createdAt?: string;
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

export interface WishlistItem {
  product: Product;
  addedAt: string;
}

export interface Wishlist {
  items: WishlistItem[];
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

export type OrderStatus = 'Pending' | 'Done' | 'Cancelled';

export interface OrderItem {
  productId: string;
  title: string;
  quantity: number;
  price: number;
  salePrice?: number;
  lineTotal: number;
}

export interface Order {
  id: string;
  _id?: string;
  orderNumber: string;
  status: OrderStatus;
  paymentMethod: string;
  user?: Partial<User>;
  items: OrderItem[];
  address: Partial<Address>;
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
