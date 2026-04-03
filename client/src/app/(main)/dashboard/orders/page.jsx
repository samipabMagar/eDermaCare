"use client";

import { useEffect, useMemo, useState } from "react";
import { Search, ShoppingBag } from "lucide-react";
import { toast } from "react-toastify";
import { orderService } from "@/services/orderService";

const tabs = [
  "All",
  "Pending",
  "Confirmed",
  "Packed",
  "Shipped",
  "Delivered",
  "Cancelled",
];

const statusClasses = {
  pending: "bg-amber-50 text-amber-700 border-amber-200",
  confirmed: "bg-indigo-50 text-indigo-700 border-indigo-200",
  packed: "bg-purple-50 text-purple-700 border-purple-200",
  shipped: "bg-blue-50 text-blue-700 border-blue-200",
  delivered: "bg-green-50 text-green-700 border-green-200",
  cancelled: "bg-rose-50 text-rose-700 border-rose-200",
};

const formatCurrency = (value) => `NPR ${Number(value || 0).toLocaleString()}`;

export default function DashboardOrdersPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [orders, setOrders] = useState([]);
  const [activeTab, setActiveTab] = useState("All");
  const [search, setSearch] = useState("");

  useEffect(() => {
    const loadOrders = async () => {
      try {
        setIsLoading(true);
        const data = await orderService.getMyOrders();
        setOrders(Array.isArray(data) ? data : []);
      } catch (error) {
        toast.error(error.message || "Failed to load orders");
      } finally {
        setIsLoading(false);
      }
    };

    loadOrders();
  }, []);

  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      const normalizedStatus = String(order.status || "").toLowerCase();
      const statusMatch =
        activeTab === "All" || normalizedStatus === activeTab.toLowerCase();

      const q = search.trim().toLowerCase();
      const firstItemName = String(
        order.items?.[0]?.product_name || "",
      ).toLowerCase();
      const orderNumber = String(order.order_number || "").toLowerCase();
      const searchMatch =
        !q || orderNumber.includes(q) || firstItemName.includes(q);

      return statusMatch && searchMatch;
    });
  }, [activeTab, orders, search]);

  if (isLoading) {
    return <p className="p-6 text-sm text-slate-500">Loading orders...</p>;
  }

  return (
    <div className="space-y-6 px-4 py-4 sm:px-6">
      <div>
        <h1 className="text-xl font-bold text-slate-900">My Orders</h1>
        <p className="mt-1 text-sm text-slate-500">
          Track and manage your orders.
        </p>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap gap-2">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`rounded-xl px-4 py-2 text-sm font-medium transition ${
                activeTab === tab
                  ? "bg-[#0F9EA5] text-white"
                  : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search orders..."
            className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-sm text-slate-700 outline-none focus:border-[#0F9EA5]"
          />
        </div>
      </div>

      <div className="space-y-3">
        {filteredOrders.map((order) => {
          const normalizedStatus = String(order.status || "").toLowerCase();
          const badgeClass =
            statusClasses[normalizedStatus] || statusClasses.pending;

          return (
            <article
              key={order.order_id}
              className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
            >
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-start gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100">
                    <ShoppingBag className="h-5 w-5 text-slate-500" />
                  </div>
                  <div>
                    <div className="mb-1 flex flex-wrap items-center gap-2">
                      <p className="text-sm font-semibold text-slate-900">
                        {order.order_number}
                      </p>
                      <span
                        className={`rounded-full border px-2.5 py-0.5 text-xs font-medium ${badgeClass}`}
                      >
                        {order.status}
                      </span>
                    </div>
                    <p className="text-sm text-slate-600">
                      {order.items
                        ?.map((item) => item.product_name)
                        .slice(0, 2)
                        .join(", ") || "Items"}
                    </p>
                    <p className="mt-1 text-xs text-slate-500">
                      {new Date(order.created_at).toLocaleDateString()} ·{" "}
                      {order.summary?.item_count || 0} item(s)
                    </p>
                  </div>
                </div>

                <p className="text-lg font-bold text-slate-900">
                  {formatCurrency(order.summary?.grand_total)}
                </p>
              </div>
            </article>
          );
        })}

        {filteredOrders.length === 0 && (
          <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center">
            <p className="text-sm font-medium text-slate-600">
              No orders found.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
