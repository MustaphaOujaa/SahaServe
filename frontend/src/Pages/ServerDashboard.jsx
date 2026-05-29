import { useState, useMemo } from "react";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";
import {
  useGetServerActiveOrdersQuery,
  useGetServerHistoryOrdersQuery,
  useGetTablesQuery,
  useMarkOrderDeliveredServerMutation,
  useToggleTableAvailabilityServerMutation,
} from "../redux/api/apiSlice";
import { PageLoader } from "../Components/UI/Loading";

const statusStyles = {
  pending: "bg-amber-50 text-amber-800 border-amber-200/60",
  confirmed: "bg-blue-50 text-blue-800 border-blue-200/60",
  preparing: "bg-orange-50 text-orange-800 border-orange-200/60",
  prepared: "bg-emerald-50 text-emerald-850 border-emerald-200/60",
  delivered: "bg-gray-50 text-gray-700 border-gray-200",
  cancelled: "bg-red-50 text-red-800 border-red-200/60",
};

function StatusBadge({ value, t }) {
  const isPrepared = value === "prepared";
  const statusLabels = {
    pending: t('orders.pending'),
    confirmed: t('orders.confirmed'),
    preparing: t('orders.preparing'),
    prepared: t('orders.prepared'),
    delivered: t('orders.delivered'),
    cancelled: t('orders.cancelled'),
  };
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-[0.72rem] font-bold capitalize transition-all duration-300 ${
        statusStyles[value] || statusStyles.pending
      } ${isPrepared ? "animate-pulse font-extrabold ring-4 ring-emerald-500/10" : ""}`}
    >
      {isPrepared && <span className="h-1.5 w-1.5 rounded-full bg-emerald-600"></span>}
      {isPrepared ? t('orders.readyToServe') || 'Ready to Serve' : (statusLabels[value] || value)}
    </span>
  );
}

function SectionHeader({ eyebrow, title }) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-4 border-b border-beige pb-4 mb-6">
      <div>
        <span className="text-[0.72rem] font-bold uppercase tracking-[0.18em] text-gold">{eyebrow}</span>
        <h2 className="font-['Cormorant_Garamond'] text-[1.85rem] font-bold leading-tight text-brown-dark">{title}</h2>
      </div>
    </div>
  );
}

function AdminCard({ children, className = "" }) {
  return (
    <div
      className={`rounded-[18px] border border-beige/65 bg-white/90 backdrop-blur-md shadow-custom transition-all duration-300 hover:shadow-custom-md flex flex-col ${className}`}
    >
      {children}
    </div>
  );
}

export default function ServerDashboard() {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState("orders");

  const { data: activeOrders = [], isLoading: isLoadingActive } = useGetServerActiveOrdersQuery();
  const { data: historyOrders = [], isLoading: isLoadingHistory } = useGetServerHistoryOrdersQuery();
  const { data: tables = [], isLoading: isLoadingTables } = useGetTablesQuery();

  const [markDelivered, { isLoading: isMarking }] = useMarkOrderDeliveredServerMutation();
  const [toggleTable, { isLoading: isToggling }] = useToggleTableAvailabilityServerMutation();

  const handleMarkServed = async (orderId) => {
    try {
      await markDelivered(orderId).unwrap();
      toast.success(t('orders.orderServed') || `Order #${orderId} has been served.`);
    } catch (error) {
      toast.error(error?.data?.message || t('errors.serverError'));
    }
  };

  const handleToggleTable = async (tableId, currentStatus) => {
    try {
      await toggleTable({ tableId, isAvailable: !currentStatus }).unwrap();
      toast.success(`Table marked as ${!currentStatus ? t('tables.available') : t('tables.occupied')}.`);
    } catch {
      toast.error(t('errors.serverError'));
    }
  };

  const formatOrderTime = (dateString) => {
    if (!dateString) return t('common.N/A');
    return new Date(dateString).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  const readyOrdersCount = useMemo(() => activeOrders.filter((o) => o.status === "prepared").length, [activeOrders]);

  if (isLoadingActive || isLoadingTables) {
    return <PageLoader label={t('common.loading')} />;
  }

  return (
    <div className="min-h-screen bg-cream text-text-dark p-6 pt-24 font-sans">
      <div className="mx-auto max-w-7xl space-y-8 animate-[fadeUp_0.4s_ease-out]">

        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="font-['Cormorant_Garamond'] text-[2.8rem] font-bold leading-none tracking-tight text-brown-dark">
              {t('nav.waiterDashboard').split(' ')[0]} <em className="not-italic text-gold">{t('nav.waiterDashboard').split(' ').slice(1).join(' ') || 'Dashboard'}</em>
            </h1>
            <p className="mt-2 text-[0.94rem] text-text-mid">{t('dashboard.serverDescription') || 'Manage dine-in orders and table availability in real-time.'}</p>
          </div>

          <div className="flex shrink-0 gap-3">
            <div className="flex flex-col items-end justify-center rounded-2xl border border-beige bg-white/95 px-6 py-3 shadow-custom">
              <span className="text-[0.65rem] font-bold uppercase tracking-[0.12em] text-text-light">{t('dashboard.activeOrders')}</span>
              <span className="font-['Cormorant_Garamond'] text-3xl font-extrabold leading-none text-brown-dark mt-1">
                {activeOrders.length}
              </span>
            </div>
            <div className="flex flex-col items-end justify-center rounded-2xl border border-beige bg-white/95 px-6 py-3 shadow-custom">
              <span className="text-[0.65rem] font-bold uppercase tracking-[0.12em] text-emerald-700">{t('dashboard.readyToServe')}</span>
              <span className="font-['Cormorant_Garamond'] text-3xl font-extrabold leading-none text-emerald-600 mt-1 animate-pulse">
                {readyOrdersCount}
              </span>
            </div>
          </div>
        </div>

        <div className="flex space-x-1 rounded-full bg-white/90 backdrop-blur-sm p-1.5 shadow-custom border border-beige inline-flex">
          <button
            onClick={() => setActiveTab("orders")}
            className={`rounded-full px-6 py-2.5 text-[0.82rem] font-bold transition-all duration-200 cursor-pointer ${
              activeTab === "orders" ? "bg-gold text-white shadow" : "text-text-mid hover:text-gold"
            }`}
          >
            <i className="fas fa-concierge-bell mr-2"></i>
            {t('dashboard.activeOrders')} ({activeOrders.length})
          </button>
          <button
            onClick={() => setActiveTab("tables")}
            className={`rounded-full px-6 py-2.5 text-[0.82rem] font-bold transition-all duration-200 cursor-pointer ${
              activeTab === "tables" ? "bg-gold text-white shadow" : "text-text-mid hover:text-gold"
            }`}
          >
            <i className="fas fa-chair mr-2"></i>
            {t('dashboard.tables')} ({tables.length})
          </button>
          <button
            onClick={() => setActiveTab("history")}
            className={`rounded-full px-6 py-2.5 text-[0.82rem] font-bold transition-all duration-200 cursor-pointer ${
              activeTab === "history" ? "bg-gold text-white shadow" : "text-text-mid hover:text-gold"
            }`}
          >
            <i className="fas fa-history mr-2"></i>
            {t('dashboard.history') || 'History'} ({historyOrders.length})
          </button>
        </div>

        {activeTab === "orders" && (
          <div className="space-y-6">
            <SectionHeader eyebrow={t('dashboard.service') || 'Service'} title={t('dashboard.currentOrders') || 'Current On-Site Orders'} />

            {activeOrders.length === 0 ? (
              <div className="p-16 text-center text-text-mid bg-white/40 border border-beige/50 rounded-[18px]">
                <i className="fas fa-clipboard-list text-gold/40 text-3xl mb-3 block"></i>
                {t('dashboard.noActiveOrders')}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {activeOrders.map((order) => {
                  const isReady = order.status === "prepared";
                  return (
                    <AdminCard
                      key={order.id}
                      className={`overflow-hidden transition-all duration-300 ${
                        isReady
                          ? "border-emerald-300 ring-2 ring-emerald-500/10 shadow-custom-md scale-[1.01]"
                          : "hover:-translate-y-0.5"
                      }`}
                    >
                      <div
                        className={`flex items-center justify-between border-b border-beige/70 px-5 py-4 ${
                          isReady ? "bg-emerald-50/20" : "bg-cream/40"
                        }`}
                      >
                        <div>
                          <h3 className="text-[1.15rem] font-bold text-brown-dark">{t('orders.order')} #{order.id}</h3>
                          <span className="text-[0.75rem] text-text-mid flex items-center gap-1 mt-0.5">
                            <i className="far fa-clock"></i> {formatOrderTime(order.created_at)}
                          </span>
                        </div>
                        <StatusBadge value={order.status} t={t} />
                      </div>

                      <div className="px-5 py-3 text-[0.86rem] font-semibold text-brown-mid border-b border-beige/60 bg-white/40 flex items-center gap-2">
                        <i className="fas fa-chair text-gold"></i>
                        <span>{t('orders.table')} {order.table?.number || order.table_id || t('common.N/A')}</span>
                        <span className="text-[0.75rem] font-normal text-text-mid">
                          ({order.table?.capacity || 4} {t('reservations.seats')})
                        </span>
                      </div>

                      <div className="flex-1 p-5 bg-white/20">
                        <span className="text-[0.7rem] font-bold uppercase tracking-wider text-text-mid block mb-3">
                          {t('orders.items')}
                        </span>
                        <ul className="space-y-3.5">
                          {order.items?.map((item) => (
                            <li key={item.id} className="flex gap-3 items-center">
                              <span className="flex h-5.5 w-5.5 shrink-0 items-center justify-center rounded bg-gold-pale text-[0.75rem] font-extrabold text-gold">
                                {item.quantity}x
                              </span>
                              <div>
                                <span className="block text-[0.88rem] font-medium text-brown-dark">
                                  {item.dish?.name || t('dishes.dish')}
                                </span>
                                {item.notes && (
                                  <span className="mt-1 block text-[0.75rem] text-[#b84a34] bg-[#f7ece9] px-2 py-0.5 rounded inline-block">
                                    <i className="fas fa-exclamation-circle mr-1"></i>
                                    {item.notes}
                                  </span>
                                )}
                              </div>
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div className="border-t border-beige/70 bg-white/40 p-4">
                        {isReady ? (
                          <button
                            disabled={isMarking}
                            onClick={() => handleMarkServed(order.id)}
                            className="w-full rounded-full bg-gold py-2.5 text-[0.82rem] font-bold text-white transition-all duration-200 hover:bg-brown shadow-sm hover:shadow flex items-center justify-center gap-2 cursor-pointer active:scale-98"
                          >
                            <i className="fas fa-concierge-bell text-[0.85rem] animate-[bobble_1s_infinite]"></i>
                            <span>{t('orders.markServed')}</span>
                          </button>
                        ) : (
                          <div className="w-full text-center py-2.5 text-[0.82rem] font-semibold text-text-mid bg-gray-50/70 border border-gray-100 rounded-full flex items-center justify-center gap-2">
                            <i className="fas fa-spinner fa-spin text-gold/80"></i>
                            <span>{t('orders.preparingInKitchen')}</span>
                          </div>
                        )}
                      </div>
                    </AdminCard>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {activeTab === "tables" && (
          <div className="space-y-6">
            <SectionHeader eyebrow={t('tables.floorPlan')} title={t('dashboard.manageTables') || 'Manage Tables'} />

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
              {tables.map((table) => {
                const isAvail = table.is_available;
                return (
                  <div
                    key={table.id}
                    className={`rounded-[18px] border transition-all duration-300 relative overflow-hidden flex flex-col justify-between p-6 ${
                      isAvail
                        ? "border-emerald-100 bg-white shadow-sm hover:shadow-md hover:border-emerald-200"
                        : "border-amber-100 bg-[#fbf9f4] shadow-sm"
                    }`}
                  >
                    <div
                      className={`absolute top-0 left-0 right-0 h-1.5 transition-colors ${
                        isAvail ? "bg-emerald-500" : "bg-gold"
                      }`}
                    />

                    <div>
                      <div className="flex items-center justify-between mb-4">
                        <span className="text-[0.65rem] font-bold uppercase tracking-[0.15em] text-text-light">
                          {t('tables.floorPlan')}
                        </span>
                        <span
                          className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[0.68rem] font-extrabold uppercase tracking-wide ${
                            isAvail ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-800"
                          }`}
                        >
                          <span
                            className={`h-1.5 w-1.5 rounded-full ${isAvail ? "bg-emerald-500 animate-pulse" : "bg-amber-500"}`}
                          />
                          {isAvail ? t('tables.available') : t('tables.occupied')}
                        </span>
                      </div>

                      <h3 className="font-['Cormorant_Garamond'] text-3xl font-bold text-brown-dark mb-1">
                        {t('orders.table')} {table.number}
                      </h3>
                      <p className="text-[0.8rem] text-text-mid mb-5 flex items-center gap-1.5">
                        <i className="fas fa-users text-gold/60 text-[0.75rem]"></i>
                        <span>{t('reservations.capacity')}: {table.capacity} {t('reservations.guests')}</span>
                      </p>
                    </div>

                    <button
                      disabled={isToggling}
                      onClick={() => handleToggleTable(table.id, table.is_available)}
                      className={`w-full py-2.5 rounded-full text-[0.78rem] font-bold transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer ${
                        isAvail
                          ? "bg-brown-dark text-white hover:bg-gold shadow-sm"
                          : "bg-gold-pale text-gold hover:bg-gold hover:text-white"
                      }`}
                    >
                      <i className={`fas ${isAvail ? "fa-user-check" : "fa-door-open"}`}></i>
                      <span>{isAvail ? t('tables.markOccupied') : t('tables.markAvailable')}</span>
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {activeTab === "history" && (
          <div className="space-y-6">
            <SectionHeader eyebrow={t('dashboard.history') || 'History'} title={t('dashboard.servedOrders') || 'Served Orders'} />

            {isLoadingHistory ? (
              <div className="p-10 text-center">
                <i className="fas fa-spinner fa-spin text-gold text-2xl"></i>
              </div>
            ) : (
              <AdminCard className="overflow-hidden border-beige/65">
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[620px] border-collapse text-left">
                    <thead>
                      <tr className="border-b border-beige bg-cream/80">
                        <th className="px-6 py-4 text-[0.72rem] font-bold uppercase tracking-[0.15em] text-text-dark">
                          {t('orders.orderId')}
                        </th>
                        <th className="px-6 py-4 text-[0.72rem] font-bold uppercase tracking-[0.15em] text-text-dark">
                          {t('common.time') || 'Time'}
                        </th>
                        <th className="px-6 py-4 text-[0.72rem] font-bold uppercase tracking-[0.15em] text-text-dark">
                          {t('orders.table')}
                        </th>
                        <th className="px-6 py-4 text-[0.72rem] font-bold uppercase tracking-[0.15em] text-text-dark">
                          {t('orders.items')}
                        </th>
                        <th className="px-6 py-4 text-[0.72rem] font-bold uppercase tracking-[0.15em] text-text-dark">
                          {t('common.status')}
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {historyOrders.length === 0 ? (
                        <tr>
                          <td colSpan="5" className="px-6 py-10 text-center text-text-mid bg-white/40">
                            <i className="fas fa-receipt text-gold/40 text-2xl mb-2 block"></i>
                            {t('dashboard.noServedOrders') || 'No served orders yet.'}
                          </td>
                        </tr>
                      ) : (
                        historyOrders.map((order) => (
                          <tr
                            key={order.id}
                            className="border-b border-beige/40 bg-white/30 last:border-0 hover:bg-cream/20 transition-colors"
                          >
                            <td className="px-6 py-4 text-[0.86rem] text-brown-dark font-extrabold">#{order.id}</td>
                            <td className="px-6 py-4 text-[0.86rem] text-text-mid">
                              {formatOrderTime(order.updated_at)}
                            </td>
                            <td className="px-6 py-4 text-[0.86rem] text-text-mid">
                              <span className="font-semibold text-brown-dark">
                                {t('orders.table')} {order.table?.number || order.table_id || t('common.N/A')}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-[0.86rem] text-text-mid">
                              {order.items?.map((item) => `${item.dish?.name} x${item.quantity}`).join(", ") ||
                                t('orders.noItems')}
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
              </AdminCard>
            )}
          </div>
        )}
      </div>
    </div>
  );
}