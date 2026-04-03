"use client";

import { useEffect, useMemo, useState } from "react";
import { ArrowDownLeft, ArrowUpRight, CreditCard } from "lucide-react";
import { toast } from "react-toastify";
import { orderService } from "@/services/orderService";
import { paymentService } from "@/services/paymentService";

const formatCurrency = (value) => `NPR ${Number(value || 0).toLocaleString()}`;

export default function DashboardPaymentsPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [rows, setRows] = useState([]);

  useEffect(() => {
    const loadPayments = async () => {
      try {
        setIsLoading(true);

        const orders = await orderService.getMyOrders();
        const orderList = Array.isArray(orders) ? orders : [];

        const historyResponses = await Promise.all(
          orderList.map((order) =>
            paymentService
              .getOrderPaymentHistory(order.order_id)
              .catch(() => null),
          ),
        );

        const paymentRows = [];

        historyResponses.forEach((history, index) => {
          const order = orderList[index];

          if (!history?.payments?.length) {
            paymentRows.push({
              id: `order-${order.order_id}`,
              orderNumber: order.order_number,
              date: order.created_at,
              amount: Number(order.summary?.grand_total || 0),
              method: order.payment_method || "unknown",
              status: order.payment_status || "unpaid",
              type: "Purchase",
            });
            return;
          }

          history.payments.forEach((payment) => {
            paymentRows.push({
              id: `${order.order_id}-${payment.payment_id}`,
              orderNumber: order.order_number,
              date: payment.created_at || order.created_at,
              amount: Number(payment.amount || 0),
              method: payment.gateway || order.payment_method || "unknown",
              status: payment.status || order.payment_status || "pending",
              type:
                String(payment.status || "").toLowerCase() === "refunded"
                  ? "Refund"
                  : "Purchase",
            });
          });
        });

        paymentRows.sort(
          (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
        );
        setRows(paymentRows);
      } catch (error) {
        toast.error(error.message || "Failed to load payment history");
      } finally {
        setIsLoading(false);
      }
    };

    loadPayments();
  }, []);

  const totalSpent = useMemo(() => {
    return rows.reduce((sum, row) => {
      const isCompleted = ["paid", "completed"].includes(
        String(row.status).toLowerCase(),
      );
      const isPurchase = row.type === "Purchase";
      return isCompleted && isPurchase ? sum + Number(row.amount || 0) : sum;
    }, 0);
  }, [rows]);

  if (isLoading) {
    return (
      <p className="p-6 text-sm text-slate-500">Loading payment history...</p>
    );
  }

  return (
    <div className="space-y-6 px-4 py-4 sm:px-6">
      <div>
        <h1 className="text-xl font-bold text-slate-900">Payment History</h1>
        <p className="mt-1 text-sm text-slate-500">
          Track all your payment transactions.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">Total Spent</p>
          <p className="mt-1 text-2xl font-bold text-slate-900">
            {formatCurrency(totalSpent)}
          </p>
        </article>
        <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">Transactions</p>
          <p className="mt-1 text-2xl font-bold text-slate-900">
            {rows.length}
          </p>
        </article>
        <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">Pending</p>
          <p className="mt-1 text-2xl font-bold text-slate-900">
            {
              rows.filter((row) =>
                ["pending", "initiated"].includes(
                  String(row.status).toLowerCase(),
                ),
              ).length
            }
          </p>
        </article>
      </div>

      <div className="space-y-3">
        {rows.map((row) => {
          const isRefund = row.type === "Refund";
          const isCompleted = ["completed", "paid"].includes(
            String(row.status).toLowerCase(),
          );

          return (
            <article
              key={row.id}
              className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
            >
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div
                    className={`flex h-10 w-10 items-center justify-center rounded-xl ${
                      isRefund ? "bg-green-50" : "bg-[#0F9EA5]/10"
                    }`}
                  >
                    {isRefund ? (
                      <ArrowDownLeft className="h-5 w-5 text-green-600" />
                    ) : (
                      <ArrowUpRight className="h-5 w-5 text-[#0F9EA5]" />
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-900">
                      Order {row.orderNumber}
                    </p>
                    <p className="mt-1 text-xs text-slate-500">
                      {new Date(row.date).toLocaleDateString()} · via{" "}
                      {String(row.method).toUpperCase()}
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <p
                    className={`text-lg font-bold ${isRefund ? "text-green-600" : "text-slate-900"}`}
                  >
                    {isRefund ? "+" : "-"}
                    {formatCurrency(row.amount)}
                  </p>
                  <span
                    className={`text-xs font-medium ${isCompleted ? "text-green-600" : "text-amber-600"}`}
                  >
                    {row.status}
                  </span>
                </div>
              </div>
            </article>
          );
        })}

        {rows.length === 0 && (
          <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center">
            <CreditCard className="mx-auto mb-2 h-8 w-8 text-slate-300" />
            <p className="text-sm font-medium text-slate-600">
              No payment records yet.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
