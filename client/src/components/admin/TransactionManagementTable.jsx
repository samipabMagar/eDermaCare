"use client";

import { useEffect, useMemo, useState } from "react";
import { Loader2, Search } from "lucide-react";
import { adminService } from "@/services/adminService";

const PAGE_SIZE = 10;

const PAYMENT_STATUSES = ["unpaid", "pending", "paid", "failed", "refunded"];

const PAYMENT_GATEWAYS = ["khalti", "esewa", "cash_on_delivery"];

const paymentStatusClassMap = {
  unpaid: "bg-rose-100 text-rose-700",
  pending: "bg-amber-100 text-amber-700",
  paid: "bg-emerald-100 text-emerald-700",
  failed: "bg-rose-100 text-rose-700",
  refunded: "bg-slate-100 text-slate-700",
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
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
};

const formatLabel = (value = "") => {
  if (!value) return "N/A";
  return value
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
};

const TransactionManagementTable = () => {
  const [orders, setOrders] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [paymentStatusFilter, setPaymentStatusFilter] = useState("");
  const [paymentGatewayFilter, setPaymentGatewayFilter] = useState("");
  const [page, setPage] = useState(1);
  const [transactionStats, setTransactionStats] = useState(null);

  useEffect(() => {
    const loadStats = async () => {
      try {
        const stats = await adminService.getTransactionStats();
        setTransactionStats(stats);
      } catch {
        setTransactionStats(null);
      }
    };

    loadStats();
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      setSearch(searchInput.trim());
      setPage(1);
    }, 350);

    return () => clearTimeout(timer);
  }, [searchInput]);

  const fetchTransactions = async () => {
    try {
      setLoading(true);

      const response = await adminService.getAdminTransactions({
        page,
        limit: PAGE_SIZE,
        search,
        paymentStatus: paymentStatusFilter,
      });

      setOrders(Array.isArray(response?.data) ? response.data : []);
      setPagination(response?.pagination || null);
    } catch {
      setOrders([]);
      setPagination(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, [page, search, paymentStatusFilter]);

  const filteredTransactions = useMemo(() => {
    let filtered = orders;

    if (paymentGatewayFilter) {
      filtered = filtered.filter(
        (order) => order.payment_gateway === paymentGatewayFilter,
      );
    }

    return filtered;
  }, [orders, paymentGatewayFilter]);

  const stats = useMemo(() => {
    if (!transactionStats) {
      return {
        total: 0,
        paid: 0,
        pending: 0,
        transactions: 0,
      };
    }

    return {
      transactions: transactionStats.total_transactions || 0,
      paid: transactionStats.paid_amount || 0,
      pending: transactionStats.pending_amount || 0,
      total: transactionStats.total_amount || 0,
    };
  }, [transactionStats]);

  const handlePreviousPage = () => {
    if (page > 1) {
      setPage(page - 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handleNextPage = () => {
    if (pagination?.hasMore) {
      setPage(page + 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  return (
    <div className="space-y-4">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-4 p-4 md:grid-cols-4">
        <div className="rounded-xl border border-slate-200 bg-gradient-to-br from-slate-50 to-white p-4">
          <p className="text-xs font-medium text-slate-600">
            Total Transactions
          </p>
          <p className="mt-2 text-2xl font-bold text-slate-900">
            {stats.transactions}
          </p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-gradient-to-br from-emerald-50 to-white p-4">
          <p className="text-xs font-medium text-emerald-700">Paid Amount</p>
          <p className="mt-2 text-lg font-bold text-emerald-700">
            {formatCurrency(stats.paid)}
          </p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-gradient-to-br from-amber-50 to-white p-4">
          <p className="text-xs font-medium text-amber-700">Pending Amount</p>
          <p className="mt-2 text-lg font-bold text-amber-700">
            {formatCurrency(stats.pending)}
          </p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-gradient-to-br from-blue-50 to-white p-4">
          <p className="text-xs font-medium text-blue-700">Total Amount</p>
          <p className="mt-2 text-lg font-bold text-blue-700">
            {formatCurrency(stats.total)}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="space-y-3 border-t border-slate-200 px-4 py-4">
        <div className="flex flex-col gap-3 md:flex-row">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search by order number..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="w-full rounded-lg border border-slate-200 bg-white py-2 pl-10 pr-3 text-sm placeholder-slate-400 transition focus:border-[#2FA4A9] focus:outline-none focus:ring-1 focus:ring-[#2FA4A9]"
              />
            </div>
          </div>

          <select
            value={paymentStatusFilter}
            onChange={(e) => {
              setPaymentStatusFilter(e.target.value);
              setPage(1);
            }}
            className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm transition focus:border-[#2FA4A9] focus:outline-none focus:ring-1 focus:ring-[#2FA4A9]"
          >
            <option value="">All Payment Status</option>
            {PAYMENT_STATUSES.map((status) => (
              <option key={status} value={status}>
                {formatLabel(status)}
              </option>
            ))}
          </select>

          <select
            value={paymentGatewayFilter}
            onChange={(e) => setPaymentGatewayFilter(e.target.value)}
            className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm transition focus:border-[#2FA4A9] focus:outline-none focus:ring-1 focus:ring-[#2FA4A9]"
          >
            <option value="">All Gateways</option>
            {PAYMENT_GATEWAYS.map((gateway) => (
              <option key={gateway} value={gateway}>
                {formatLabel(gateway)}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Table or Loading/Empty State */}
      <div className="overflow-x-auto">
        {loading ? (
          <div className="flex items-center justify-center px-4 py-8">
            <Loader2 className="h-5 w-5 animate-spin text-slate-400" />
            <span className="ml-2 text-sm text-slate-500">
              Loading transactions...
            </span>
          </div>
        ) : !filteredTransactions.length ? (
          <div className="px-4 py-8 text-center">
            <p className="text-sm text-slate-500">
              No transactions found matching your filters.
            </p>
          </div>
        ) : (
          <table className="w-full border-collapse">
            <thead className="border-b border-slate-200 bg-slate-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600">
                  Order #
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600">
                  Customer
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600">
                  Amount
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600">
                  Gateway
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600">
                  Status
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600">
                  Date
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredTransactions.map((order) => (
                <tr
                  key={order.order_id}
                  className="border-b border-slate-100 transition hover:bg-slate-50"
                >
                  <td className="px-4 py-3 text-sm font-medium text-slate-900">
                    {order.order_number}
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-600">
                    {order.user?.full_name || "Unknown"}
                  </td>
                  <td className="px-4 py-3 text-sm font-semibold text-slate-900">
                    {formatCurrency(order.total_amount)}
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-600">
                    {formatLabel(order.payment_gateway || "N/A")}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-block rounded-full px-2.5 py-1 text-xs font-medium ${
                        paymentStatusClassMap[order.payment_status] ||
                        "bg-slate-100 text-slate-700"
                      }`}
                    >
                      {formatLabel(order.payment_status || "Unknown")}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-500">
                    {formatDate(order.created_at)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination */}
      {pagination && (
        <div className="flex items-center justify-between border-t border-slate-200 px-4 py-3">
          <p className="text-xs text-slate-600">
            Page <span className="font-semibold">{page}</span> of{" "}
            <span className="font-semibold">{pagination.totalPages || 1}</span>
          </p>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={handlePreviousPage}
              disabled={page === 1}
              className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-medium text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Previous
            </button>
            <button
              type="button"
              onClick={handleNextPage}
              disabled={!pagination.hasMore}
              className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-medium text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default TransactionManagementTable;
