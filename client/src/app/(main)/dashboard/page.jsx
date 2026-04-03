"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { toast } from "react-toastify";
import { PRODUCT_ROUTE, DOCTORS_ROUTE } from "@/constants/routes";
import { authService } from "@/services/authService";
import { orderService } from "@/services/orderService";
import { appointmentService } from "@/services/appointmentService";
import DashboardStatsGrid from "@/components/user/dashboard/DashboardStatsGrid";
import DashboardRecentOrders from "@/components/user/dashboard/DashboardRecentOrders";
import DashboardUpcomingAppointments from "@/components/user/dashboard/DashboardUpcomingAppointments";

const activeOrderStatuses = new Set([
  "pending",
  "confirmed",
  "packed",
  "shipped",
]);

export default function UserDashboardPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [orders, setOrders] = useState([]);
  const [appointments, setAppointments] = useState([]);

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        setIsLoading(true);

        const currentUser = await authService.getCurrentUser();
        setUser(currentUser || null);

        const [myOrders, myAppointments] = await Promise.all([
          orderService.getMyOrders(),
          appointmentService.getMyAppointments(),
        ]);

        setOrders(Array.isArray(myOrders) ? myOrders : []);
        setAppointments(Array.isArray(myAppointments) ? myAppointments : []);
      } catch (error) {
        toast.error(error.message || "Failed to load dashboard");
      } finally {
        setIsLoading(false);
      }
    };

    loadDashboard();
  }, []);

  const upcomingAppointments = useMemo(() => {
    return appointments
      .filter((appointment) => {
        const status = String(appointment.status || "").toLowerCase();
        return ["pending", "confirmed"].includes(status);
      })
      .sort(
        (a, b) =>
          new Date(a.scheduled_at).getTime() -
          new Date(b.scheduled_at).getTime(),
      );
  }, [appointments]);

  const stats = useMemo(() => {
    const activeOrders = orders.filter((order) =>
      activeOrderStatuses.has(String(order.status || "").toLowerCase()),
    ).length;

    const totalSpent = orders.reduce((sum, order) => {
      const isPaid =
        String(order.payment_status || "").toLowerCase() === "paid";
      const amount = Number(order.summary?.grand_total || 0);
      return isPaid ? sum + amount : sum;
    }, 0);

    const treatmentsDone = appointments.filter(
      (appointment) =>
        String(appointment.status || "").toLowerCase() === "completed",
    ).length;

    return {
      activeOrders,
      upcomingAppointments: upcomingAppointments.length,
      totalSpent,
      treatmentsDone,
    };
  }, [appointments, orders, upcomingAppointments.length]);

  const recentOrders = useMemo(() => orders.slice(0, 3), [orders]);
  const nextAppointments = useMemo(
    () => upcomingAppointments.slice(0, 3),
    [upcomingAppointments],
  );

  if (isLoading) {
    return (
      <div className="min-h-[calc(100vh-140px)] px-4 py-6 sm:px-6 lg:px-10">
        <div className="mx-auto w-full max-w-7xl rounded-2xl border border-slate-200 bg-white p-6 text-sm text-slate-500 shadow-sm">
          Loading dashboard...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-140px)] px-4 sm:px-6 lg:px-5">
      <div className="mx-auto w-full max-w-7xl space-y-6">
        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          <p className="text-xs font-semibold uppercase tracking-wide text-teal-600">
            User Dashboard
          </p>
          <h1 className="mt-2 text-2xl font-bold text-slate-900 sm:text-3xl">
            Welcome back{user?.full_name ? `, ${user.full_name}` : ""}
          </h1>
          <p className="mt-2 text-sm text-slate-600">
            Track your orders, appointments and treatment progress in one place.
          </p>

          <div className="mt-4 flex flex-wrap gap-2">
            <Link
              href={PRODUCT_ROUTE}
              className="rounded-lg bg-teal-600 px-3 py-2 text-sm font-medium text-white hover:bg-teal-700"
            >
              Order Products
            </Link>
            <Link
              href={DOCTORS_ROUTE}
              className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              Book Appointment
            </Link>
          </div>
        </section>

        <DashboardStatsGrid stats={stats} />

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <DashboardRecentOrders orders={recentOrders} />
          <DashboardUpcomingAppointments appointments={nextAppointments} />
        </div>
      </div>
    </div>
  );
}
