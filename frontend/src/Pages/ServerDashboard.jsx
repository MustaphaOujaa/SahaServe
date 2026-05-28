import React, { useState, useMemo } from "react";
import toast from "react-hot-toast";
import {
  useGetServerActiveOrdersQuery,
  useGetServerHistoryOrdersQuery,
  useGetTablesQuery,
  useMarkOrderDeliveredServerMutation,
  useToggleTableAvailabilityServerMutation,
} from "../redux/api/apiSlice";
import { PageLoader } from "../Components/UI/Loading";

const statusStyles = {
  pending: "bg-[#fff7e5] text-[#9a6813] border-[#f0d9a5]",
  confirmed: "bg-[#fff7e5] text-[#9a6813] border-[#f0d9a5]",
  preparing: "bg-[#f5e6c8] text-[#6b4b25] border-[#e4c88d]",
  prepared: "bg-[#edf8ef] text-[#287a3e] border-[#bee2c8]",
  delivered: "bg-[#edf8ef] text-[#287a3e] border-[#bee2c8]",
  cancelled: "bg-[#f7ece9] text-[#9b3f2f] border-[#e8c5bd]",
};

function StatusBadge({ value }) {
  return (
    <span className={`inline-flex items-center rounded-full border px-3 py-1 text-[0.72rem] font-semibold capitalize ${statusStyles[value] || statusStyles.pending}`}>
      {value === 'prepared' ? 'Ready to Serve' : value}
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
    <div className={`rounded-[16px] border border-[rgba(200,146,42,0.14)] bg-white shadow-sm flex flex-col ${className}`}>
      {children}
    </div>
  );
}

export default function ServerDashboard() {
  const [activeTab, setActiveTab] = useState("orders");

  const { data: activeOrders = [], isLoading: isLoadingActive } = useGetServerActiveOrdersQuery(undefined, { pollingInterval: 5000 });
  const { data: historyOrders = [], isLoading: isLoadingHistory } = useGetServerHistoryOrdersQuery();
  const { data: tables = [], isLoading: isLoadingTables } = useGetTablesQuery();
  
  const [markDelivered, { isLoading: isMarking }] = useMarkOrderDeliveredServerMutation();
  const [toggleTable, { isLoading: isToggling }] = useToggleTableAvailabilityServerMutation();

  const handleMarkServed = async (orderId) => {
    try {
      await markDelivered(orderId).unwrap();
      toast.success(`Order #${orderId} has been served.`);
    } catch (error) {
      toast.error(error?.data?.message || "Failed to mark as served.");
    }
  };

  const handleToggleTable = async (tableId, currentStatus) => {
    try {
      await toggleTable({ tableId, isAvailable: !currentStatus }).unwrap();
      toast.success(`Table marked as ${!currentStatus ? 'Available' : 'Occupied'}.`);
    } catch (error) {
      toast.error("Failed to update table status.");
    }
  };

  const formatOrderTime = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const readyOrdersCount = useMemo(() => activeOrders.filter(o => o.status === "prepared").length, [activeOrders]);

  if (isLoadingActive || isLoadingTables) {
    return <PageLoader label="Loading Server Dashboard..." />;
  }

  return (
    <div className="min-h-screen bg-[#f8f6f1] text-text-main p-6 pt-24 font-sans">
      <div className="mx-auto max-w-7xl space-y-8">
        
        {/* Header Section */}
        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="font-['Cormorant_Garamond'] text-[2.5rem] font-bold leading-none tracking-tight text-brown-dark">
              Waiter Dashboard
            </h1>
            <p className="mt-2 text-[0.92rem] text-text-mid">Manage dine-in orders and table availability.</p>
          </div>
          
          <div className="flex shrink-0 gap-3">
            <div className="flex flex-col items-end justify-center rounded-xl border border-beige bg-white px-5 py-3 shadow-sm">
              <span className="text-[0.68rem] font-bold uppercase tracking-[0.12em] text-text-light">Active Orders</span>
              <span className="font-['Cormorant_Garamond'] text-2xl font-bold leading-none text-brown-dark">
                {activeOrders.length}
              </span>
            </div>
            <div className="flex flex-col items-end justify-center rounded-xl border border-beige bg-white px-5 py-3 shadow-sm">
              <span className="text-[0.68rem] font-bold uppercase tracking-[0.12em] text-[#287a3e]">Ready to Serve</span>
              <span className="font-['Cormorant_Garamond'] text-2xl font-bold leading-none text-[#287a3e]">
                {readyOrdersCount}
              </span>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex space-x-1 rounded-xl bg-white p-1 shadow-sm border border-beige inline-flex">
          <button
            onClick={() => setActiveTab("orders")}
            className={`rounded-lg px-6 py-2.5 text-[0.82rem] font-bold transition-all ${
              activeTab === "orders" ? "bg-gold text-white shadow-md" : "text-text-mid hover:bg-cream/50"
            }`}
          >
            Active Orders
          </button>
          <button
            onClick={() => setActiveTab("tables")}
            className={`rounded-lg px-6 py-2.5 text-[0.82rem] font-bold transition-all ${
              activeTab === "tables" ? "bg-gold text-white shadow-md" : "text-text-mid hover:bg-cream/50"
            }`}
          >
            Tables Overview
          </button>
          <button
            onClick={() => setActiveTab("history")}
            className={`rounded-lg px-6 py-2.5 text-[0.82rem] font-bold transition-all ${
              activeTab === "history" ? "bg-gold text-white shadow-md" : "text-text-mid hover:bg-cream/50"
            }`}
          >
            History
          </button>
        </div>

        {/* Orders Section */}
        {activeTab === "orders" && (
          <div className="space-y-6">
            <SectionHeader eyebrow="Service" title="Current On-Site Orders" />
            
            {activeOrders.length === 0 ? (
              <div className="p-10 text-center text-text-mid">No active dine-in orders right now.</div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {activeOrders.map((order) => (
                  <AdminCard key={order.id} className="overflow-hidden">
                    <div className="flex items-center justify-between border-b border-beige/70 bg-cream/30 px-5 py-4">
                      <div>
                        <h3 className="text-[1.15rem] font-bold text-brown-dark">#{order.id}</h3>
                        <span className="text-[0.75rem] text-text-mid"><i className="far fa-clock mr-1"></i>{formatOrderTime(order.created_at)}</span>
                      </div>
                      <StatusBadge value={order.status} />
                    </div>
                    
                    <div className="px-5 py-3 text-[0.9rem] font-bold text-brown-dark border-b border-beige/70 bg-[#f8f6f1]/50">
                      <i className="fas fa-chair text-gold mr-2"></i> Table {order.table?.number || order.table_id || "N/A"}
                    </div>

                    <div className="flex-1 p-5">
                      <ul className="space-y-4">
                        {order.items?.map(item => (
                          <li key={item.id} className="flex gap-3">
                            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded bg-gold-pale text-[0.75rem] font-bold text-gold">
                              {item.quantity}x
                            </span>
                            <div>
                              <span className="block text-[0.9rem] font-semibold text-brown-dark">{item.dish?.name || "Dish"}</span>
                            </div>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="border-t border-beige/70 bg-white p-4">
                      {order.status === "prepared" ? (
                        <button
                          disabled={isMarking}
                          onClick={() => handleMarkServed(order.id)}
                          className="w-full rounded-lg bg-gold py-2.5 text-[0.85rem] font-bold text-white transition-colors hover:bg-gold-hover shadow-sm disabled:opacity-50"
                        >
                          <i className="fas fa-concierge-bell mr-2"></i>Mark as Served
                        </button>
                      ) : (
                        <div className="w-full text-center py-2.5 text-[0.85rem] font-bold text-text-mid bg-gray-50 rounded-lg">
                          <i className="fas fa-spinner fa-spin mr-2"></i>Waiting for Kitchen...
                        </div>
                      )}
                    </div>
                  </AdminCard>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tables Section */}
        {activeTab === "tables" && (
          <div className="space-y-6">
            <SectionHeader eyebrow="Floor Plan" title="Manage Tables" />
            
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {tables.map(table => (
                <div key={table.id} className={`p-4 rounded-xl border-2 text-center transition-all ${
                  table.is_available 
                    ? "border-green-200 bg-green-50" 
                    : "border-red-200 bg-red-50"
                }`}>
                  <h3 className="font-['Cormorant_Garamond'] text-2xl font-bold text-brown-dark mb-1">
                    Table {table.number}
                  </h3>
                  <div className="text-[0.75rem] text-text-mid mb-4">
                    Capacity: {table.capacity}
                  </div>
                  <button
                    disabled={isToggling}
                    onClick={() => handleToggleTable(table.id, table.is_available)}
                    className={`w-full py-2 rounded text-[0.75rem] font-bold text-white transition-colors ${
                      table.is_available ? "bg-[#3b8a4d] hover:bg-green-700" : "bg-[#b84a34] hover:bg-red-700"
                    }`}
                  >
                    {table.is_available ? "Mark Occupied" : "Mark Available"}
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* History Section */}
        {activeTab === "history" && (
          <div className="space-y-6">
            <SectionHeader eyebrow="History" title="Served Orders" />
            
            {isLoadingHistory ? (
              <div className="p-10 text-center"><i className="fas fa-spinner fa-spin text-gold text-2xl"></i></div>
            ) : (
              <AdminCard className="overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[620px] border-collapse text-left">
                    <thead>
                      <tr className="border-b border-beige bg-cream/70">
                        <th className="px-5 py-3 text-[0.72rem] font-bold uppercase tracking-[0.12em] text-text-mid">Order ID</th>
                        <th className="px-5 py-3 text-[0.72rem] font-bold uppercase tracking-[0.12em] text-text-mid">Time</th>
                        <th className="px-5 py-3 text-[0.72rem] font-bold uppercase tracking-[0.12em] text-text-mid">Table</th>
                        <th className="px-5 py-3 text-[0.72rem] font-bold uppercase tracking-[0.12em] text-text-mid">Items</th>
                        <th className="px-5 py-3 text-[0.72rem] font-bold uppercase tracking-[0.12em] text-text-mid">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {historyOrders.length === 0 ? (
                        <tr>
                          <td colSpan="5" className="px-5 py-8 text-center text-text-mid">No history found.</td>
                        </tr>
                      ) : (
                        historyOrders.map((order) => (
                          <tr key={order.id} className="border-b border-beige/70 last:border-0">
                            <td className="px-5 py-4 text-[0.86rem] text-brown-dark font-bold">#{order.id}</td>
                            <td className="px-5 py-4 text-[0.86rem] text-text-mid">{formatOrderTime(order.updated_at)}</td>
                            <td className="px-5 py-4 text-[0.86rem] text-text-mid">
                              Table {order.table?.number || order.table_id || "N/A"}
                            </td>
                            <td className="px-5 py-4 text-[0.86rem] text-text-mid">
                              {order.items?.map(item => `${item.dish?.name} x${item.quantity}`).join(", ")}
                            </td>
                            <td className="px-5 py-4">
                              <StatusBadge value={order.status} />
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
