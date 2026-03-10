import React, { useState } from 'react';
import { usePOS } from '../context/POSContext';
import { Product, Customer } from '../types';
import { Search, Plus, Minus, Trash2, CreditCard, Banknote, ReceiptText, ShoppingCart, PauseCircle, PlayCircle, Tag, User as UserIcon } from 'lucide-react';
import { format } from 'date-fns';
import { QRCodeSVG } from 'qrcode.react';
import { generateZatcaQr } from '../utils/zatca';

export const POS: React.FC = () => {
  const { 
    products, cart, addToCart, removeFromCart, updateQuantity, clearCart, 
    subtotal, vatTotal, discountTotal, total, addOrder, settings,
    customers, selectedCustomer, setSelectedCustomer,
    discount, setDiscount, holdOrders, holdCurrentOrder, resumeOrder, removeHoldOrder
  } = usePOS();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [isCheckoutModalOpen, setIsCheckoutModalOpen] = useState(false);
  const [isReceiptModalOpen, setIsReceiptModalOpen] = useState(false);
  const [isHoldModalOpen, setIsHoldModalOpen] = useState(false);
  const [isDiscountModalOpen, setIsDiscountModalOpen] = useState(false);
  const [discountInput, setDiscountInput] = useState('');
  const [discountType, setDiscountType] = useState<'percentage' | 'fixed'>('percentage');
  const [holdNote, setHoldNote] = useState('');
  const [currentOrder, setCurrentOrder] = useState<any>(null);

  const categories = Array.from(new Set(products.map((p) => p.category)));

  const filteredProducts = products.filter((p) => {
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) || p.barcode.includes(searchTerm);
    const matchesCategory = selectedCategory ? p.category === selectedCategory : true;
    return matchesSearch && matchesCategory;
  });

  const handleCheckout = (paymentMethod: 'Cash' | 'Mada' | 'Credit Card' | 'Split') => {
    const order = {
      id: `ORD-${Date.now()}`,
      items: [...cart],
      subtotal,
      vatTotal,
      discountTotal,
      total,
      timestamp: new Date().toISOString(),
      paymentMethod,
      status: 'Completed' as const,
      invoiceType: selectedCustomer?.vatNumber ? 'Tax' as const : 'Simplified' as const,
      customer: selectedCustomer || undefined,
    };
    addOrder(order);
    setCurrentOrder(order);
    clearCart();
    setIsCheckoutModalOpen(false);
    setIsReceiptModalOpen(true);
  };

  const applyDiscount = () => {
    const val = parseFloat(discountInput);
    if (!isNaN(val) && val > 0) {
      setDiscount({ type: discountType, value: val });
    } else {
      setDiscount(null);
    }
    setIsDiscountModalOpen(false);
  };

  const handleHoldOrder = () => {
    if (cart.length === 0) return;
    holdCurrentOrder(holdNote || `Order ${format(new Date(), 'HH:mm')}`);
    setHoldNote('');
  };

  return (
    <div className="flex flex-col lg:flex-row h-full">
      {/* Main POS Area */}
      <div className="flex-1 flex flex-col h-[60vh] lg:h-full bg-slate-50">
        {/* Header */}
        <div className="h-auto lg:h-20 bg-white border-b border-slate-200 flex flex-col lg:flex-row items-center px-4 lg:px-6 py-4 lg:py-0 justify-between shrink-0 shadow-sm gap-4 lg:gap-0">
          <div className="relative w-full lg:w-96 pl-10 lg:pl-0">
            <Search className="absolute left-12 lg:left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search products..."
              className="w-full pl-10 pr-4 py-2.5 bg-slate-100 border-transparent rounded-xl focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all outline-none text-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex gap-2 overflow-x-auto w-full lg:w-auto pb-2 custom-scrollbar">
            <button
              onClick={() => setSelectedCategory(null)}
              className={`px-4 py-2 rounded-xl whitespace-nowrap text-sm font-medium transition-colors ${
                selectedCategory === null ? 'bg-indigo-600 text-white shadow-md' : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              All Items
            </button>
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 rounded-xl whitespace-nowrap text-sm font-medium transition-colors ${
                  selectedCategory === cat ? 'bg-indigo-600 text-white shadow-md' : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Product Grid */}
        <div className="flex-1 overflow-y-auto p-4">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-8 gap-3">
            {filteredProducts.map((product) => (
              <div
                key={product.id}
                onClick={() => addToCart(product)}
                className="bg-white rounded-xl p-2 cursor-pointer hover:shadow-lg transition-all border border-slate-100 group flex flex-col"
              >
                <div className="aspect-square rounded-lg overflow-hidden bg-slate-100 mb-2 relative">
                  <img src={product.image} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                  <div className="absolute top-1 right-1 bg-white/90 backdrop-blur-sm px-1.5 py-0.5 rounded text-[10px] font-bold text-slate-800 shadow-sm">
                    {product.stock} {product.unit}
                  </div>
                </div>
                <div className="flex-1 flex flex-col">
                  <h3 className="font-semibold text-slate-800 line-clamp-2 text-xs mb-0.5 leading-tight">{product.name}</h3>
                  <p className="text-[10px] text-slate-500 mb-1 truncate">{product.category}</p>
                  <div className="mt-auto flex items-center justify-between">
                    <span className="font-bold text-indigo-600 text-sm">SAR {product.price.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Cart Sidebar */}
      <div className="w-full lg:w-96 h-[40vh] lg:h-full bg-white border-t lg:border-t-0 lg:border-l border-slate-200 flex flex-col shrink-0 shadow-[0_-4px_24px_-12px_rgba(0,0,0,0.1)] lg:shadow-[-4px_0_24px_-12px_rgba(0,0,0,0.1)] z-10">
        <div className="p-3 lg:p-4 border-b border-slate-100 bg-slate-50/50 flex flex-col gap-2 lg:gap-3 shrink-0">
          <div className="flex items-center justify-between">
            <h2 className="text-base lg:text-lg font-bold text-slate-800 flex items-center gap-2">
              <ShoppingCart className="w-4 h-4 lg:w-5 lg:h-5 text-indigo-600" />
              Current Order
            </h2>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setIsHoldModalOpen(true)}
                className="text-xs text-slate-600 hover:text-indigo-600 font-medium flex items-center gap-1 px-2 py-1.5 rounded-lg hover:bg-slate-100 transition-colors relative"
              >
                <PlayCircle className="w-3.5 h-3.5 lg:w-4 lg:h-4" /> <span className="hidden sm:inline">Resume</span>
                {holdOrders.length > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-indigo-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                    {holdOrders.length}
                  </span>
                )}
              </button>
              <button
                onClick={handleHoldOrder}
                disabled={cart.length === 0}
                className="text-xs text-orange-500 hover:text-orange-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium flex items-center gap-1 px-2 py-1.5 rounded-lg hover:bg-orange-50 transition-colors"
              >
                <PauseCircle className="w-3.5 h-3.5 lg:w-4 lg:h-4" /> <span className="hidden sm:inline">Hold</span>
              </button>
              <button
                onClick={clearCart}
                disabled={cart.length === 0}
                className="text-xs text-red-500 hover:text-red-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium flex items-center gap-1 px-2 py-1.5 rounded-lg hover:bg-red-50 transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5 lg:w-4 lg:h-4" /> <span className="hidden sm:inline">Clear</span>
              </button>
            </div>
          </div>
          
          <div className="flex items-center gap-2 bg-white p-1.5 lg:p-2 rounded-xl border border-slate-200 shadow-sm">
            <UserIcon className="w-3.5 h-3.5 lg:w-4 lg:h-4 text-slate-400 ml-1" />
            <select
              className="flex-1 bg-transparent text-xs lg:text-sm font-medium text-slate-700 outline-none cursor-pointer"
              value={selectedCustomer?.id || ''}
              onChange={(e) => {
                const cust = customers.find(c => c.id === e.target.value);
                setSelectedCustomer(cust || null);
              }}
            >
              <option value="">Walk-in Customer</option>
              {customers.filter(c => c.id !== '1').map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-3 lg:p-4 space-y-2 lg:space-y-3">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-slate-400 space-y-3 lg:space-y-4">
              <div className="w-16 h-16 lg:w-24 lg:h-24 bg-slate-50 rounded-full flex items-center justify-center">
                <ShoppingCart className="w-8 h-8 lg:w-10 lg:h-10 text-slate-300" />
              </div>
              <p className="font-medium text-sm lg:text-base">Cart is empty</p>
            </div>
          ) : (
            cart.map((item) => (
              <div key={item.cartItemId} className="flex items-center gap-2 lg:gap-3 p-2 lg:p-3 bg-white border border-slate-100 rounded-xl shadow-sm">
                <img src={item.image} alt={item.name} className="w-10 h-10 lg:w-12 lg:h-12 rounded-lg object-cover bg-slate-100 shrink-0" />
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium text-slate-800 text-xs lg:text-sm truncate">{item.name}</h4>
                  <div className="text-[10px] lg:text-xs text-slate-500 mt-0.5">SAR {item.price.toFixed(2)}</div>
                </div>
                <div className="flex items-center gap-1 lg:gap-2 bg-slate-50 rounded-lg p-1 border border-slate-200 shrink-0">
                  <button
                    onClick={() => updateQuantity(item.cartItemId, item.quantity - 1)}
                    className="w-6 h-6 lg:w-7 lg:h-7 flex items-center justify-center bg-white rounded shadow-sm text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
                  >
                    <Minus className="w-3 h-3" />
                  </button>
                  <span className="w-5 lg:w-6 text-center text-xs lg:text-sm font-semibold">{item.quantity}</span>
                  <button
                    onClick={() => updateQuantity(item.cartItemId, item.quantity + 1)}
                    className="w-6 h-6 lg:w-7 lg:h-7 flex items-center justify-center bg-white rounded shadow-sm text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
                  >
                    <Plus className="w-3 h-3" />
                  </button>
                </div>
                <div className="font-bold text-slate-800 text-xs lg:text-sm w-14 lg:w-16 text-right shrink-0">
                  SAR {(item.price * item.quantity).toFixed(2)}
                </div>
              </div>
            ))
          )}
        </div>

        <div className="p-3 lg:p-5 bg-slate-50 border-t border-slate-200 shrink-0">
          <div className="space-y-1.5 lg:space-y-2 mb-3 lg:mb-4">
            <div className="flex justify-between text-slate-500 text-xs lg:text-sm">
              <span>Subtotal</span>
              <span>SAR {subtotal.toFixed(2)}</span>
            </div>
            
            <div className="flex justify-between items-center text-slate-500 text-xs lg:text-sm">
              <button 
                onClick={() => setIsDiscountModalOpen(true)}
                className="flex items-center gap-1 text-indigo-600 hover:text-indigo-800 font-medium"
              >
                <Tag className="w-3 h-3" />
                {discount ? `Discount (${discount.type === 'percentage' ? discount.value + '%' : 'SAR ' + discount.value})` : 'Add Discount'}
              </button>
              {discountTotal > 0 && <span className="text-red-500">- SAR {discountTotal.toFixed(2)}</span>}
            </div>

            <div className="flex justify-between text-slate-500 text-xs lg:text-sm">
              <span>VAT ({(settings.vatRate * 100).toFixed(0)}%)</span>
              <span>SAR {vatTotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-slate-800 font-bold text-lg lg:text-xl pt-1.5 lg:pt-2 border-t border-slate-200 mt-1.5 lg:mt-2">
              <span>Total</span>
              <span className="text-indigo-600">SAR {total.toFixed(2)}</span>
            </div>
          </div>
          <button
            disabled={cart.length === 0}
            onClick={() => setIsCheckoutModalOpen(true)}
            className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white font-bold py-3 lg:py-4 rounded-xl shadow-lg shadow-indigo-200 transition-all flex items-center justify-center gap-2 text-base lg:text-lg"
          >
            <CreditCard className="w-4 h-4 lg:w-5 lg:h-5" />
            Charge SAR {total.toFixed(2)}
          </button>
        </div>
      </div>

      {/* Discount Modal */}
      {isDiscountModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden">
            <div className="p-4 md:p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h3 className="text-lg md:text-xl font-bold text-slate-800">Apply Discount</h3>
              <button onClick={() => setIsDiscountModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <Minus className="w-5 h-5 md:w-6 md:h-6 rotate-45" />
              </button>
            </div>
            <div className="p-4 md:p-6 space-y-4">
              <div className="flex bg-slate-100 p-1 rounded-xl">
                <button
                  className={`flex-1 py-2 text-xs md:text-sm font-medium rounded-lg transition-colors ${discountType === 'percentage' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                  onClick={() => setDiscountType('percentage')}
                >
                  Percentage (%)
                </button>
                <button
                  className={`flex-1 py-2 text-xs md:text-sm font-medium rounded-lg transition-colors ${discountType === 'fixed' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                  onClick={() => setDiscountType('fixed')}
                >
                  Fixed Amount (SAR)
                </button>
              </div>
              <div>
                <input
                  type="number"
                  value={discountInput}
                  onChange={(e) => setDiscountInput(e.target.value)}
                  placeholder={discountType === 'percentage' ? 'e.g. 10' : 'e.g. 50'}
                  className="w-full px-4 py-2.5 md:py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all outline-none text-sm md:text-base"
                />
              </div>
              <div className="flex gap-2 md:gap-3 pt-2">
                <button
                  onClick={() => { setDiscount(null); setIsDiscountModalOpen(false); }}
                  className="flex-1 py-2.5 md:py-3 px-4 rounded-xl border border-slate-200 text-slate-600 font-medium hover:bg-slate-50 transition-colors text-sm md:text-base"
                >
                  Remove
                </button>
                <button
                  onClick={applyDiscount}
                  className="flex-1 py-2.5 md:py-3 px-4 rounded-xl bg-indigo-600 text-white font-medium hover:bg-indigo-700 transition-colors shadow-md shadow-indigo-200 text-sm md:text-base"
                >
                  Apply
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Hold Orders Modal */}
      {isHoldModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col max-h-[80vh]">
            <div className="p-4 md:p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50 shrink-0">
              <h3 className="text-lg md:text-xl font-bold text-slate-800">Held Orders</h3>
              <button onClick={() => setIsHoldModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <Minus className="w-5 h-5 md:w-6 md:h-6 rotate-45" />
              </button>
            </div>
            <div className="p-4 md:p-6 overflow-y-auto space-y-3">
              {holdOrders.length === 0 ? (
                <div className="text-center text-slate-500 py-8 text-sm md:text-base">No held orders found.</div>
              ) : (
                holdOrders.map((order) => (
                  <div key={order.id} className="border border-slate-200 rounded-xl p-3 md:p-4 flex flex-col gap-3 hover:border-indigo-300 transition-colors">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-bold text-slate-800 text-sm md:text-base">{order.note || order.id}</h4>
                        <p className="text-[10px] md:text-xs text-slate-500">{format(new Date(order.timestamp), 'dd MMM yyyy, HH:mm')}</p>
                        {order.customer && <p className="text-[10px] md:text-xs text-indigo-600 mt-1">Customer: {order.customer.name}</p>}
                      </div>
                      <div className="text-right">
                        <span className="font-bold text-slate-800 text-sm md:text-base">
                          SAR {order.items.reduce((sum, item) => sum + item.price * item.quantity, 0).toFixed(2)}
                        </span>
                        <p className="text-[10px] md:text-xs text-slate-500">{order.items.length} items</p>
                      </div>
                    </div>
                    <div className="flex gap-2 mt-2">
                      <button
                        onClick={() => removeHoldOrder(order.id)}
                        className="flex-1 py-2 px-3 rounded-lg border border-red-200 text-red-600 font-medium hover:bg-red-50 transition-colors text-xs md:text-sm"
                      >
                        Discard
                      </button>
                      <button
                        onClick={() => {
                          resumeOrder(order.id);
                          setIsHoldModalOpen(false);
                        }}
                        className="flex-1 py-2 px-3 rounded-lg bg-indigo-600 text-white font-medium hover:bg-indigo-700 transition-colors text-xs md:text-sm shadow-sm"
                      >
                        Resume Order
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* Checkout Modal */}
      {isCheckoutModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden">
            <div className="p-4 md:p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h3 className="text-lg md:text-xl font-bold text-slate-800">Select Payment Method</h3>
              <button onClick={() => setIsCheckoutModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <Minus className="w-5 h-5 md:w-6 md:h-6 rotate-45" />
              </button>
            </div>
            <div className="p-4 md:p-6 space-y-4">
              <div className="text-center mb-6 md:mb-8">
                <p className="text-slate-500 text-xs md:text-sm mb-1">Total Amount Due</p>
                <p className="text-3xl md:text-4xl font-black text-indigo-600">SAR {total.toFixed(2)}</p>
              </div>
              <div className="grid grid-cols-2 gap-3 md:gap-4">
                <button
                  onClick={() => handleCheckout('Cash')}
                  className="flex flex-col items-center justify-center gap-2 md:gap-3 p-4 md:p-6 rounded-2xl border-2 border-slate-100 hover:border-emerald-500 hover:bg-emerald-50 transition-all group"
                >
                  <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-emerald-100 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Banknote className="w-5 h-5 md:w-6 md:h-6 text-emerald-600" />
                  </div>
                  <span className="font-bold text-slate-700 text-sm md:text-base">Cash</span>
                </button>
                <button
                  onClick={() => handleCheckout('Mada')}
                  className="flex flex-col items-center justify-center gap-2 md:gap-3 p-4 md:p-6 rounded-2xl border-2 border-slate-100 hover:border-blue-500 hover:bg-blue-50 transition-all group"
                >
                  <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-blue-100 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <CreditCard className="w-5 h-5 md:w-6 md:h-6 text-blue-600" />
                  </div>
                  <span className="font-bold text-slate-700 text-sm md:text-base">Mada / Card</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Receipt Modal (ZATCA Compliant) */}
      {isReceiptModalOpen && currentOrder && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-3 md:p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50 shrink-0">
              <h3 className="text-base md:text-lg font-bold text-slate-800 flex items-center gap-2">
                <ReceiptText className="w-4 h-4 md:w-5 md:h-5 text-indigo-600" />
                Receipt
              </h3>
              <button onClick={() => setIsReceiptModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <Minus className="w-5 h-5 md:w-6 md:h-6 rotate-45" />
              </button>
            </div>
            
            <div className="p-4 md:p-6 overflow-y-auto font-mono text-xs md:text-sm text-slate-800 bg-white">
              <div className="text-center mb-4 md:mb-6">
                <h2 className="text-lg md:text-xl font-bold mb-1">{settings.storeName}</h2>
                <p className="text-[10px] md:text-xs text-slate-500">{settings.address}</p>
                <p className="text-[10px] md:text-xs text-slate-500">VAT No: {settings.vatNumber}</p>
                <div className="mt-3 md:mt-4 border-t border-b border-dashed border-slate-300 py-2">
                  <p className="font-bold">{currentOrder.invoiceType} Tax Invoice</p>
                  <p className="text-[10px] md:text-xs mt-1">Invoice No: {currentOrder.id}</p>
                  <p className="text-[10px] md:text-xs">Date: {format(new Date(currentOrder.timestamp), 'dd/MM/yyyy HH:mm:ss')}</p>
                  {currentOrder.customer && (
                    <div className="mt-2 text-left border border-slate-200 p-2 rounded bg-slate-50">
                      <p className="font-semibold text-[8px] md:text-[10px] text-slate-500 uppercase">Billed To:</p>
                      <p className="font-bold text-xs md:text-sm">{currentOrder.customer.name}</p>
                      {currentOrder.customer.vatNumber && <p className="text-[10px] md:text-xs">VAT: {currentOrder.customer.vatNumber}</p>}
                    </div>
                  )}
                </div>
              </div>

              <div className="mb-4">
                <div className="flex justify-between font-bold border-b border-slate-800 pb-1 mb-2 text-[10px] md:text-xs">
                  <span className="w-1/2">Item</span>
                  <span className="w-1/6 text-center">Qty</span>
                  <span className="w-1/3 text-right">Total</span>
                </div>
                {currentOrder.items.map((item: any) => (
                  <div key={item.cartItemId} className="flex justify-between mb-1 text-[10px] md:text-xs">
                    <span className="w-1/2 truncate pr-2">{item.name}</span>
                    <span className="w-1/6 text-center">{item.quantity}</span>
                    <span className="w-1/3 text-right">{(item.price * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
              </div>

              <div className="border-t border-dashed border-slate-300 pt-2 mb-4 md:mb-6 space-y-1">
                <div className="flex justify-between text-[10px] md:text-xs">
                  <span>Subtotal (Excl. VAT)</span>
                  <span>SAR {currentOrder.subtotal.toFixed(2)}</span>
                </div>
                {currentOrder.discountTotal > 0 && (
                  <div className="flex justify-between text-[10px] md:text-xs text-red-600">
                    <span>Discount</span>
                    <span>- SAR {currentOrder.discountTotal.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between text-[10px] md:text-xs">
                  <span>Total VAT ({(settings.vatRate * 100).toFixed(0)}%)</span>
                  <span>SAR {currentOrder.vatTotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between font-bold text-sm md:text-base mt-2 pt-2 border-t border-slate-800">
                  <span>Total (Incl. VAT)</span>
                  <span>SAR {currentOrder.total.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-[10px] md:text-xs mt-2 text-slate-500">
                  <span>Payment Method</span>
                  <span>{currentOrder.paymentMethod}</span>
                </div>
              </div>

              <div className="flex flex-col items-center justify-center mt-4 md:mt-6">
                <QRCodeSVG
                  value={generateZatcaQr(
                    settings.storeName,
                    settings.vatNumber,
                    currentOrder.timestamp,
                    currentOrder.total.toFixed(2),
                    currentOrder.vatTotal.toFixed(2)
                  )}
                  size={100}
                  className="md:w-[128px] md:h-[128px]"
                  level="M"
                  includeMargin={false}
                />
                <p className="text-[8px] md:text-[10px] text-slate-400 mt-2 text-center">Scan with ZATCA App</p>
              </div>
            </div>

            <div className="p-3 md:p-4 bg-slate-50 border-t border-slate-100 shrink-0 grid grid-cols-2 gap-2 md:gap-3">
              <button onClick={() => setIsReceiptModalOpen(false)} className="py-2 md:py-2.5 px-3 md:px-4 rounded-xl border border-slate-200 text-slate-600 font-medium hover:bg-slate-100 transition-colors text-xs md:text-sm">
                New Sale
              </button>
              <button className="py-2 md:py-2.5 px-3 md:px-4 rounded-xl bg-indigo-600 text-white font-medium hover:bg-indigo-700 transition-colors text-xs md:text-sm shadow-md shadow-indigo-200">
                Print Receipt
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

