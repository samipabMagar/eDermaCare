"use client";

import { useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";
import { orderService } from "@/services/orderService";

const formatCurrency = (value) => `NPR ${Number(value || 0).toLocaleString()}`;

const statusClassFor = (status) => {
  const key = String(status || "").toLowerCase();
  if (key === "delivered") return "bg-green-50 text-green-700 border-green-200";
  if (key === "returned") return "bg-amber-50 text-amber-700 border-amber-200";
  if (key === "cancelled") return "bg-rose-50 text-rose-700 border-rose-200";
  return "bg-slate-50 text-slate-700 border-slate-200";
};

export default function DashboardOrderHistoryPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    const loadOrders = async () => {
      try {
        setIsLoading(true);
        const data = await orderService.getMyOrders();
        setOrders(Array.isArray(data) ? data : []);
      } catch (error) {
        toast.error(error.message || "Failed to load order history");
      } finally {
        setIsLoading(false);
      }
    };

    loadOrders();
  }, []);

  const historyRows = useMemo(() => {
    return orders.filter((order) => {
      const key = String(order.status || "").toLowerCase();
      return ["delivered", "returned", "cancelled"].includes(key);
    });
  }, [orders]);

  if (isLoading) {
    return (
      <p className="p-6 text-sm text-slate-500">Loading order history...</p>
    );
  }

  return (
    <div className="space-y-6 px-4 py-4 sm:px-6">
      <div>
        <h1 className="text-xl font-bold text-slate-900">Order History</h1>
        <p className="mt-1 text-sm text-slate-500">
          View your past delivered, returned, or cancelled orders.
        </p>
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px]">
            <thead className="bg-slate-50">
              <tr className="border-b border-slate-200 text-left text-xs uppercase tracking-wider text-slate-500">
                <th className="px-5 py-4">Order ID</th>
                <th className="px-5 py-4">Products</th>
                <th className="px-5 py-4">Date</th>
                <th className="px-5 py-4">Amount</th>
                <th className="px-5 py-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {historyRows.map((order) => (
                <tr key={order.order_id} className="hover:bg-slate-50">
                  <td className="px-5 py-4 text-sm font-semibold text-slate-900">
                    {order.order_number}
                  </td>
                  <td className="max-w-[260px] truncate px-5 py-4 text-sm text-slate-600">
                    {order.items?.map((item) => item.product_name).join(", ") ||
                      "Items"}
                  </td>
                  <td className="px-5 py-4 text-sm text-slate-600">
                    {new Date(order.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-5 py-4 text-sm font-semibold text-slate-900">
                    {formatCurrency(order.summary?.grand_total)}
                  </td>
                  <td className="px-5 py-4">
                    <span
                      className={`rounded-full border px-2.5 py-1 text-xs font-medium ${statusClassFor(order.status)}`}
                    >
                      {order.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {historyRows.length === 0 && (
          <div className="p-10 text-center">
            <p className="text-sm font-medium text-slate-600">
              No order history available yet.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
