import { useState, useMemo } from "react";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";
import { useGetOrdersQuery, useUpdateOrderStatusMutation } from "../redux/api/apiSlice";
import { PageLoader } from "../Components/UI/Loading";

const statusStyles = {
  pending: "bg-[#fff7e5] text-[#9a6813] border-[#f0d9a5]",
  confirmed: "bg-[#fff7e5] text-[#9a6813] border-[#f0d9a5]",
  preparing: "bg-[#f5e6c8] text-[#6b4b25] border-[#e4c88d]",
  prepared: "bg-[#edf8ef] text-[#287a3e] border-[#bee2c8]",
  delivered: "bg-[#edf8ef] text-[#287a3e] border-[#bee2c8]",
  cancelled: "bg-[#f7ece9] text-[#9b3f2f] border-[#e8c5bd]",
};

function StatusBadge({ value, t }) {
  const statusLabels = {
    pending: t('orders.pending'),
    confirmed: t('orders.confirmed'),
    preparing: t('orders.preparing'),
    prepared: t('orders.prepared'),
    delivered: t('orders.delivered'),
    cancelled: t('orders.cancelled'),
  };
  return (
    <span className={`inline-flex items-center rounded-full border px-3 py-1 text-[0.72rem] font-semibold capitalize ${statusStyles[value] || statusStyles.pending}`}>
      {statusLabels[value] || value}
    </span>
  );
}

function SectionHeader({ eyebrow, title }) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-4 border-b border-beige pb-4 mb-6">
      <div>
        <span className="text-[0.72rem] font-semibold uppercase tracking-[0.18em] text-gold">{eyebrow}</span>
        <h2 className="font-['Cormorant_Garamond'] text-[1.75rem] font-bold leading-tight text-brown-dark">{title}</h2>
      </div>
    </div>
  );
}

function AdminCard({ children, className = "" }) {
  return (
    <div className={`rounded-[16px] border border-[rgba(200,146,42,0.14)] bg-white shadow-sm ${className}`}>
      {children}
    </div>
  );
}

export default function ChefDashboard() {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState("active");

  const { data: allOrders = [], isLoading } = useGetOrdersQuery();
  const [updateOrderStatus, { isLoading: isUpdating }] = useUpdateOrderStatusMutation();

  const handleUpdateStatus = async (orderId, newStatus) => {
    try {
      await updateOrderStatus({ orderId, status: newStatus }).unwrap();
      toast.success(t('orders.statusUpdated') || `Order #${orderId} marked as ${newStatus}`);
    } catch (error) {
      toast.error(error?.data?.message || t('errors.serverError'));
    }
  };

  const activeOrders = useMemo(() => {
    return allOrders.filter((o) => o.status === "confirmed" || o.status === "preparing");
  }, [allOrders]);

  const historyOrders = useMemo(() => {
    return allOrders.filter((o) => o.status === "prepared" || o.status === "delivered");
  }, [allOrders]);

  const formatOrderTime = (dateString) => {
    if (!dateString) return t('common.N/A');
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  if (isLoading) {
    return <PageLoader label={t('common.loading')} />;
  }

  return (
    <div className="min-h-screen bg-[#f8f6f1] text-text-main p-6 pt-24 font-sans">
      <div className="mx-auto max-w-7xl space-y-8">

        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="font-['Cormorant_Garamond'] text-[2.5rem] font-bold leading-none tracking-tight text-brown-dark">
              {t('nav.chefDashboard')}
            </h1>
            <p className="mt-2 text-[0.92rem] text-text-mid">{t('dashboard.chefDescription') || 'Manage kitchen flow and track prepared orders.'}</p>
          </div>

          <div className="flex shrink-0 gap-3">
            <div className="flex flex-col items-end justify-center rounded-xl border border-beige bg-white px-5 py-3 shadow-sm">
              <span className="text-[0.68rem] font-bold uppercase tracking-[0.12em] text-text-light">{t('dashboard.activeOrders')}</span>
              <span className="font-['Cormorant_Garamond'] text-2xl font-bold leading-none text-brown-dark">
                {activeOrders.length}
              </span>
            </div>
            <div className="flex flex-col items-end justify-center rounded-xl border border-beige bg-white px-5 py-3 shadow-sm">
              <span className="text-[0.68rem] font-bold uppercase tracking-[0.12em] text-text-light">{t('dashboard.preparedToday')}</span>
              <span className="font-['Cormorant_Garamond'] text-2xl font-bold leading-none text-[#287a3e]">
                {historyOrders.filter(o => new Date(o.updated_at || o.created_at).toDateString() === new Date().toDateString()).length}
              </span>
            </div>
          </div>
        </div>

        <div className="flex space-x-1 rounded-xl bg-white p-1 shadow-sm border border-beige inline-flex">
          <button
            onClick={() => setActiveTab("active")}
            className={`rounded-lg px-6 py-2.5 text-[0.82rem] font-bold transition-all ${
              activeTab === "active" ? "bg-gold text-white shadow-md" : "text-text-mid hover:bg-cream/50"
            }`}
          >
            {t('dashboard.activeOrders')} ({activeOrders.length})
          </button>
          <button
            onClick={() => setActiveTab("history")}
            className={`rounded-lg px-6 py-2.5 text-[0.82rem] font-bold transition-all ${
              activeTab === "history" ? "bg-gold text-white shadow-md" : "text-text-mid hover:bg-cream/50"
            }`}
          >
            {t('dashboard.history') || 'History'}
          </button>
        </div>

        {activeTab === "active" && (
          <div className="space-y-6">
            <SectionHeader eyebrow={t('dashboard.kitchen') || 'Kitchen'} title={t('dashboard.confirmedOrders') || 'Confirmed & Preparing Orders'} />

            {activeOrders.length === 0 ? (
              <div className="p-10 text-center text-text-mid">
                <i className="fas fa-check-circle text-gold text-3xl mb-3 block"></i>
                <p>{t('dashboard.noActiveOrders')}</p>
                <p className="text-sm mt-1">{t('dashboard.greatJob')}</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {activeOrders.map((order) => (
                  <AdminCard key={order.id} className="overflow-hidden flex flex-col">
                    <div className="flex items-center justify-between border-b border-beige/70 bg-cream/30 px-5 py-4">
                      <div>
                        <h3 className="text-[1.15rem] font-bold text-brown-dark">#{order.id}</h3>
                        <span className="text-[0.75rem] text-text-mid"><i className="far fa-clock mr-1"></i>{formatOrderTime(order.created_at)}</span>
                      </div>
                      <StatusBadge value={order.status} t={t} />
                    </div>

                    <div className="px-5 py-3 text-[0.8rem] font-medium text-text-mid border-b border-beige/70 bg-[#f8f6f1]/50">
                      {order.order_type === "on_site" ? (
                        <span><i className="fas fa-chair text-gold mr-2"></i>{t('orders.dineIn')} ({t('orders.table')} {order.table_id || t('common.N/A')})</span>
                      ) : (
                        <span><i className="fas fa-motorcycle text-gold mr-2"></i>{t('orders.delivery')}</span>
                      )}
                    </div>

                    <div className="flex-1 p-5">
                      <ul className="space-y-4">
                        {order.items?.map(item => (
                          <li key={item.id} className="flex gap-3">
                            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded bg-gold-pale text-[0.75rem] font-bold text-gold">
                              {item.quantity}x
                            </span>
                            <div>
                              <span className="block text-[0.9rem] font-semibold text-brown-dark">{item.dish?.name || t('dishes.dish')}</span>
                              {item.notes && (
                                <span className="mt-1 block text-[0.75rem] text-[#b84a34] bg-[#f7ece9] px-2 py-0.5 rounded inline-block">
                                  <i className="fas fa-exclamation-circle mr-1"></i>{item.notes}
                                </span>
                              )}
                            </div>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="border-t border-beige/70 bg-white p-4">
                      {order.status === "pending" && (
                        <button
                          disabled={isUpdating}
                          onClick={() => handleUpdateStatus(order.id, "confirmed")}
                          className="w-full rounded-lg bg-emerald-600 py-2.5 text-[0.85rem] font-bold text-white transition-colors hover:bg-emerald-700 shadow-sm disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                          <i className="fas fa-check-circle mr-2"></i>
                          {t('orders.confirmOrder')}
                        </button>
                      )}
                      {order.status === "confirmed" && (
                        <button
                          disabled={isUpdating}
                          onClick={() => handleUpdateStatus(order.id, "preparing")}
                          className="w-full rounded-lg bg-blue-500 py-2.5 text-[0.85rem] font-bold text-white transition-colors hover:bg-blue-600 shadow-sm disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                          <i className="fas fa-fire mr-2"></i>
                          {t('orders.startPreparing')}
                        </button>
                      )}
                      {order.status === "preparing" && (
                        <button
                          disabled={isUpdating}
                          onClick={() => handleUpdateStatus(order.id, "prepared")}
                          className="w-full rounded-lg bg-gold py-2.5 text-[0.85rem] font-bold text-white transition-colors hover:bg-gold-hover shadow-sm disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                          <i className="fas fa-check mr-2"></i>
                          {t('orders.markPrepared')}
                        </button>
                      )}
                    </div>
                  </AdminCard>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === "history" && (
          <div className="space-y-6">
            <SectionHeader eyebrow={t('dashboard.history') || 'History'} title={t('dashboard.preparedOrders') || 'Prepared & Delivered Orders'} />

            <AdminCard className="overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[620px] border-collapse text-left">
                  <thead>
                    <tr className="border-b border-beige bg-cream/70">
                      <th className="px-5 py-3 text-[0.72rem] font-bold uppercase tracking-[0.12em] text-text-mid">{t('orders.orderId')}</th>
                      <th className="px-5 py-3 text-[0.72rem] font-bold uppercase tracking-[0.12em] text-text-mid">{t('common.time') || 'Time'}</th>
                      <th className="px-5 py-3 text-[0.72rem] font-bold uppercase tracking-[0.12em] text-text-mid">{t('orders.orderType')}</th>
                      <th className="px-5 py-3 text-[0.72rem] font-bold uppercase tracking-[0.12em] text-text-mid">{t('orders.items')}</th>
                      <th className="px-5 py-3 text-[0.72rem] font-bold uppercase tracking-[0.12em] text-text-mid">{t('common.status')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {historyOrders.length === 0 ? (
                      <tr>
                        <td colSpan="5" className="px-5 py-8 text-center text-text-mid">{t('dashboard.noPreparedOrders')}</td>
                      </tr>
                    ) : (
                      historyOrders.map((order) => (
                        <tr key={order.id} className="border-b border-beige/70 last:border-0">
                          <td className="px-5 py-4 text-[0.86rem] text-brown-dark font-bold">#{order.id}</td>
                          <td className="px-5 py-4 text-[0.86rem] text-text-mid">{formatOrderTime(order.created_at)}</td>
                          <td className="px-5 py-4 text-[0.86rem] text-text-mid">
                            {order.order_type === "on_site" ? `${t('orders.table')} ${order.table_id || t('common.N/A')}` : t('orders.delivery')}
                          </td>
                          <td className="px-5 py-4 text-[0.86rem] text-text-mid">
                            {order.items?.map(item => `${item.dish?.name || t('dishes.dish')} x${item.quantity}`).join(", ") || t('orders.noItems')}
                          </td>
                          <td className="px-5 py-4">
                            <StatusBadge value={order.status} t={t} />
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </AdminCard>
          </div>
        )}

      </div>
    </div>
  );
}