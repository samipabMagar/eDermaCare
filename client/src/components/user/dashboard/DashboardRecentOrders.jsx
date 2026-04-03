import { ShoppingBag } from "lucide-react";

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
                    <p className="truncate text-sm font-medium text-slate-900">
                      {firstItemName}
                    </p>
                    <p className="text-xs text-slate-500">
                      {order.order_number} · {formatDate(order.created_at)}
                    </p>
                  </div>
                </div>

                <div className="flex shrink-0 items-center gap-3">
                  <span
                    className={`rounded-full border px-2.5 py-1 text-xs font-medium ${badgeClass}`}
                  >
                    {order.status}
                  </span>
                  <span className="hidden text-sm font-semibold text-slate-900 sm:block">
                    {formatCurrency(order.summary?.grand_total)}
                  </span>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
};

export default DashboardRecentOrders;
