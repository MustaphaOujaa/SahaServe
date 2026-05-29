import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { api } from "../utils/api";
import { PageLoader } from "../Components/UI/Loading";

const statusStyles = {
  pending: "bg-[#fff7e5] text-[#9a6813] border-[#f0d9a5]",
  preparing: "bg-[#f5e6c8] text-[#6b4b25] border-[#e4c88d]",
  confirmed: "bg-[#fff7e5] text-[#9a6813] border-[#f0d9a5]",
  prepared: "bg-[#edf8ef] text-[#287a3e] border-[#bee2c8]",
  delivered: "bg-[#edf8ef] text-[#287a3e] border-[#bee2c8]",
  cancelled: "bg-[#f7ece9] text-[#9b3f2f] border-[#e8c5bd]",
};

function StatusBadge({ value, t }) {
  const statusLabels = {
    pending: t('orders.pending'),
    preparing: t('orders.preparing'),
    confirmed: t('orders.confirmed'),
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

function AdminCard({ children, className = "" }) {
  return (
    <div className={`rounded-[16px] border border-[rgba(200,146,42,0.14)] bg-white shadow-custom ${className}`}>
      {children}
    </div>
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

const DeliveryDashboard = () => {
  const { t } = useTranslation();
  const [current, setCurrent] = useState([]);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
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
    fetchData();
  }, []);

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
      <div className="mx-auto max-w-7xl space-y-8">

        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="font-['Cormorant_Garamond'] text-[2.8rem] font-bold leading-none tracking-tight text-brown-dark">
              {t('nav.deliveryDashboard')}
            </h1>
            <p className="mt-2 text-[0.94rem] text-text-mid">{t('dashboard.deliveryDescription') || 'Manage your delivery orders efficiently.'}</p>
          </div>

          <div className="flex shrink-0 gap-3">
            <div className="flex flex-col items-end justify-center rounded-2xl border border-beige bg-white/95 px-6 py-3 shadow-custom">
              <span className="text-[0.65rem] font-bold uppercase tracking-[0.12em] text-text-light">{t('dashboard.currentDeliveries')}</span>
              <span className="font-['Cormorant_Garamond'] text-3xl font-extrabold leading-none text-brown-dark mt-1">
                {current.length}
              </span>
            </div>
            <div className="flex flex-col items-end justify-center rounded-2xl border border-beige bg-white/95 px-6 py-3 shadow-custom">
              <span className="text-[0.65rem] font-bold uppercase tracking-[0.12em] text-emerald-700">{t('dashboard.completedDeliveries') || 'Completed'}</span>
              <span className="font-['Cormorant_Garamond'] text-3xl font-extrabold leading-none text-emerald-600 mt-1">
                {history.length}
              </span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-8">
          <AdminCard className="p-6">
            <SectionHeader eyebrow={t('dashboard.activeDeliveries') || 'Active'} title={t('dashboard.currentDeliveries')} />
            <div className="mt-5">
              {current.length === 0 ? (
                <div className="p-10 text-center text-text-mid bg-cream/50 rounded-[12px] border border-beige">
                  <i className="fas fa-truck text-gold/40 text-3xl mb-3 block"></i>
                  <p>{t('dashboard.noDeliveries') || 'No active deliveries.'}</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[620px] border-collapse text-left">
                    <thead>
                      <tr className="border-b border-beige bg-cream/70">
                        <th className="px-5 py-3 text-[0.72rem] font-bold uppercase tracking-[0.12em] text-text-mid">#</th>
                        <th className="px-5 py-3 text-[0.72rem] font-bold uppercase tracking-[0.12em] text-text-mid">{t('orders.customer')}</th>
                        <th className="px-5 py-3 text-[0.72rem] font-bold uppercase tracking-[0.12em] text-text-mid">{t('orders.total')}</th>
                        <th className="px-5 py-3 text-[0.72rem] font-bold uppercase tracking-[0.12em] text-text-mid">{t('common.status')}</th>
                        <th className="px-5 py-3 text-[0.72rem] font-bold uppercase tracking-[0.12em] text-text-mid">{t('orders.items')}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {current.map((order) => (
                        <tr key={order.id} className="border-b border-beige/70 hover:bg-cream/30 transition-colors">
                          <td className="px-5 py-4 text-[0.86rem] text-brown-dark font-bold">#{order.id}</td>
                          <td className="px-5 py-4 text-[0.86rem] text-text-mid">{order.user?.name || t('common.N/A')}</td>
                          <td className="px-5 py-4 text-[0.86rem] text-brown-dark font-semibold">{formatMoney(order.total_price)}</td>
                          <td className="px-5 py-4">
                            <StatusBadge value={order.status} t={t} />
                          </td>
                          <td className="px-5 py-4 text-[0.86rem] text-text-mid">
                            <div className="flex flex-wrap gap-1">
                              {order.items?.map((it) => (
                                <span key={it.id} className="inline-flex items-center gap-1 rounded-full bg-gold-pale px-2 py-0.5 text-[0.72rem] font-medium text-gold">
                                  {it.dish?.name} x{it.quantity}
                                </span>
                              ))}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </AdminCard>

          <AdminCard className="p-6">
            <SectionHeader eyebrow={t('dashboard.history') || 'History'} title={t('dashboard.deliveryHistory')} />
            <div className="mt-5">
              {history.length === 0 ? (
                <div className="p-10 text-center text-text-mid bg-cream/50 rounded-[12px] border border-beige">
                  <i className="fas fa-history text-gold/40 text-3xl mb-3 block"></i>
                  <p>{t('dashboard.noDeliveryHistory') || 'No completed deliveries yet.'}</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[620px] border-collapse text-left">
                    <thead>
                      <tr className="border-b border-beige bg-cream/70">
                        <th className="px-5 py-3 text-[0.72rem] font-bold uppercase tracking-[0.12em] text-text-mid">#</th>
                        <th className="px-5 py-3 text-[0.72rem] font-bold uppercase tracking-[0.12em] text-text-mid">{t('orders.customer')}</th>
                        <th className="px-5 py-3 text-[0.72rem] font-bold uppercase tracking-[0.12em] text-text-mid">{t('orders.total')}</th>
                        <th className="px-5 py-3 text-[0.72rem] font-bold uppercase tracking-[0.12em] text-text-mid">{t('common.details')}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {history.map((order) => (
                        <tr key={order.id} className="border-b border-beige/70 hover:bg-cream/30 transition-colors">
                          <td className="px-5 py-4 text-[0.86rem] text-brown-dark font-bold">#{order.id}</td>
                          <td className="px-5 py-4 text-[0.86rem] text-text-mid">{order.user?.name || t('common.N/A')}</td>
                          <td className="px-5 py-4 text-[0.86rem] text-brown-dark font-semibold">{formatMoney(order.total_price)}</td>
                          <td className="px-5 py-4 text-[0.86rem] text-text-mid">
                            <span className="text-[0.78rem]">{formatDate(order.updated_at)}</span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </AdminCard>
        </div>

      </div>
    </div>
  );
};

export default DeliveryDashboard;