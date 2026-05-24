import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  useGetCartQuery,
  useUpdateCartItemMutation,
  useRemoveFromCartMutation,
  useGetProfileQuery,
  useGetTablesQuery,
  usePlaceOrderMutation,
} from '../redux/api/apiSlice';
import { normalizeDish } from '../utils/menuTransforms';

const CartPage = () => {
  const navigate = useNavigate();

  // ── Data fetching ──────────────────────────────────────────────
  const { data: cartData, isLoading: cartLoading, isError: cartError } = useGetCartQuery();
  const { data: profile, isLoading: profileLoading } = useGetProfileQuery();
  const { data: availableTables, isLoading: tablesLoading } = useGetTablesQuery(true);

  // ── Mutations ──────────────────────────────────────────────────
  const [updateCartItem] = useUpdateCartItemMutation();
  const [removeFromCart] = useRemoveFromCartMutation();
  const [placeOrder, { isLoading: isPlacing }] = usePlaceOrderMutation();

  // ── Local state ────────────────────────────────────────────────
  const [orderType, setOrderType] = useState('home');       // 'home' | 'site'
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [address, setAddress] = useState('');               // editable delivery address
  const [selectedTableId, setSelectedTableId] = useState('');
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [orderError, setOrderError] = useState('');

  // Pre-fill address from profile once loaded
  useEffect(() => {
    if (profile?.adress) {
      setAddress(profile.adress);
    }
  }, [profile]);

  // Pre-select first available table when tables load
  useEffect(() => {
    if (availableTables?.length && !selectedTableId) {
      setSelectedTableId(String(availableTables[0].id));
    }
  }, [availableTables]);

  // ── Cart actions ───────────────────────────────────────────────
  const updateQty = async (id, currentQty, delta) => {
    const newQty = currentQty + delta;
    if (newQty < 1) return;
    try {
      await updateCartItem({ itemId: id, quantity: newQty }).unwrap();
    } catch (e) {
      console.error(e);
    }
  };

  const removeItem = async (id) => {
    try {
      await removeFromCart(id).unwrap();
    } catch (e) {
      console.error(e);
    }
  };

  // ── Checkout ───────────────────────────────────────────────────
  const handleCheckout = async () => {
    setOrderError('');

    // Client-side guard
    if (orderType === 'home' && !address.trim()) {
      setOrderError('Please enter a delivery address.');
      return;
    }
    if (orderType === 'site' && !selectedTableId) {
      setOrderError('Please select a table.');
      return;
    }

    const payload = {
      order_type: orderType === 'home' ? 'home_delivery' : 'on_site',
      payment_method: paymentMethod,
      ...(orderType === 'home'
        ? { delivery_address: address.trim() }
        : { table_id: Number(selectedTableId) }),
    };

    try {
      await placeOrder(payload).unwrap();
      setOrderSuccess(true);
    } catch (err) {
      setOrderError(
        err?.data?.message || err?.data?.errors?.delivery_address?.[0] || 'Order failed. Please try again.'
      );
    }
  };

  // ── Loading ────────────────────────────────────────────────────
  if (cartLoading || profileLoading) {
    return (
      <div className="min-h-screen bg-cream pt-[72px]">
        <div className="py-20 flex flex-col items-center text-center">
          <i className="fas fa-spinner fa-spin text-3xl text-gold mb-4"></i>
          <p className="text-text-mid text-[0.9rem]">Loading your cart...</p>
        </div>
      </div>
    );
  }

  const cartItems = cartData?.items || [];
  const normalizedItems = cartItems.map(item => ({
    ...item,
    dish: normalizeDish(item.dish)
  }));

  const subtotal = normalizedItems.reduce((sum, item) => sum + item.dish.price * item.quantity, 0);
  const serviceFee = 2.00;
  const tax = subtotal * 0.1;
  const total = subtotal + serviceFee + tax;

  // ── Empty cart ─────────────────────────────────────────────────
  if (cartError || normalizedItems.length === 0) {
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

  // ── Success screen ─────────────────────────────────────────────
  if (orderSuccess) {
    return (
      <div className="min-h-screen bg-cream pt-32 pb-20 px-[5%] flex flex-col items-center justify-center text-center">
        <div className="w-28 h-28 rounded-full bg-green-50 flex items-center justify-center mb-8 animate-[fadeUp_0.5s_ease]">
          <i className="fas fa-circle-check text-[3rem] text-green-500"></i>
        </div>
        <h2 className="font-['Cormorant_Garamond'] text-[2.5rem] font-bold text-brown-dark mb-3 animate-[fadeUp_0.5s_0.1s_ease_both]">
          Order Placed!
        </h2>
        <p className="text-text-mid mb-10 max-w-[400px] animate-[fadeUp_0.5s_0.15s_ease_both]">
          {orderType === 'home'
            ? 'Your meal is on its way. Sit back and relax!'
            : 'Your order has been sent to the kitchen. Enjoy your meal!'}
        </p>
        <Link
          to="/menu"
          className="px-8 py-3.5 rounded-full bg-gold text-white font-semibold text-[0.95rem] shadow-[0_4px_14px_rgba(200,146,42,0.35)] hover:bg-brown transition-all animate-[fadeUp_0.5s_0.2s_ease_both]"
        >
          Back to Menu
        </Link>
      </div>
    );
  }

  // ── Read-only user info display ────────────────────────────────
  const UserInfoRow = ({ icon, label, value }) => (
    <div className="flex items-center gap-3 py-2.5 px-4 rounded-[12px] bg-cream border border-beige">
      <i className={`${icon} text-gold text-[0.85rem] w-4 text-center`}></i>
      <div className="flex flex-col">
        <span className="text-[0.65rem] font-bold text-text-mid uppercase tracking-wider">{label}</span>
        <span className="text-[0.9rem] font-semibold text-brown-dark">{value || <span className="text-text-mid italic font-normal text-[0.85rem]">Not set</span>}</span>
      </div>
    </div>
  );

  // ── Main render ────────────────────────────────────────────────
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

          {/* ── Left Column: Cart Items ───────────────────────── */}
          <div className="bg-white rounded-[24px] shadow-custom p-8 animate-[fadeUp_0.6s_0.1s_ease_both]">
            <div className="flex justify-between items-center mb-8 pb-4 border-b border-beige">
              <h2 className="font-['Cormorant_Garamond'] text-[1.8rem] font-bold text-brown-dark">Cart Items</h2>
              <Link to="/menu" className="text-gold font-semibold text-[0.85rem] flex items-center gap-2 hover:opacity-80">
                <i className="fas fa-arrow-left"></i> Continue Shopping
              </Link>
            </div>

            <div className="flex flex-col">
              {normalizedItems.map(item => (
                <div key={item.id} className="flex flex-wrap sm:flex-nowrap gap-6 py-6 border-b border-beige last:border-none">
                  <img src={item.dish.image} alt={item.dish.name} className="w-[100px] h-[100px] rounded-[18px] object-cover shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start mb-1">
                      <h3 className="font-['Cormorant_Garamond'] text-[1.4rem] font-bold text-brown-dark truncate">{item.dish.name}</h3>
                      <button
                        className="text-[#e74c3c] text-[0.8rem] flex items-center gap-1.5 opacity-60 hover:opacity-100 transition-all cursor-pointer"
                        onClick={() => removeItem(item.id)}
                      >
                        <i className="fas fa-trash-can"></i> Remove
                      </button>
                    </div>
                    <p className="text-text-mid text-[0.85rem] mb-4 line-clamp-2">{item.dish.description}</p>

                    <div className="flex items-center justify-between mt-auto">
                      <div className="flex items-center gap-4 bg-cream px-3.5 py-1.5 rounded-full">
                        <button className="text-gold hover:scale-120 transition-transform cursor-pointer" onClick={() => updateQty(item.id, item.quantity, -1)}>
                          <i className="fas fa-minus text-[0.7rem]"></i>
                        </button>
                        <span className="font-bold text-[0.9rem] min-w-[20px] text-center">{item.quantity}</span>
                        <button className="text-gold hover:scale-120 transition-transform cursor-pointer" onClick={() => updateQty(item.id, item.quantity, 1)}>
                          <i className="fas fa-plus text-[0.7rem]"></i>
                        </button>
                      </div>
                      <span className="text-gold font-bold text-[1.1rem]">{(item.dish.price * item.quantity).toFixed(2)} DH</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ── Right Column: Checkout Sidebar ────────────────── */}
          <div className="flex flex-col gap-6 animate-[fadeUp_0.6s_0.2s_ease_both]">

            {/* Order Details Card */}
            <div className="bg-white rounded-[24px] shadow-custom p-8">
              <div className="flex items-center gap-3 font-['Cormorant_Garamond'] text-[1.5rem] font-bold text-brown-dark mb-6">
                <i className="fas fa-truck-fast text-gold text-[1.2rem]"></i> Order Details
              </div>

              {/* Order type tabs */}
              <div className="flex bg-cream p-1 rounded-full mb-6">
                <button
                  className={`flex-1 py-2.5 rounded-full text-[0.85rem] font-semibold transition-all ${orderType === 'home' ? 'bg-gold text-white shadow-lg' : 'text-text-mid'}`}
                  onClick={() => setOrderType('home')}
                >
                  <i className="fas fa-house mr-1.5"></i> Home Delivery
                </button>
                <button
                  className={`flex-1 py-2.5 rounded-full text-[0.85rem] font-semibold transition-all ${orderType === 'site' ? 'bg-gold text-white shadow-lg' : 'text-text-mid'}`}
                  onClick={() => setOrderType('site')}
                >
                  <i className="fas fa-utensils mr-1.5"></i> On Site
                </button>
              </div>

              <div className="flex flex-col gap-3">
                {/* ── Common: name & phone from profile (read-only) */}
                <UserInfoRow icon="fas fa-user" label="Full Name" value={profile?.name} />
                <UserInfoRow icon="fas fa-phone" label="Phone Number" value={profile?.phone_number} />

                {/* ── Home Delivery: editable address */}
                {orderType === 'home' ? (
                  <div className="flex flex-col gap-1.5 animate-[fadeUp_0.3s_ease]">
                    <label className="text-[0.7rem] font-bold text-text-mid uppercase tracking-wider">
                      Delivery Address
                      <span className="ml-2 text-[0.65rem] text-gold font-normal normal-case">(you can edit this)</span>
                    </label>
                    <textarea
                      rows="3"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      placeholder="Enter your full address..."
                      className="w-full px-4 py-3 rounded-[12px] border-[1.5px] border-beige bg-cream text-[0.9rem] outline-none focus:border-gold transition-all resize-none"
                    />
                  </div>
                ) : (
                  /* ── On Site: available tables dropdown */
                  <div className="flex flex-col gap-1.5 animate-[fadeUp_0.3s_ease]">
                    <label className="text-[0.7rem] font-bold text-text-mid uppercase tracking-wider">
                      Available Table
                    </label>
                    {tablesLoading ? (
                      <div className="flex items-center gap-2 text-text-mid text-[0.85rem] py-3 px-4 rounded-[12px] bg-cream border border-beige">
                        <i className="fas fa-spinner fa-spin text-gold"></i> Loading tables…
                      </div>
                    ) : !availableTables?.length ? (
                      <div className="flex items-center gap-2 text-[#e74c3c] text-[0.85rem] py-3 px-4 rounded-[12px] bg-red-50 border border-red-200">
                        <i className="fas fa-circle-exclamation"></i> No tables available right now.
                      </div>
                    ) : (
                      <select
                        value={selectedTableId}
                        onChange={(e) => setSelectedTableId(e.target.value)}
                        className="w-full px-4 py-3 rounded-[12px] border-[1.5px] border-beige bg-cream text-[0.9rem] outline-none focus:border-gold transition-all cursor-pointer"
                      >
                        {availableTables.map((table) => (
                          <option key={table.id} value={String(table.id)}>
                            Table {table.number} — {table.name} (seats {table.capacity})
                          </option>
                        ))}
                      </select>
                    )}
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
                  <span>{subtotal.toFixed(2)} DH</span>
                </div>
                <div className="flex justify-between text-text-mid text-[0.95rem]">
                  <span>Service Fee</span>
                  <span>{serviceFee.toFixed(2)} DH</span>
                </div>
                <div className="flex justify-between text-text-mid text-[0.95rem]">
                  <span>Tax (10%)</span>
                  <span>{tax.toFixed(2)} DH</span>
                </div>
                <div className="mt-4 pt-4 border-t border-beige flex justify-between items-center text-[1.3rem] font-bold text-brown-dark">
                  <span>Total Amount</span>
                  <span className="text-gold">{total.toFixed(2)} DH</span>
                </div>
              </div>

              {/* Payment method */}
              <div className="mb-6">
                <label className="text-[0.7rem] font-bold text-text-mid uppercase tracking-wider block mb-3">Payment Method</label>
                <div className="grid grid-cols-4 gap-2">
                  {[
                    { id: 'visa',   icon: 'fa-brands fa-cc-visa' },
                    { id: 'paypal', icon: 'fa-brands fa-paypal' },
                    { id: 'apple',  icon: 'fa-brands fa-apple-pay' },
                    { id: 'cash',   icon: 'fas fa-money-bill-wave' },
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

              {/* Error message */}
              {orderError && (
                <div className="mb-4 flex items-center gap-2 text-[0.85rem] text-[#e74c3c] bg-red-50 border border-red-200 px-4 py-3 rounded-[12px]">
                  <i className="fas fa-circle-exclamation"></i>
                  <span>{orderError}</span>
                </div>
              )}

              {/* Submit button */}
              <button
                onClick={handleCheckout}
                disabled={isPlacing || (orderType === 'site' && !availableTables?.length)}
                className="w-full py-4 rounded-full bg-gold text-white font-bold text-[1rem] tracking-wider uppercase shadow-[0_6px_20px_rgba(200,146,42,0.4)] hover:bg-brown-dark hover:-translate-y-[2px] transition-all disabled:opacity-60 disabled:cursor-not-allowed disabled:translate-y-0"
              >
                {isPlacing
                  ? <><i className="fas fa-spinner fa-spin mr-2"></i>Placing Order…</>
                  : 'Complete Checkout'}
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
