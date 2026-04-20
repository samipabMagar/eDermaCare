"use client";

import { useEffect, useMemo, useState } from "react";
import { Search, ShoppingBag } from "lucide-react";
import { toast } from "react-toastify";
import { orderService } from "@/services/orderService";
import OrderDetailsModal from "@/components/ui/OrderDetailsModal";
import ConfirmModal from "@/components/ui/ConfirmModal";

const ITEMS_PER_PAGE = 5;

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
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [page, setPage] = useState(1);
  const [orderToCancel, setOrderToCancel] = useState(null);
  const [isCancelling, setIsCancelling] = useState(false);

  useEffect(() => {
    setPage(1);
  }, [activeTab, search]);

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

  const totalPages = Math.ceil(filteredOrders.length / ITEMS_PER_PAGE);
  const paginatedOrders = filteredOrders.slice(
    (page - 1) * ITEMS_PER_PAGE,
    page * ITEMS_PER_PAGE
  );

  const handleCancelOrder = async () => {
    if (!orderToCancel) return;
    try {
      setIsCancelling(true);
      await orderService.cancelOrder(orderToCancel.order_id, {
        reason: "Cancelled by user",
      });
      toast.success("Order cancelled successfully");
      setOrders((prev) =>
        prev.map((o) =>
          o.order_id === orderToCancel.order_id
            ? { ...o, status: "cancelled" }
            : o
        )
      );
    } catch (error) {
      toast.error(error.message || "Failed to cancel order");
    } finally {
      setIsCancelling(false);
      setOrderToCancel(null);
    }
  };

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
        {paginatedOrders.map((order) => {
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
                    <div className="mt-2">
                       <button
                         onClick={() => setSelectedOrder(order)}
                         className="text-sm rounded-lg px-4 py-2 font-medium text-[#0F9EA5] bg-[#0F9EA5]/10 hover:bg-[#0F9EA5] hover:text-white transition"
                       >
                         View Details
                       </button>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col items-end gap-2 mt-4 sm:mt-0">
                  <p className="text-lg font-bold text-slate-900">
                    {formatCurrency(order.summary?.grand_total)}
                  </p>
                  {normalizedStatus === "pending" && (
                    <button
                      onClick={() => setOrderToCancel(order)}
                      className="text-xs font-semibold text-rose-500 hover:text-rose-600 transition"
                    >
                      Cancel Order
                    </button>
                  )}
                </div>
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

      {totalPages > 1 && (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 shadow-sm">
          <p>
            Page {page} of {totalPages} • {filteredOrders.length} total orders
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="rounded-lg border border-slate-300 px-3 py-1.5 font-medium transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Previous
            </button>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="rounded-lg border border-slate-300 px-3 py-1.5 font-medium transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      )}

      <OrderDetailsModal
        isOpen={!!selectedOrder}
        onClose={() => setSelectedOrder(null)}
        order={selectedOrder}
      />

      <ConfirmModal
        isOpen={!!orderToCancel}
        title="Cancel Order"
        message={`Are you sure you want to cancel order ${orderToCancel?.order_number}? This action cannot be undone.`}
        confirmText="Cancel Order"
        isLoading={isCancelling}
        onConfirm={handleCancelOrder}
        onCancel={() => setOrderToCancel(null)}
      />
    </div>
  );
}
