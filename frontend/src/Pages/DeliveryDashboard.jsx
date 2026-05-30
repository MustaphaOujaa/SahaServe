import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { api } from "../context/AuthContext";
import { useAuth } from "../context/AuthContext";
import { PageLoader } from "../Components/UI/Loading";
import { getEcho } from "../utils/reverb";
import toast from "react-hot-toast";

const statusStyles = {
  pending: "bg-amber-50 text-amber-800 border-amber-200/60",
  confirmed: "bg-blue-50 text-blue-800 border-blue-200/60",
  preparing: "bg-orange-50 text-orange-800 border-orange-200/60",
  prepared: "bg-emerald-50 text-emerald-800 border-emerald-200/60",
  delivered: "bg-gray-100 text-gray-700 border-gray-200",
  cancelled: "bg-red-50 text-red-800 border-red-200/60",
};

function StatusBadge({ value, t }) {
  const statusLabels = {
    pending: t('orders.pending'),
    preparing: t('orders.preparing'),
    confirmed: t('orders.confirmed'),
    prepared: t('orders.prepared'),
    delivered: t('orders.delivered') || 'Delivered',
    cancelled: t('orders.cancelled'),
  };
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-[0.72rem] font-bold capitalize ${statusStyles[value] || statusStyles.pending}`}>
      {statusLabels[value] || value}
    </span>
  );
}

function PremiumCard({ children, className = "" }) {
  return (
    <div className={`rounded-2xl border border-beige/60 bg-white/95 backdrop-blur-md shadow-custom transition-all duration-300 hover:shadow-custom-md ${className}`}>
      {children}
    </div>
  );
}

const DeliveryDashboard = () => {
  const { t } = useTranslation();
  const { user, setUser } = useAuth();
  const [current, setCurrent] = useState([]);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("active");
  const [actionId, setActionId] = useState(null);

  const deliveryStatus = user?.delivery_status || 'inactive';

  const fetchData = async () => {
    try {
      const [curRes, histRes] = await Promise.all([
        api.get("/delivery/current"),
        api.get("/delivery/history"),
      ]);
      setCurrent(curRes.data.data ?? []);
      setHistory(histRes.data.data ?? []);
    } catch (e) {
      console.error("Failed to load delivery data", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();

    // Listen for WebSocket updates to sync dashboard in real-time
    let channel;
    try {
      const echo = getEcho();
      channel = echo.channel("orders");
      const handleOrderUpdate = (event) => {
        console.log("[Delivery WebSocket] Event received:", event);
        fetchData();
      };
      channel.listen(".order.placed", handleOrderUpdate);
      channel.listen(".order.status.updated", handleOrderUpdate);
    } catch (error) {
      console.warn("Echo real-time connection failed", error);
    }

    return () => {
      if (channel) {
        channel.stopListening(".order.placed");
        channel.stopListening(".order.status.updated");
      }
    };
  }, []);

  const handleStatusChange = (updatedUser) => {
    setUser(updatedUser);
    localStorage.setItem("auth_user", JSON.stringify(updatedUser));
  };

  const handleCheckIn = async () => {
    setActionId("check-in");
    try {
      const res = await api.post("/delivery/check-in");
      if (res.data.success) {
        handleStatusChange(res.data.user);
        toast.success(res.data.message || "Checked in successfully. You are now online!");
        fetchData();
      }
    } catch (e) {
      toast.error(e.response?.data?.message || "Failed to check in");
    } finally {
      setActionId(null);
    }
  };

  const handleCheckOut = async () => {
    setActionId("check-out");
    try {
      const res = await api.post("/delivery/check-out");
      if (res.data.success) {
        handleStatusChange(res.data.user);
        toast.success(res.data.message || "Checked out successfully. You are offline.");
        fetchData();
      }
    } catch (e) {
      toast.error(e.response?.data?.message || "Failed to check out");
    } finally {
      setActionId(null);
    }
  };

  const handleAcceptOrder = async (orderId) => {
    setActionId(orderId);
    try {
      const res = await api.patch(`/delivery/orders/${orderId}/accept`);
      if (res.data.success) {
        handleStatusChange(res.data.user);
        toast.success(res.data.message || "Order accepted! You are now on mission.");
        fetchData();
      }
    } catch (e) {
      toast.error(e.response?.data?.message || "Failed to accept order");
    } finally {
      setActionId(null);
    }
  };

  const handleRefuseOrder = async (orderId) => {
    setActionId(orderId);
    try {
      const res = await api.patch(`/delivery/orders/${orderId}/refuse`);
      if (res.data.success) {
        handleStatusChange(res.data.user);
        toast.success(res.data.message || "Order refused.");
        fetchData();
      }
    } catch (e) {
      toast.error(e.response?.data?.message || "Failed to refuse order");
    } finally {
      setActionId(null);
    }
  };

  const handleMarkDelivered = async (orderId) => {
    setActionId(orderId);
    try {
      const res = await api.patch(`/delivery/orders/${orderId}/delivered`);
      if (res.data.success) {
        handleStatusChange(res.data.user);
        toast.success(res.data.message || "Order delivered successfully!");
        fetchData();
      }
    } catch (e) {
      toast.error(e.response?.data?.message || "Failed to mark as delivered");
    } finally {
      setActionId(null);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return t('common.N/A');
    return new Date(dateString).toLocaleDateString() + ' ' + new Date(dateString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatMoney = (value) => {
    return `${Number(value || 0).toFixed(2)} DH`;
  };

  if (loading) {
    return <PageLoader label={t('common.loading')} />;
  }

  return (
    <div className="min-h-screen bg-cream text-text-dark p-6 pt-24 font-sans">
      <div className="mx-auto max-w-6xl space-y-8 animate-[fadeUp_0.4s_ease-out]">
        
        {/* Header Section */}
        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between bg-white/80 border border-beige/50 rounded-3xl p-6 shadow-custom">
          <div>
            <h1 className="font-['Cormorant_Garamond'] text-[2.8rem] font-bold leading-none tracking-tight text-brown-dark">
              {t('nav.deliveryDashboard').split(' ')[0]} <em className="not-italic text-gold">{t('nav.deliveryDashboard').split(' ').slice(1).join(' ') || 'Dashboard'}</em>
            </h1>
            <p className="mt-2 text-[0.94rem] text-text-mid">
              {t('dashboard.deliveryDescription') || 'Manage your active missions and track deliveries.'}
            </p>
          </div>

          {/* Status Panel */}
          <div className="flex items-center gap-4 bg-cream/60 border border-beige/40 rounded-2xl p-4">
            <div className="flex flex-col">
              <span className="text-[0.65rem] font-bold uppercase tracking-wider text-text-light">
                Status
              </span>
              <div className="flex items-center gap-2 mt-1">
                <span className={`h-2.5 w-2.5 rounded-full ${
                  deliveryStatus === 'available' ? 'bg-emerald-500 animate-pulse' :
                  deliveryStatus === 'busy' ? 'bg-blue-500 animate-pulse' : 'bg-gray-400'
                }`} />
                <span className="text-sm font-bold text-brown-dark capitalize">
                  {deliveryStatus === 'available' ? 'Online & Ready' :
                   deliveryStatus === 'busy' ? 'On Mission (Busy)' : 'Offline'}
                </span>
              </div>
            </div>

            <div className="border-l border-beige h-8 mx-2" />

            {deliveryStatus === 'inactive' ? (
              <button
                disabled={actionId === "check-in"}
                onClick={handleCheckIn}
                className="px-5 py-2 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-sm flex items-center gap-1.5 cursor-pointer active:scale-95"
              >
                {actionId === "check-in" ? (
                  <i className="fas fa-spinner fa-spin"></i>
                ) : (
                  <i className="fas fa-wifi"></i>
                )}
                Go Online
              </button>
            ) : (
              <button
                disabled={actionId === "check-out" || deliveryStatus === 'busy'}
                onClick={handleCheckOut}
                title={deliveryStatus === 'busy' ? "Finish your active delivery first" : ""}
                className="px-5 py-2 rounded-full bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white text-xs font-bold transition-all shadow-sm flex items-center gap-1.5 cursor-pointer active:scale-95"
              >
                {actionId === "check-out" ? (
                  <i className="fas fa-spinner fa-spin"></i>
                ) : (
                  <i className="fas fa-power-off"></i>
                )}
                Go Offline
              </button>
            )}
          </div>
        </div>

        {/* Tab Selection */}
        <div className="flex space-x-1 rounded-full bg-white/95 backdrop-blur-sm p-1.5 shadow-custom border border-beige inline-flex">
          <button
            onClick={() => setActiveTab("active")}
            className={`rounded-full px-6 py-2.5 text-[0.82rem] font-bold transition-all duration-200 cursor-pointer ${
              activeTab === "active" ? "bg-gold text-white shadow" : "text-text-mid hover:text-gold"
            }`}
          >
            <i className="fas fa-truck mr-2"></i>
            {t('dashboard.activeDeliveries') || 'Missions'} ({current.length})
          </button>
          <button
            onClick={() => setActiveTab("history")}
            className={`rounded-full px-6 py-2.5 text-[0.82rem] font-bold transition-all duration-200 cursor-pointer ${
              activeTab === "history" ? "bg-gold text-white shadow" : "text-text-mid hover:text-gold"
            }`}
          >
            <i className="fas fa-history mr-2"></i>
            {t('dashboard.history') || 'Completed'} ({history.length})
          </button>
        </div>

        {/* Active Tab View */}
        {activeTab === "active" && (
          <div className="space-y-6">
            {deliveryStatus === 'inactive' ? (
              <PremiumCard className="p-12 text-center text-text-mid bg-white/50 border border-beige/40">
                <div className="max-w-md mx-auto">
                  <div className="w-16 h-16 rounded-full bg-amber-50 border border-amber-100 flex items-center justify-center mx-auto mb-4">
                    <i className="fas fa-wifi text-gold text-2xl animate-pulse"></i>
                  </div>
                  <h3 className="font-['Cormorant_Garamond'] text-2xl font-bold text-brown-dark mb-2">You are currently Offline</h3>
                  <p className="text-sm text-text-mid mb-6">Go online using the switch above to make yourself available for incoming orders.</p>
                  <button
                    onClick={handleCheckIn}
                    className="px-6 py-3 rounded-full bg-gold hover:bg-brown text-white text-sm font-bold transition-all shadow-sm cursor-pointer"
                  >
                    Go Online Now
                  </button>
                </div>
              </PremiumCard>
            ) : current.length === 0 ? (
              <PremiumCard className="p-12 text-center text-text-mid bg-white/50 border border-beige/40">
                <div className="max-w-md mx-auto">
                  <div className="w-16 h-16 rounded-full bg-emerald-50 border border-emerald-150 flex items-center justify-center mx-auto mb-4">
                    <i className="fas fa-truck-loading text-emerald-600 text-2xl"></i>
                  </div>
                  <h3 className="font-['Cormorant_Garamond'] text-2xl font-bold text-brown-dark mb-1">Waiting for Orders</h3>
                  <p className="text-sm text-text-mid">You are active and online! We will notify you as soon as a new delivery is assigned to you.</p>
                </div>
              </PremiumCard>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {current.map((order) => {
                  const isAccepted = order.delivery_status === 'accepted';
                  return (
                    <PremiumCard
                      key={order.id}
                      className={`overflow-hidden flex flex-col border ${
                        isAccepted ? 'border-blue-200 ring-2 ring-blue-500/5' : 'border-amber-200 ring-2 ring-amber-500/5'
                      }`}
                    >
                      {/* Order Header */}
                      <div className={`flex items-center justify-between px-6 py-4 border-b border-beige/50 ${
                        isAccepted ? 'bg-blue-50/20' : 'bg-amber-50/15'
                      }`}>
                        <div>
                          <span className="text-[0.65rem] font-bold uppercase tracking-wider text-text-light block">
                            Order Reference
                          </span>
                          <h3 className="text-lg font-bold text-brown-dark">#{order.id}</h3>
                        </div>
                        <div className="flex flex-col items-end">
                          <span className="text-[0.65rem] font-bold uppercase tracking-wider text-text-light block">
                            Delivery Mode
                          </span>
                          <span className="inline-flex items-center gap-1 text-xs font-bold text-gold mt-0.5">
                            <i className="fas fa-motorcycle text-[0.7rem]"></i> Home Delivery
                          </span>
                        </div>
                      </div>

                      {/* Order Details */}
                      <div className="p-6 flex-1 space-y-4">
                        {/* Address & Customer info */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-cream/40 rounded-xl p-4 border border-beige/30">
                          <div>
                            <span className="text-[0.65rem] font-bold uppercase tracking-wider text-text-light block">
                              Customer
                            </span>
                            <span className="text-[0.9rem] font-bold text-brown-dark block mt-0.5">
                              {order.user?.name || t('common.N/A')}
                            </span>
                            <span className="text-xs text-text-mid block">
                              <i className="fas fa-phone-alt text-[0.7rem] text-gold mr-1"></i>
                              {order.user?.phone_number || 'No phone number'}
                            </span>
                          </div>

                          <div>
                            <span className="text-[0.65rem] font-bold uppercase tracking-wider text-text-light block">
                              Payment Method
                            </span>
                            <span className="text-[0.9rem] font-semibold text-brown-mid block mt-0.5 capitalize">
                              <i className="far fa-credit-card text-[0.7rem] text-gold mr-1.5"></i>
                              {order.payment_method || 'Cash on Delivery'}
                            </span>
                          </div>
                        </div>

                        {/* Delivery Address */}
                        <div className="bg-cream/40 rounded-xl p-4 border border-beige/30">
                          <span className="text-[0.65rem] font-bold uppercase tracking-wider text-text-light block">
                            Delivery Location
                          </span>
                          <span className="text-[0.88rem] font-medium text-brown-dark mt-1 block leading-relaxed">
                            <i className="fas fa-map-marker-alt text-red-500/80 mr-1.5"></i>
                            {order.delivery_address || t('common.N/A')}
                          </span>
                        </div>

                        {/* Dishes list */}
                        <div>
                          <span className="text-[0.65rem] font-bold uppercase tracking-wider text-text-light block mb-2">
                            Dishes in Order
                          </span>
                          <div className="flex flex-wrap gap-1.5">
                            {order.items?.map((it) => (
                              <span key={it.id} className="inline-flex items-center gap-1.5 rounded-full bg-gold-pale px-3 py-1 text-xs font-semibold text-gold">
                                {it.dish?.name} <span className="text-brown-dark font-extrabold">x{it.quantity}</span>
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Total and Action Buttons */}
                      <div className="border-t border-beige/50 bg-cream/15 p-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div>
                          <span className="text-[0.65rem] font-bold uppercase tracking-wider text-text-light block">
                            Total Earnings
                          </span>
                          <span className="font-['Cormorant_Garamond'] text-2xl font-extrabold text-brown-dark">
                            {formatMoney(order.total_price)}
                          </span>
                        </div>

                        {/* Actions */}
                        <div className="flex gap-2 sm:self-end w-full sm:w-auto">
                          {!isAccepted ? (
                            <>
                              <button
                                disabled={actionId === order.id}
                                onClick={() => handleRefuseOrder(order.id)}
                                className="flex-1 sm:flex-initial px-5 py-2.5 rounded-full border border-red-200 text-red-600 hover:bg-red-50 text-xs font-bold transition-all cursor-pointer active:scale-95 flex items-center justify-center gap-1.5"
                              >
                                {actionId === order.id ? (
                                  <i className="fas fa-spinner fa-spin"></i>
                                ) : (
                                  <i className="fas fa-times"></i>
                                )}
                                Refuse
                              </button>
                              <button
                                disabled={actionId === order.id}
                                onClick={() => handleAcceptOrder(order.id)}
                                className="flex-[2] sm:flex-initial px-6 py-2.5 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-sm cursor-pointer active:scale-95 flex items-center justify-center gap-1.5"
                              >
                                {actionId === order.id ? (
                                  <i className="fas fa-spinner fa-spin"></i>
                                ) : (
                                  <i className="fas fa-check"></i>
                                )}
                                Accept Order
                              </button>
                            </>
                          ) : (
                            <button
                              disabled={actionId === order.id}
                              onClick={() => handleMarkDelivered(order.id)}
                              className="w-full px-6 py-3 rounded-full bg-gold hover:bg-brown text-white text-xs font-bold transition-all shadow hover:shadow-md cursor-pointer active:scale-95 flex items-center justify-center gap-2 animate-[pulse_2s_infinite]"
                            >
                              {actionId === order.id ? (
                                <i className="fas fa-spinner fa-spin"></i>
                              ) : (
                                <i className="fas fa-shipping-fast"></i>
                              )}
                              Mark as Delivered
                            </button>
                          )}
                        </div>
                      </div>
                    </PremiumCard>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {activeTab === "history" && (
          <PremiumCard className="overflow-hidden border-beige/65 bg-white/90">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[620px] border-collapse text-left">
                <thead>
                  <tr className="border-b border-beige bg-cream/70">
                    <th className="px-6 py-4 text-[0.72rem] font-bold uppercase tracking-[0.15em] text-text-dark">
                      Order ID
                    </th>
                    <th className="px-6 py-4 text-[0.72rem] font-bold uppercase tracking-[0.15em] text-text-dark">
                      Time
                    </th>
                    <th className="px-6 py-4 text-[0.72rem] font-bold uppercase tracking-[0.15em] text-text-dark">
                      Customer
                    </th>
                    <th className="px-6 py-4 text-[0.72rem] font-bold uppercase tracking-[0.15em] text-text-dark">
                      Total
                    </th>
                    <th className="px-6 py-4 text-[0.72rem] font-bold uppercase tracking-[0.15em] text-text-dark">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {history.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="px-6 py-12 text-center text-text-mid bg-white/40">
                        <i className="fas fa-history text-gold/30 text-3xl mb-3 block"></i>
                        {t('dashboard.noDeliveryHistory') || 'No completed deliveries yet.'}
                      </td>
                    </tr>
                  ) : (
                    history.map((order) => (
                      <tr
                        key={order.id}
                        className="border-b border-beige/40 bg-white/30 last:border-0 hover:bg-cream/20 transition-colors"
                      >
                        <td className="px-6 py-4 text-[0.86rem] text-brown-dark font-extrabold">#{order.id}</td>
                        <td className="px-6 py-4 text-[0.86rem] text-text-mid">
                          {formatDate(order.updated_at)}
                        </td>
                        <td className="px-6 py-4 text-[0.86rem] text-text-mid">
                          <span className="font-semibold text-brown-dark">
                            {order.user?.name || t('common.N/A')}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-[0.86rem] text-brown-dark font-bold">
                          {formatMoney(order.total_price)}
                        </td>
                        <td className="px-6 py-4">
                          <StatusBadge value={order.status} t={t} />
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </PremiumCard>
        )}
      </div>
    </div>
  );
};

export default DeliveryDashboard;