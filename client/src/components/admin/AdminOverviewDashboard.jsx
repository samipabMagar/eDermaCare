"use client";

import { useEffect, useState } from "react";
import {
  Users,
  Stethoscope,
  Package,
  CreditCard,
  ArrowUpRight,
  Clock,
  Loader2,
} from "lucide-react";
import { toast } from "react-toastify";
import { adminService } from "@/services/adminService";

const statsConfig = [
  {
    key: "totalUsers",
    title: "Total Users",
    icon: Users,
    color: "bg-[#E8F5F5] text-[#2FA4A9]",
  },
  {
    key: "activeDoctors",
    title: "Active Doctors",
    icon: Stethoscope,
    color: "bg-emerald-500/10 text-emerald-600",
  },
  {
    key: "totalOrders",
    title: "Total Orders",
    icon: Package,
    color: "bg-violet-500/10 text-violet-600",
  },
  {
    key: "revenue",
    title: "Revenue",
    icon: CreditCard,
    color: "bg-amber-500/10 text-amber-600",
  },
];

const orderStatusClass = {
  delivered: "bg-emerald-500/10 text-emerald-600",
  shipped: "bg-primary/10 text-primary",
  packed: "bg-indigo-500/10 text-indigo-600",
  confirmed: "bg-sky-500/10 text-sky-600",
  pending: "bg-amber-500/10 text-amber-600",
  cancelled: "bg-rose-500/10 text-rose-600",
  returned: "bg-slate-500/10 text-slate-600",
};

const formatMoney = (amount) => {
  const value = Number(amount || 0);
  return new Intl.NumberFormat("en-NP", {
    style: "currency",
    currency: "NPR",
    maximumFractionDigits: 0,
  }).format(value);
};

const formatStatus = (value = "") => {
  if (!value) return "Unknown";
  return value.charAt(0).toUpperCase() + value.slice(1);
};

const getDoctorName = (doctor) =>
  doctor?.user?.full_name || doctor?.full_name || "N/A";

const getRelativeTime = (value) => {
  if (!value) return "Recently";

  const date = new Date(value);
  const diffMs = Date.now() - date.getTime();
  const minutes = Math.floor(diffMs / 60000);
  if (minutes < 60) return `${minutes || 1} min ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hour${hours > 1 ? "s" : ""} ago`;
  const days = Math.floor(hours / 24);
  return `${days} day${days > 1 ? "s" : ""} ago`;
};

const AdminOverviewDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeDoctors: 0,
    pendingDoctors: 0,
    totalOrders: 0,
    revenue: 0,
  });
  const [recentOrders, setRecentOrders] = useState([]);
  const [pendingDoctors, setPendingDoctors] = useState([]);
  const [actionLoader, setActionLoader] = useState(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);

        const [products, doctors, pending, ordersData] = await Promise.all([
          adminService.getProducts(),
          adminService.getAllDoctors(),
          adminService.getPendingDoctors(),
          adminService.getAdminOrders({ page: 1, limit: 6 }),
        ]);

        const orders = ordersData.orders || [];
        const totalOrders = Number(
          ordersData?.pagination?.total || orders.length || 0,
        );

        const estimatedUsers = doctors.length + pending.length;
        const revenue = orders.reduce(
          (sum, order) => sum + Number(order.summary?.grand_total || 0),
          0,
        );

        setStats({
          totalUsers: estimatedUsers,
          activeDoctors: doctors.filter((doctor) => doctor.is_available).length,
          pendingDoctors: pending.length,
          totalOrders,
          revenue,
        });

        setRecentOrders(orders.slice(0, 4));
        setPendingDoctors(pending.slice(0, 3));
      } catch (error) {
        toast.error(error.message || "Failed to load dashboard overview");
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const handleApprove = async (doctorId) => {
    try {
      setActionLoader(doctorId);
      await adminService.approveDoctor(doctorId);
      setPendingDoctors((prev) =>
        prev.filter((doctor) => doctor.user_id !== doctorId),
      );
      setStats((prev) => ({
        ...prev,
        pendingDoctors: Math.max(prev.pendingDoctors - 1, 0),
        activeDoctors: prev.activeDoctors + 1,
      }));
      toast.success("Doctor approved successfully");
    } catch (error) {
      toast.error(error.message || "Failed to approve doctor");
    } finally {
      setActionLoader(null);
    }
  };

  const handleReject = async (doctorId) => {
    try {
      setActionLoader(doctorId);
      await adminService.rejectDoctor(doctorId, "");
      setPendingDoctors((prev) =>
        prev.filter((doctor) => doctor.user_id !== doctorId),
      );
      setStats((prev) => ({
        ...prev,
        pendingDoctors: Math.max(prev.pendingDoctors - 1, 0),
      }));
      toast.success("Doctor rejected successfully");
    } catch (error) {
      toast.error(error.message || "Failed to reject doctor");
    } finally {
      setActionLoader(null);
    }
  };

  if (loading) {
    return (
      <div className="flex h-72 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-(--brand-primary)" />
      </div>
    );
  }

  const statValues = {
    totalUsers: stats.totalUsers,
    activeDoctors: stats.activeDoctors,
    totalOrders: stats.totalOrders,
    revenue: formatMoney(stats.revenue),
  };

  return (
    <div className="space-y-7">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        {statsConfig.map((item) => {
          const Icon = item.icon;
          const value = statValues[item.key];

          return (
            <div
              key={item.key}
              className="rounded-xl border border-slate-200 bg-white p-4 shadow-[0_1px_0_0_rgba(15,23,42,0.03)]"
            >
              <div className="mb-4 flex items-center justify-between">
                <div
                  className={`flex h-10 w-10 items-center justify-center rounded-xl ${item.color}`}
                >
                  <Icon className="h-4 w-4" />
                </div>
              </div>
              <p className="text-2xl font-bold leading-10 text-slate-900">
                {value}
              </p>
              <p className="mt-2 text-sm text-slate-500">{item.title}</p>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <div className="mb-5 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-slate-900">
              Recent Orders
            </h2>
            <button className="inline-flex items-center gap-1 text-sm font-semibold text-[#2FA4A9]">
              View all <ArrowUpRight className="h-3.5 w-3.5" />
            </button>
          </div>

          {recentOrders.length === 0 ? (
            <p className="rounded-xl bg-muted/30 p-4 text-sm text-muted-foreground">
              No recent orders found.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-200">
                    <th className="pb-3 text-left text-sm font-medium text-slate-500">
                      Order ID
                    </th>
                    <th className="pb-3 text-left text-sm font-medium text-slate-500">
                      Customer
                    </th>
                    <th className="hidden pb-3 text-left text-sm font-medium text-slate-500 lg:table-cell">
                      Product
                    </th>
                    <th className="pb-3 text-left text-sm font-medium text-slate-500">
                      Amount
                    </th>
                    <th className="pb-3 text-left text-sm font-medium text-slate-500">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {recentOrders.map((order) => {
                    const status = (order.status || "").toLowerCase();
                    const firstItem = order.items?.[0];
                    return (
                      <tr
                        key={order.order_id}
                        className="border-b border-slate-100 last:border-0"
                      >
                        <td className="py-3 text-base font-medium ">
                          {order.order_number || `#${order.order_id}`}
                        </td>
                        <td className="py-3 text-base text-slate-600">
                          User {order.user_id}
                        </td>
                        <td className="hidden py-3 text-base text-slate-600 lg:table-cell">
                          {firstItem?.product_name || "N/A"}
                        </td>
                        <td className="py-3 text-base font-medium ">
                          {formatMoney(order.summary?.grand_total)}
                        </td>
                        <td className="py-3">
                          <span
                            className={`rounded-full px-3 py-1 text-xs font-semibold ${orderStatusClass[status] || "bg-slate-100 text-slate-700"}`}
                          >
                            {formatStatus(status)}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-6">
          <div className="mb-5 flex items-center justify-between">
            <h2 className="text-xl font-semibold text-slate-900">
              Pending Approvals
            </h2>
            <span className="rounded-full bg-amber-500/20 px-2.5 py-1 text-xs font-bold text-amber-600">
              {stats.pendingDoctors}
            </span>
          </div>

          {pendingDoctors.length === 0 ? (
            <p className="rounded-xl bg-muted/30 p-4 text-sm text-muted-foreground">
              No pending doctor requests.
            </p>
          ) : (
            <div className="space-y-3">
              {pendingDoctors.map((doctor) => (
                <div
                  key={doctor.user_id}
                  className="flex items-start gap-3 rounded-2xl bg-[#F7F8FA] p-4"
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#E8F5F5]">
                    <Stethoscope className="h-4 w-4 text-[#2FA4A9]" />
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="text-lg font-semibold text-slate-900">
                      {getDoctorName(doctor)}
                    </p>
                    <p className="text-sm text-slate-600">
                      {doctor.specialization || "Specialization not set"}
                    </p>
                    <p className="mt-1 flex items-center gap-1 text-xs text-slate-500">
                      <Clock className="h-3 w-3" />
                      {getRelativeTime(
                        doctor?.user?.created_at || doctor?.created_at,
                      )}
                    </p>
                  </div>

                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => handleApprove(doctor.user_id)}
                      disabled={actionLoader === doctor.user_id}
                      className="rounded-full bg-emerald-500 px-3 py-1 text-xs font-semibold text-white transition-colors hover:bg-emerald-600 disabled:opacity-50"
                    >
                      {actionLoader === doctor.user_id ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        "Approve"
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleReject(doctor.user_id)}
                      disabled={actionLoader === doctor.user_id}
                      className="rounded-full bg-rose-100 px-3 py-1 text-xs font-semibold text-rose-500 transition-colors hover:bg-rose-200 disabled:opacity-50"
                    >
                      {actionLoader === doctor.user_id ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        "Reject"
                      )}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminOverviewDashboard;
