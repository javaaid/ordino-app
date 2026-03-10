import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Product, CartItem, Order, User, StoreSettings, Discount, Customer, HoldOrder } from '../types';

interface POSContextType {
  cart: CartItem[];
  addToCart: (product: Product, quantity?: number) => void;
  removeFromCart: (cartItemId: string) => void;
  updateQuantity: (cartItemId: string, quantity: number) => void;
  clearCart: () => void;
  subtotal: number;
  vatTotal: number;
  discountTotal: number;
  total: number;
  user: User | null;
  login: (pin: string) => boolean;
  logout: () => void;
  orders: Order[];
  addOrder: (order: Order) => void;
  products: Product[];
  setProducts: (products: Product[]) => void;
  settings: StoreSettings;
  setSettings: (settings: StoreSettings) => void;
  discount: Discount | null;
  setDiscount: (discount: Discount | null) => void;
  customers: Customer[];
  selectedCustomer: Customer | null;
  setSelectedCustomer: (customer: Customer | null) => void;
  holdOrders: HoldOrder[];
  holdCurrentOrder: (note: string) => void;
  resumeOrder: (holdOrderId: string) => void;
  removeHoldOrder: (holdOrderId: string) => void;
}

const POSContext = createContext<POSContextType | undefined>(undefined);

export const POSProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [discount, setDiscount] = useState<Discount | null>(null);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [holdOrders, setHoldOrders] = useState<HoldOrder[]>([]);
  
  const [customers] = useState<Customer[]>([
    { id: '1', name: 'Walk-in Customer', phone: '-' },
    { id: '2', name: 'Tech Corp LLC', phone: '0501234567', vatNumber: '310000000000003' },
    { id: '3', name: 'Ahmed Ali', phone: '0559876543' },
  ]);

  const [settings, setSettings] = useState<StoreSettings>({
    storeName: 'Ordino Superstore',
    vatNumber: '300000000000003',
    address: 'Riyadh, Saudi Arabia',
    phone: '+966 50 000 0000',
    vatRate: 0.15,
  });
  
  // Mock products
  const [products, setProducts] = useState<Product[]>([
    { id: '1', name: 'Apple Gala', price: 6.5, category: 'Fresh Produce', image: 'https://picsum.photos/seed/apple/200/200', stock: 100, unit: 'kg', barcode: '10001', vatRate: 0.15 },
    { id: '2', name: 'Banana Cavendish', price: 4.0, category: 'Fresh Produce', image: 'https://picsum.photos/seed/banana/200/200', stock: 150, unit: 'kg', barcode: '10002', vatRate: 0.15 },
    { id: '3', name: 'Almarai Milk Full Fat 2L', price: 11.0, category: 'Dairy', image: 'https://picsum.photos/seed/milk/200/200', stock: 50, unit: 'pcs', barcode: '20001', vatRate: 0.15 },
    { id: '4', name: 'Lays Classic 170g', price: 7.5, category: 'Snacks', image: 'https://picsum.photos/seed/lays/200/200', stock: 200, unit: 'pcs', barcode: '30001', vatRate: 0.15 },
    { id: '5', name: 'Coca Cola 330ml', price: 3.0, category: 'Beverages', image: 'https://picsum.photos/seed/coke/200/200', stock: 300, unit: 'pcs', barcode: '40001', vatRate: 0.15 },
    { id: '6', name: 'Chicken Breast 500g', price: 18.5, category: 'Meat', image: 'https://picsum.photos/seed/chicken/200/200', stock: 30, unit: 'pcs', barcode: '50001', vatRate: 0.15 },
  ]);

  const login = (pin: string) => {
    if (pin === '1234') {
      setUser({ id: '1', name: 'Ahmed', role: 'Admin' });
      return true;
    } else if (pin === '0000') {
      setUser({ id: '2', name: 'Sara', role: 'Cashier' });
      return true;
    }
    return false;
  };

  const logout = () => {
    setUser(null);
    setCart([]);
    setDiscount(null);
    setSelectedCustomer(null);
  };

  const addToCart = (product: Product, quantity: number = 1) => {
    setCart((prev) => {
      const existingItem = prev.find((item) => item.id === product.id);
      if (existingItem) {
        return prev.map((item) =>
          item.id === product.id ? { ...item, quantity: item.quantity + quantity } : item
        );
      }
      return [...prev, { ...product, quantity, cartItemId: Math.random().toString(36).substr(2, 9) }];
    });
  };

  const removeFromCart = (cartItemId: string) => {
    setCart((prev) => prev.filter((item) => item.cartItemId !== cartItemId));
  };

  const updateQuantity = (cartItemId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(cartItemId);
      return;
    }
    setCart((prev) =>
      prev.map((item) => (item.cartItemId === cartItemId ? { ...item, quantity } : item))
    );
  };

  const clearCart = () => {
    setCart([]);
    setDiscount(null);
    setSelectedCustomer(null);
  };

  const addOrder = (order: Order) => {
    setOrders((prev) => [order, ...prev]);
  };

  const holdCurrentOrder = (note: string) => {
    if (cart.length === 0) return;
    const holdOrder: HoldOrder = {
      id: `HLD-${Date.now()}`,
      items: [...cart],
      timestamp: new Date().toISOString(),
      note,
      customer: selectedCustomer || undefined,
    };
    setHoldOrders((prev) => [holdOrder, ...prev]);
    clearCart();
  };

  const resumeOrder = (holdOrderId: string) => {
    const orderToResume = holdOrders.find((o) => o.id === holdOrderId);
    if (orderToResume) {
      setCart(orderToResume.items);
      setSelectedCustomer(orderToResume.customer || null);
      setHoldOrders((prev) => prev.filter((o) => o.id !== holdOrderId));
    }
  };

  const removeHoldOrder = (holdOrderId: string) => {
    setHoldOrders((prev) => prev.filter((o) => o.id !== holdOrderId));
  };

  const subtotal = cart.reduce((sum, item) => sum + (item.price / (1 + item.vatRate)) * item.quantity, 0);
  
  let discountTotal = 0;
  if (discount) {
    if (discount.type === 'percentage') {
      discountTotal = subtotal * (discount.value / 100);
    } else {
      discountTotal = discount.value;
    }
  }
  
  const subtotalAfterDiscount = Math.max(0, subtotal - discountTotal);
  const vatTotal = subtotalAfterDiscount * settings.vatRate;
  const total = subtotalAfterDiscount + vatTotal;

  return (
    <POSContext.Provider
      value={{
        cart,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        subtotal,
        vatTotal,
        discountTotal,
        total,
        user,
        login,
        logout,
        orders,
        addOrder,
        products,
        setProducts,
        settings,
        setSettings,
        discount,
        setDiscount,
        customers,
        selectedCustomer,
        setSelectedCustomer,
        holdOrders,
        holdCurrentOrder,
        resumeOrder,
        removeHoldOrder,
      }}
    >
      {children}
    </POSContext.Provider>
  );
};

export const usePOS = () => {
  const context = useContext(POSContext);
  if (context === undefined) {
    throw new Error('usePOS must be used within a POSProvider');
  }
  return context;
};
