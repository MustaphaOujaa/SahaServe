// src/Pages/DeliveryDashboard.jsx
import React, { useEffect, useState } from "react";
import { api } from "../utils/api"; // helper axios instance (already exported in utils)
import { useAuth } from "../context/AuthContext";
import { PageLoader } from "../Components/UI/Loading";

const DeliveryDashboard = () => {
  const { user } = useAuth();
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

  if (loading) {
    return <PageLoader label="Loading deliveries..." />;
  }

  const renderOrderRow = (order) => (
    <tr key={order.id} className="border-b hover:bg-gray-50 dark:hover:bg-gray-700">
      <td className="px-4 py-2">{order.id}</td>
      <td className="px-4 py-2">{order.user?.name ?? "-"}</td>
      <td className="px-4 py-2">{order.total_price?.toFixed(2)} $</td>
      <td className="px-4 py-2">{order.status}</td>
      <td className="px-4 py-2">
        {order.items?.map((it) => (
          <span key={it.id} className="badge mr-1">
            {it.dish?.name} x{it.quantity}
          </span>
        ))}
      </td>
    </tr>
  );

  return (
    <div className="p-6 bg-white dark:bg-gray-900 min-h-screen">
      <h1 className="text-3xl font-semibold mb-6 text-gray-800 dark:text-gray-100">
        Delivery Dashboard
      </h1>

      {/* Current Orders */}
      <section className="mb-10">
        <h2 className="text-2xl font-medium mb-4 text-gray-700 dark:text-gray-200">Current Orders</h2>
        {current.length === 0 ? (
          <p className="text-gray-500 dark:text-gray-400">No active deliveries.</p>
        ) : (
          <div className="overflow-x-auto rounded-lg shadow" style={{background: "var(--glass-bg)"}}>
            <table className="w-full text-left">
              <thead className="bg-gray-100 dark:bg-gray-800">
                <tr>
                  <th className="px-4 py-2">#</th>
                  <th className="px-4 py-2">Customer</th>
                  <th className="px-4 py-2">Total</th>
                  <th className="px-4 py-2">Status</th>
                  <th className="px-4 py-2">Items</th>
                </tr>
              </thead>
              <tbody>{current.map(renderOrderRow)}</tbody>
            </table>
          </div>
        )}
      </section>

      {/* Delivery History */}
      <section>
        <h2 className="text-2xl font-medium mb-4 text-gray-700 dark:text-gray-200">Delivery History</h2>
        {history.length === 0 ? (
          <p className="text-gray-500 dark:text-gray-400">No completed deliveries yet.</p>
        ) : (
          <div className="overflow-x-auto rounded-lg shadow" style={{background: "var(--glass-bg)"}}>
            <table className="w-full text-left">
              <thead className="bg-gray-100 dark:bg-gray-800">
                <tr>
                  <th className="px-4 py-2">#</th>
                  <th className="px-4 py-2">Customer</th>
                  <th className="px-4 py-2">Total</th>
                  <th className="px-4 py-2">Delivered At</th>
                </tr>
              </thead>
              <tbody>
                {history.map((order) => (
                  <tr key={order.id} className="border-b hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-4 py-2">{order.id}</td>
                    <td className="px-4 py-2">{order.user?.name ?? "-"}</td>
                    <td className="px-4 py-2">{order.total_price?.toFixed(2)} $</td>
                    <td className="px-4 py-2">{new Date(order.updated_at).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
};

export default DeliveryDashboard;
