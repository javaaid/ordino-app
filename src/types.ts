export interface Product {
  id: string;
  name: string;
  price: number;
  category: string;
  image: string;
  stock: number;
  unit: 'pcs' | 'kg' | 'box';
  barcode: string;
  vatRate: number; // e.g., 0.15 for 15%
}

export interface CartItem extends Product {
  quantity: number;
  cartItemId: string;
}

export interface Discount {
  type: 'percentage' | 'fixed';
  value: number;
}

export interface Customer {
  id: string;
  name: string;
  phone: string;
  vatNumber?: string;
  email?: string;
}

export interface Order {
  id: string;
  items: CartItem[];
  subtotal: number;
  vatTotal: number;
  discountTotal: number;
  total: number;
  timestamp: string;
  paymentMethod: 'Cash' | 'Mada' | 'Credit Card' | 'Split';
  status: 'Completed' | 'Refunded' | 'On Hold';
  invoiceType: 'Simplified' | 'Tax';
  customer?: Customer;
}

export interface HoldOrder {
  id: string;
  items: CartItem[];
  timestamp: string;
  note: string;
  customer?: Customer;
}

export interface User {
  id: string;
  name: string;
  role: 'Admin' | 'Manager' | 'Cashier';
}

export interface StoreSettings {
  storeName: string;
  vatNumber: string;
  address: string;
  phone: string;
  vatRate: number;
}

