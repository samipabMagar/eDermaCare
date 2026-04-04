"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { CalendarDays, Clock3, Loader2 } from "lucide-react";
import { appointmentService } from "@/services/appointmentService";
import DoctorOverviewStats from "@/components/doctor/dashboard/DoctorOverviewStats";
import { ROUTES } from "@/constants/routes";

const toTitleCase = (value = "") => {
  return value ? value.charAt(0).toUpperCase() + value.slice(1) : "-";
};

const formatSlotDate = (value) => {
  if (!value) return "";
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return "";
  return parsed.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

const formatSlotTime = (value) => {
  if (!value) return "";
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return "";
  return parsed.toLocaleTimeString(undefined, {
    hour: "numeric",
    minute: "2-digit",
  });
};

export default function DoctorDashboardPage() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadAppointments = async () => {
      try {
        setLoading(true);
        setError("");
        const data = await appointmentService.getMyAppointments();
        setAppointments(Array.isArray(data) ? data : []);
      } catch (loadError) {
        setError(loadError.message || "Failed to load dashboard data");
      } finally {
        setLoading(false);
      }
    };

    loadAppointments();
  }, []);

  const stats = useMemo(() => {
    const now = new Date();
    const today = now.toDateString();

    const total = appointments.length;
    const todayCount = appointments.filter((item) => {
      const date = new Date(item.scheduled_at);
      return !Number.isNaN(date.getTime()) && date.toDateString() === today;
    }).length;
    const completedToday = appointments.filter((item) => {
      const date = new Date(item.scheduled_at);
      return (
        item.status === "completed" &&
        !Number.isNaN(date.getTime()) &&
        date.toDateString() === today
      );
    }).length;
    const pendingCount = appointments.filter(
      (item) => item.status === "pending",
    ).length;

    return [
      {
        label: "Total Appointments",
        value: String(total),
        change: `${todayCount} today`,
        icon: CalendarDays,
        color: "bg-teal-100 text-teal-700",
      },
      {
        label: "Pending Requests",
        value: String(pendingCount),
        change: "Awaiting response",
        icon: Clock3,
        color: "bg-amber-100 text-amber-700",
      },
      {
        label: "Completed Today",
        value: String(completedToday),
        change: "Finished consultations",
        icon: CalendarDays,
        color: "bg-emerald-100 text-emerald-700",
      },
      {
        label: "Confirmed",
        value: String(
          appointments.filter((item) => item.status === "confirmed").length,
        ),
        change: "Upcoming confirmed slots",
        icon: Clock3,
        color: "bg-sky-100 text-sky-700",
      },
    ];
  }, [appointments]);

  const todaysSchedule = useMemo(() => {
    const today = new Date().toDateString();
    return appointments
      .filter((item) => {
        const date = new Date(item.scheduled_at);
        return !Number.isNaN(date.getTime()) && date.toDateString() === today;
      })
      .slice(0, 6);
  }, [appointments]);

  return (
    <div className="mx-auto w-full max-w-7xl space-y-6">
      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <p className="text-xs font-semibold uppercase tracking-wide text-[#2FA4A9]">
          Doctor Dashboard
        </p>
        <h1 className="mt-2 text-2xl font-bold text-slate-900 sm:text-3xl">
          Practice Overview
        </h1>
        <p className="mt-2 text-sm text-slate-600">
          Monitor live appointment activity from your current practice data.
        </p>
      </section>

      {loading ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-8 text-sm text-slate-600">
          <span className="inline-flex items-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin" /> Loading dashboard
            data...
          </span>
        </div>
      ) : null}

      {!loading && error ? (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 p-5 text-sm text-rose-700">
          {error}
        </div>
      ) : null}

      {!loading && !error ? <DoctorOverviewStats stats={stats} /> : null}

      {!loading && !error ? (
        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          <div className="flex items-center justify-between border-b border-slate-200 pb-4">
            <h2 className="text-base font-semibold text-slate-900">
              Today's Schedule
            </h2>
            <Link
              href={ROUTES.DOCTOR_APPOINTMENTS}
              className="text-sm font-medium text-teal-700 hover:underline"
            >
              View All
            </Link>
          </div>

          <div className="mt-3 space-y-2">
            {!todaysSchedule.length ? (
              <p className="rounded-xl border border-slate-100 bg-slate-50 px-3 py-4 text-sm text-slate-500">
                No appointments scheduled for today.
              </p>
            ) : (
              todaysSchedule.map((appointment) => (
                <article
                  key={appointment.appointment_id}
                  className="flex items-center justify-between rounded-xl border border-slate-100 px-3 py-3 hover:bg-slate-50"
                >
                  <div>
                    <p className="text-sm font-medium text-slate-900">
                      {appointment.patient?.full_name || "Patient"}
                    </p>
                    <p className="text-xs text-slate-500">
                      {formatSlotDate(appointment.scheduled_at)} •{" "}
                      {formatSlotTime(appointment.scheduled_at)}
                    </p>
                  </div>
                  <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-medium text-slate-600">
                    {toTitleCase(appointment.status)}
                  </span>
                </article>
              ))
            )}
          </div>
        </section>
      ) : null}
    </div>
  );
}
