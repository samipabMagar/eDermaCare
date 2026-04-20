"use client";

import { useEffect, useMemo, useState } from "react";
import { Loader2, Save, Search, ShoppingBag } from "lucide-react";
import { toast } from "react-toastify";
import { adminService } from "@/services/adminService";
import OrderDetailsModal from "@/components/ui/OrderDetailsModal";

const PAGE_SIZE = 10;

const ORDER_STATUSES = [
  "pending",
  "confirmed",
  "packed",
  "shipped",
  "delivered",
  "cancelled",
  "returned",
];

const PAYMENT_STATUSES = [
  "unpaid",
  "pending",
  "paid",
  "failed",
  "refunded",
  "partially_refunded",
];

const statusClassMap = {
  pending: "bg-amber-100 text-amber-700",
  confirmed: "bg-sky-100 text-sky-700",
  packed: "bg-indigo-100 text-indigo-700",
  shipped: "bg-blue-100 text-blue-700",
  delivered: "bg-emerald-100 text-emerald-700",
  cancelled: "bg-rose-100 text-rose-700",
  returned: "bg-slate-100 text-slate-700",
};

const paymentStatusClassMap = {
  unpaid: "bg-rose-100 text-rose-700",
  pending: "bg-amber-100 text-amber-700",
  paid: "bg-emerald-100 text-emerald-700",
  failed: "bg-rose-100 text-rose-700",
  refunded: "bg-slate-100 text-slate-700",
  partially_refunded: "bg-slate-100 text-slate-700",
};

const formatCurrency = (value) => {
  return new Intl.NumberFormat("en-NP", {
    style: "currency",
    currency: "NPR",
    maximumFractionDigits: 2,
  }).format(Number(value || 0));
};

const formatDate = (value) => {
  if (!value) return "N/A";
  return new Intl.DateTimeFormat("en-NP", {
    year: "numeric",
    month: "short",
    day: "2-digit",
  }).format(new Date(value));
};

const formatLabel = (value = "") => {
  if (!value) return "N/A";
  return value
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
};

const OrderManagementTable = () => {
  const [orders, setOrders] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [paymentStatusFilter, setPaymentStatusFilter] = useState("");
  const [page, setPage] = useState(1);
  const [statusDrafts, setStatusDrafts] = useState({});
  const [savingOrderId, setSavingOrderId] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      setSearch(searchInput.trim());
      setPage(1);
    }, 350);

    return () => clearTimeout(timer);
  }, [searchInput]);

  const fetchOrders = async () => {
    try {
      setLoading(true);

      const response = await adminService.getAdminOrders({
        page,
        limit: PAGE_SIZE,
        status: statusFilter,
        payment_status: paymentStatusFilter,
        search,
      });

      setOrders(response.orders || []);
      setPagination(response.pagination || null);
      setStatusDrafts({});
    } catch (error) {
      toast.error(error.message || "Failed to load orders");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [page, statusFilter, paymentStatusFilter, search]);

  const summary = useMemo(() => {
    const total = pagination?.total || orders.length;
    const pending = orders.filter((item) => item.status === "pending").length;
    const paid = orders.filter((item) => item.payment_status === "paid").length;

    return { total, pending, paid };
  }, [orders, pagination]);

  const handleStatusDraftChange = (orderId, nextStatus) => {
    setStatusDrafts((prev) => ({
      ...prev,
      [orderId]: nextStatus,
    }));
  };

  const handleUpdateStatus = async (order) => {
    const nextStatus = statusDrafts[order.order_id];
    if (!nextStatus || nextStatus === order.status) {
      return;
    }

    try {
      setSavingOrderId(order.order_id);
      const updatedOrder = await adminService.updateAdminOrderStatus(
        order.order_id,
        nextStatus,
      );

      setOrders((prev) =>
        prev.map((item) =>
          item.order_id === order.order_id
            ? { ...item, ...updatedOrder }
            : item,
        ),
      );

      setStatusDrafts((prev) => {
        const nextDrafts = { ...prev };
        delete nextDrafts[order.order_id];
        return nextDrafts;
      });

      toast.success("Order status updated");
    } catch (error) {
      toast.error(error.message || "Failed to update order status");
    } finally {
      setSavingOrderId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex h-72 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-(--brand-primary)" />
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-4">
      <div className="mb-4 grid grid-cols-1 gap-3 rounded-xl border border-slate-200 bg-linear-to-r from-slate-50 to-cyan-50/50 px-4 py-4 sm:grid-cols-3">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
            Total Orders
          </p>
          <p className="mt-1 text-2xl font-bold text-slate-900">
            {summary.total}
          </p>
        </div>
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
            Pending On Page
          </p>
          <p className="mt-1 text-2xl font-bold text-amber-600">
            {summary.pending}
          </p>
        </div>
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
            Paid On Page
          </p>
          <p className="mt-1 text-2xl font-bold text-emerald-600">
            {summary.paid}
          </p>
        </div>
      </div>

      <div className="mb-5 flex flex-wrap gap-3">
        <div className="min-w-64 flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-5 w-5 text-slate-400" />
            <input
              type="text"
              placeholder="Search by order number or phone..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="w-full rounded-lg border border-slate-300 py-2 pl-10 pr-4 text-sm text-slate-800 outline-none focus:border-(--brand-primary) focus:ring-2 focus:ring-(--brand-primary-soft)"
            />
          </div>
        </div>

        <select
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value);
            setPage(1);
          }}
          className="rounded-lg border border-slate-300 px-4 py-2 text-sm text-slate-700 outline-none focus:border-(--brand-primary) focus:ring-2 focus:ring-(--brand-primary-soft)"
        >
          <option value="">All Order Status</option>
          {ORDER_STATUSES.map((status) => (
            <option key={status} value={status}>
              {formatLabel(status)}
            </option>
          ))}
        </select>

        <select
          value={paymentStatusFilter}
          onChange={(e) => {
            setPaymentStatusFilter(e.target.value);
            setPage(1);
          }}
          className="rounded-lg border border-slate-300 px-4 py-2 text-sm text-slate-700 outline-none focus:border-(--brand-primary) focus:ring-2 focus:ring-(--brand-primary-soft)"
        >
          <option value="">All Payment Status</option>
          {PAYMENT_STATUSES.map((status) => (
            <option key={status} value={status}>
              {formatLabel(status)}
            </option>
          ))}
        </select>
      </div>

      <div className="overflow-x-auto rounded-xl border border-slate-200">
        <table className="w-full text-left text-sm">
          <thead className="sticky top-0 bg-slate-100/90 backdrop-blur">
            <tr className="border-b border-slate-200">
              <th className="px-4 py-3 font-semibold text-slate-700">Order</th>
              <th className="px-4 py-3 font-semibold text-slate-700">
                Customer
              </th>
              <th className="px-4 py-3 font-semibold text-slate-700">Items</th>
              <th className="px-4 py-3 font-semibold text-slate-700">
                Payment
              </th>
              <th className="px-4 py-3 font-semibold text-slate-700">Total</th>
              <th className="px-4 py-3 font-semibold text-slate-700">Placed</th>
              <th className="px-4 py-3 font-semibold text-slate-700">
                Order Status
              </th>
              <th className="px-4 py-3 font-semibold text-slate-700">Action</th>
            </tr>
          </thead>

          <tbody>
            {orders.length === 0 ? (
              <tr>
                <td
                  colSpan="8"
                  className="px-6 py-8 text-center text-slate-500"
                >
                  No orders found for selected filters.
                </td>
              </tr>
            ) : (
              orders.map((order) => {
                const orderStatusClass =
                  statusClassMap[order.status] || "bg-slate-100 text-slate-700";
                const payStatusClass =
                  paymentStatusClassMap[order.payment_status] ||
                  "bg-slate-100 text-slate-700";
                const draftStatus =
                  statusDrafts[order.order_id] || order.status;
                const isDirty = draftStatus !== order.status;

                return (
                  <tr
                    key={order.order_id}
                    className="border-b border-slate-200 last:border-b-0 hover:bg-slate-50"
                  >
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-slate-500">
                          <ShoppingBag className="h-4 w-4" />
                        </div>
                        <div>
                          <p className="font-semibold text-slate-900">
                            {order.order_number || `#${order.order_id}`}
                          </p>
                          <p className="text-xs text-slate-500">
                            ID: {order.order_id}
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="px-4 py-4 text-slate-700">
                      <div className="font-medium text-slate-900">
                        {order.user_name || `User #${order.user_id}`}
                      </div>
                      <div className="text-xs text-slate-500">
                        ID: {order.user_id}
                      </div>
                    </td>

                    <td className="px-4 py-4 text-slate-700 max-w-[200px]">
                      <button
                        onClick={() => setSelectedOrder(order)}
                        className="text-sm rounded-lg px-3 py-1.5 font-medium text-(--brand-primary) bg-(--brand-primary-soft) hover:bg-(--brand-primary) hover:text-white transition"
                      >
                        View Details
                      </button>
                    </td>

                    <td className="px-4 py-4">
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-semibold ${payStatusClass}`}
                      >
                        {formatLabel(order.payment_status)}
                      </span>
                    </td>

                    <td className="px-4 py-4 font-medium text-slate-900">
                      {formatCurrency(order.summary?.grand_total)}
                    </td>

                    <td className="px-4 py-4 text-slate-700">
                      {formatDate(order.created_at)}
                    </td>

                    <td className="px-4 py-4">
                      <div className="space-y-2">
                        <span
                          className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${orderStatusClass}`}
                        >
                          {formatLabel(order.status)}
                        </span>
                        <select
                          value={draftStatus}
                          onChange={(e) =>
                            handleStatusDraftChange(
                              order.order_id,
                              e.target.value,
                            )
                          }
                          className="block w-full rounded-lg border border-slate-300 px-2 py-1.5 text-xs text-slate-700 outline-none focus:border-(--brand-primary) focus:ring-2 focus:ring-(--brand-primary-soft)"
                        >
                          {ORDER_STATUSES.map((status) => (
                            <option key={status} value={status}>
                              {formatLabel(status)}
                            </option>
                          ))}
                        </select>
                      </div>
                    </td>

                    <td className="px-4 py-4">
                      <button
                        type="button"
                        onClick={() => handleUpdateStatus(order)}
                        disabled={!isDirty || savingOrderId === order.order_id}
                        className="inline-flex items-center gap-1 rounded-lg bg-(--brand-primary) px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-(--brand-primary-hover) disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {savingOrderId === order.order_id ? (
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        ) : (
                          <Save className="h-3.5 w-3.5" />
                        )}
                        Save
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {pagination ? (
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700">
          <p>
            Page {pagination.page} of {pagination.totalPages} •{" "}
            {pagination.total} total records
          </p>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
              disabled={pagination.page <= 1}
              className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-medium transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-50"
            >
              Previous
            </button>
            <button
              type="button"
              onClick={() => setPage((prev) => prev + 1)}
              disabled={pagination.page >= pagination.totalPages}
              className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-medium transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      ) : null}

      <OrderDetailsModal
        isOpen={!!selectedOrder}
        onClose={() => setSelectedOrder(null)}
        order={selectedOrder}
      />
    </div>
  );
};

export default OrderManagementTable;
