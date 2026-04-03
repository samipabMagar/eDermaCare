import { Calendar, CreditCard, ShoppingBag, TrendingUp } from "lucide-react";

const statCards = [
  {
    key: "activeOrders",
    label: "Active Orders",
    icon: ShoppingBag,
    color: "bg-teal-50 text-teal-700",
  },
  {
    key: "upcomingAppointments",
    label: "Upcoming Appointments",
    icon: Calendar,
    color: "bg-blue-50 text-blue-700",
  },
  {
    key: "totalSpent",
    label: "Total Spent",
    icon: CreditCard,
    color: "bg-violet-50 text-violet-700",
  },
  {
    key: "treatmentsDone",
    label: "Treatments Done",
    icon: TrendingUp,
    color: "bg-amber-50 text-amber-700",
  },
];

const formatCurrency = (value) => `NPR ${Number(value || 0).toLocaleString()}`;

const DashboardStatsGrid = ({ stats }) => {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {statCards.map((item) => {
        const Icon = item.icon;
        const value =
          item.key === "totalSpent"
            ? formatCurrency(stats.totalSpent)
            : stats[item.key];

        return (
          <article
            key={item.key}
            className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
          >
            <div className={`mb-4 inline-flex rounded-xl p-2.5 ${item.color}`}>
              <Icon className="h-5 w-5" aria-hidden="true" />
            </div>
            <p className="text-sm font-medium text-slate-600">{item.label}</p>
            <p className="mt-1 text-2xl font-bold text-slate-900">{value}</p>
          </article>
        );
      })}
    </div>
  );
};

export default DashboardStatsGrid;
