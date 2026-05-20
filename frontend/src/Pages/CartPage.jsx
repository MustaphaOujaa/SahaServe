import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const INITIAL_CART = [
  {
    id: 1,
    name: "Royal Lamb Tagine",
    description: "Slow-cooked lamb with prunes, almonds, and saffron. A true Moroccan classic.",
    price: 24.50,
    qty: 1,
    image: "https://images.unsplash.com/photo-1541518763669-27fef04b14ea?w=400&q=80"
  }
];

const CartPage = () => {
  const [cart, setCart] = useState(INITIAL_CART);
  const [orderType, setOrderType] = useState('home'); // 'home' or 'site'
  const [paymentMethod, setPaymentMethod] = useState('visa');

  const updateQty = (id, delta) => {
    setCart(prev => prev.map(item => {
      if (item.id === id) {
        return { ...item, qty: Math.max(1, item.qty + delta) };
      }
      return item;
    }));
  };

  const removeItem = (id) => {
    setCart(prev => prev.filter(item => item.id !== id));
  };

  const subtotal = cart.reduce((sum, item) => sum + item.price * item.qty, 0);
  const serviceFee = 2.00;
  const tax = subtotal * 0.1;
  const total = subtotal + serviceFee + tax;

  if (cart.length === 0) {
    return (
      <div className="min-h-screen bg-cream pt-32 pb-20 px-[5%] flex flex-col items-center justify-center text-center">
        <div className="w-24 h-24 rounded-full bg-gold-pale flex items-center justify-center mb-8">
          <i className="fas fa-shopping-basket text-[2.5rem] text-gold"></i>
        </div>
        <h2 className="font-['Cormorant_Garamond'] text-[2.2rem] font-bold text-brown-dark mb-4">Your cart is empty</h2>
        <p className="text-text-mid mb-10 max-w-[400px]">Go back to the menu to add some delicious Moroccan dishes to your selection!</p>
        <Link to="/menu" className="px-8 py-3.5 rounded-full bg-gold text-white font-semibold text-[0.95rem] shadow-[0_4px_14px_rgba(200,146,42,0.35)] hover:bg-brown transition-all">
          Browse Menu
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cream pt-32 pb-20 px-[5%]">
      <div className="max-w-[1200px] mx-auto">
        <header className="text-center mb-12 animate-[fadeUp_0.6s_ease_both]">
          <h1 className="font-['Cormorant_Garamond'] text-[3rem] font-bold text-brown-dark mb-2">
            Your Gastronomic <em className="text-gold italic not-italic">Cart</em>
          </h1>
          <p className="text-text-mid">Review your selection before we prepare your Moroccan feast.</p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-10 items-start">
          {/* Left Column: Items */}
          <div className="bg-white rounded-[24px] shadow-custom p-8 animate-[fadeUp_0.6s_0.1s_ease_both]">
            <div className="flex justify-between items-center mb-8 pb-4 border-b border-beige">
              <h2 className="font-['Cormorant_Garamond'] text-[1.8rem] font-bold text-brown-dark">Cart Items</h2>
              <Link to="/menu" className="text-gold font-semibold text-[0.85rem] flex items-center gap-2 hover:opacity-80">
                <i className="fas fa-arrow-left"></i> Continue Shopping
              </Link>
            </div>

            <div className="flex flex-col">
              {cart.map(item => (
                <div key={item.id} className="flex flex-wrap sm:flex-nowrap gap-6 py-6 border-b border-beige last:border-none">
                  <img src={item.image} alt={item.name} className="w-[100px] h-[100px] rounded-[18px] object-cover shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start mb-1">
                      <h3 className="font-['Cormorant_Garamond'] text-[1.4rem] font-bold text-brown-dark truncate">{item.name}</h3>
                      <button 
                        className="text-[#e74c3c] text-[0.8rem] flex items-center gap-1.5 opacity-60 hover:opacity-100 transition-all"
                        onClick={() => removeItem(item.id)}
                      >
                        <i className="fas fa-trash-can"></i> Remove
                      </button>
                    </div>
                    <p className="text-text-mid text-[0.85rem] mb-4 line-clamp-2">{item.description}</p>
                    
                    <div className="flex items-center justify-between mt-auto">
                      <div className="flex items-center gap-4 bg-cream px-3.5 py-1.5 rounded-full">
                        <button className="text-gold hover:scale-120 transition-transform" onClick={() => updateQty(item.id, -1)}>
                          <i className="fas fa-minus text-[0.7rem]"></i>
                        </button>
                        <span className="font-bold text-[0.9rem] min-w-[20px] text-center">{item.qty}</span>
                        <button className="text-gold hover:scale-120 transition-transform" onClick={() => updateQty(item.id, 1)}>
                          <i className="fas fa-plus text-[0.7rem]"></i>
                        </button>
                      </div>
                      <span className="text-gold font-bold text-[1.1rem]">${(item.price * item.qty).toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right Column: Checkout Sidebar */}
          <div className="flex flex-col gap-6 animate-[fadeUp_0.6s_0.2s_ease_both]">
            {/* Order Details Card */}
            <div className="bg-white rounded-[24px] shadow-custom p-8">
              <div className="flex items-center gap-3 font-['Cormorant_Garamond'] text-[1.5rem] font-bold text-brown-dark mb-6">
                <i className="fas fa-truck-fast text-gold text-[1.2rem]"></i> Order Details
              </div>

              <div className="flex bg-cream p-1 rounded-full mb-6">
                <button 
                  className={`flex-1 py-2.5 rounded-full text-[0.85rem] font-semibold transition-all ${orderType === 'home' ? 'bg-gold text-white shadow-lg' : 'text-text-mid'}`}
                  onClick={() => setOrderType('home')}
                >
                  Home Delivery
                </button>
                <button 
                  className={`flex-1 py-2.5 rounded-full text-[0.85rem] font-semibold transition-all ${orderType === 'site' ? 'bg-gold text-white shadow-lg' : 'text-text-mid'}`}
                  onClick={() => setOrderType('site')}
                >
                  On Site
                </button>
              </div>

              <div className="flex flex-col gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[0.7rem] font-bold text-text-mid uppercase tracking-wider">Full Name</label>
                  <input type="text" placeholder="e.g. John Doe" className="w-full px-4 py-3 rounded-[12px] border-[1.5px] border-beige bg-cream text-[0.9rem] outline-none focus:border-gold transition-all" />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[0.7rem] font-bold text-text-mid uppercase tracking-wider">Phone Number</label>
                  <input type="tel" placeholder="+212 6XX-XXXXXX" className="w-full px-4 py-3 rounded-[12px] border-[1.5px] border-beige bg-cream text-[0.9rem] outline-none focus:border-gold transition-all" />
                </div>

                {orderType === 'home' ? (
                  <div className="flex flex-col gap-1.5 animate-[fadeUp_0.3s_ease]">
                    <label className="text-[0.7rem] font-bold text-text-mid uppercase tracking-wider">Delivery Address</label>
                    <textarea rows="3" placeholder="Enter your full address..." className="w-full px-4 py-3 rounded-[12px] border-[1.5px] border-beige bg-cream text-[0.9rem] outline-none focus:border-gold transition-all resize-none"></textarea>
                  </div>
                ) : (
                  <div className="flex flex-col gap-4 animate-[fadeUp_0.3s_ease]">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[0.7rem] font-bold text-text-mid uppercase tracking-wider">Table Number</label>
                      <input type="number" placeholder="e.g. 12" className="w-full px-4 py-3 rounded-[12px] border-[1.5px] border-beige bg-cream text-[0.9rem] outline-none focus:border-gold transition-all" />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[0.7rem] font-bold text-text-mid uppercase tracking-wider">Special Notes (Optional)</label>
                      <input type="text" placeholder="Allergies, preferences..." className="w-full px-4 py-3 rounded-[12px] border-[1.5px] border-beige bg-cream text-[0.9rem] outline-none focus:border-gold transition-all" />
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Summary & Payment Card */}
            <div className="bg-white rounded-[24px] shadow-custom p-8">
              <div className="flex items-center gap-3 font-['Cormorant_Garamond'] text-[1.5rem] font-bold text-brown-dark mb-6">
                <i className="fas fa-receipt text-gold text-[1.2rem]"></i> Order Summary
              </div>

              <div className="flex flex-col gap-3 mb-6">
                <div className="flex justify-between text-text-mid text-[0.95rem]">
                  <span>Subtotal</span>
                  <span>${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-text-mid text-[0.95rem]">
                  <span>Service Fee</span>
                  <span>${serviceFee.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-text-mid text-[0.95rem]">
                  <span>Tax (10%)</span>
                  <span>${tax.toFixed(2)}</span>
                </div>
                <div className="mt-4 pt-4 border-t border-beige flex justify-between items-center text-[1.3rem] font-bold text-brown-dark">
                  <span>Total Amount</span>
                  <span className="text-gold">${total.toFixed(2)}</span>
                </div>
              </div>

              <div className="mb-8">
                <label className="text-[0.7rem] font-bold text-text-mid uppercase tracking-wider block mb-3">Payment Method</label>
                <div className="grid grid-cols-4 gap-2">
                  {[
                    { id: 'visa', icon: 'fa-brands fa-cc-visa' },
                    { id: 'paypal', icon: 'fa-brands fa-paypal' },
                    { id: 'apple', icon: 'fa-brands fa-apple-pay' },
                    { id: 'cash', icon: 'fas fa-money-bill-wave' }
                  ].map(method => (
                    <button 
                      key={method.id} 
                      onClick={() => setPaymentMethod(method.id)}
                      className={`h-12 rounded-[12px] border-[1.5px] flex items-center justify-center text-[1.4rem] transition-all ${paymentMethod === method.id ? 'border-gold bg-gold-pale text-gold' : 'border-beige bg-cream text-text-mid hover:border-gold'}`}
                    >
                      <i className={method.icon}></i>
                    </button>
                  ))}
                </div>
              </div>

              <button className="w-full py-4 rounded-full bg-gold text-white font-bold text-[1rem] tracking-wider uppercase shadow-[0_6px_20px_rgba(200,146,42,0.4)] hover:bg-brown-dark hover:-translate-y-[2px] transition-all">
                Complete Checkout
              </button>
              
              <div className="text-center mt-4 text-[0.7rem] text-text-mid opacity-70 flex items-center justify-center gap-1.5">
                <i className="fas fa-lock"></i> Secure encrypted transaction
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartPage;
