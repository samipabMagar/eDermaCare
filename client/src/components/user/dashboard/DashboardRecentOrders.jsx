import { useState } from "react";
import { ShoppingBag, ChevronRight } from "lucide-react";
import OrderDetailsModal from "@/components/ui/OrderDetailsModal";

const statusClasses = {
  delivered: "border-green-200 bg-green-50 text-green-700",
  shipped: "border-blue-200 bg-blue-50 text-blue-700",
  confirmed: "border-indigo-200 bg-indigo-50 text-indigo-700",
  packed: "border-purple-200 bg-purple-50 text-purple-700",
  pending: "border-amber-200 bg-amber-50 text-amber-700",
  cancelled: "border-rose-200 bg-rose-50 text-rose-700",
  returned: "border-slate-200 bg-slate-50 text-slate-700",
};

const formatDate = (value) => {
  if (!value) return "-";
  return new Date(value).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

const formatCurrency = (value) => `NPR ${Number(value || 0).toLocaleString()}`;

const DashboardRecentOrders = ({ orders }) => {
  const [selectedOrder, setSelectedOrder] = useState(null);

  return (
    <section className="rounded-2xl border border-slate-200 bg-white shadow-sm lg:col-span-2">
      <header className="flex items-center justify-between border-b border-slate-200 p-5">
        <h2 className="text-base font-semibold text-slate-900">
          Recent Orders
        </h2>
        <span className="text-xs text-slate-500">
          Last {orders.length} orders
        </span>
      </header>

      {orders.length === 0 ? (
        <p className="p-5 text-sm text-slate-500">No orders found yet.</p>
      ) : (
        <div className="divide-y divide-slate-200">
          {orders.map((order) => {
            const statusKey = String(order.status || "").toLowerCase();
            const badgeClass =
              statusClasses[statusKey] || statusClasses.returned;
            const firstItemName =
              order.items?.[0]?.product_name || "Order item";

            return (
              <article
                key={order.order_id}
                className="flex items-center justify-between gap-3 p-4 transition-colors hover:bg-slate-50"
              >
                <div className="flex min-w-0 items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100">
                    <ShoppingBag className="h-4 w-4 text-slate-500" />
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-slate-900">
                       {order.order_number}
                    </p>
                    <p className="text-xs text-slate-500 mt-0.5">
                       {formatDate(order.created_at)} · {order.summary?.item_count || 0} items
                    </p>
                  </div>
                </div>

                <div className="flex shrink-0 items-center justify-end gap-3 min-w-[120px]">
                  <div className="flex flex-col items-end gap-1">
                     <span className="hidden text-sm font-semibold text-slate-900 sm:block">
                       {formatCurrency(order.summary?.grand_total)}
                     </span>
                     <span
                       className={`rounded-full border px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider ${badgeClass}`}
                     >
                       {order.status}
                     </span>
                  </div>
                  <button
                    onClick={() => setSelectedOrder(order)}
                    className="p-1.5 text-slate-400 hover:text-(--brand-primary) hover:bg-(--brand-primary-soft) rounded-lg transition"
                    title="View Details"
                  >
                     <ChevronRight className="h-5 w-5" />
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      )}
      
      <OrderDetailsModal 
        isOpen={!!selectedOrder}
        onClose={() => setSelectedOrder(null)}
        order={selectedOrder}
      />
    </section>
  );
};

export default DashboardRecentOrders;
