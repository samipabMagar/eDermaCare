"use client";

import { useMemo, useState } from "react";
import { useEffect } from "react";
import { CalendarDays, Clock3, Loader2, Video } from "lucide-react";
import DoctorSectionHeader from "@/components/doctor/dashboard/DoctorSectionHeader";
import { appointmentService } from "@/services/appointmentService";

const APPOINTMENT_TABS = [
  "All",
  "Pending",
  "Confirmed",
  "Completed",
  "Cancelled",
  "Rejected",
];

const APPOINTMENT_STATUS_STYLES = {
  Pending: "bg-amber-50 text-amber-700 border-amber-200",
  Confirmed: "bg-sky-50 text-sky-700 border-sky-200",
  Completed: "bg-green-50 text-green-700 border-green-200",
  Cancelled: "bg-red-50 text-red-700 border-red-200",
  Rejected: "bg-rose-50 text-rose-700 border-rose-200",
};

const toTitleCase = (value = "") => {
  return value ? value.charAt(0).toUpperCase() + value.slice(1) : "-";
};

const formatDate = (value) => {
  if (!value) return "-";
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return "-";
  return parsed.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

const formatTime = (value) => {
  if (!value) return "-";
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return "-";
  return parsed.toLocaleTimeString(undefined, {
    hour: "numeric",
    minute: "2-digit",
  });
};

const DoctorAppointmentsPage = () => {
  const [activeTab, setActiveTab] = useState("All");
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
        setError(loadError.message || "Failed to load appointments");
      } finally {
        setLoading(false);
      }
    };

    loadAppointments();
  }, []);

  const filteredAppointments = useMemo(() => {
    if (activeTab === "All") {
      return appointments;
    }

    return appointments.filter(
      (item) => toTitleCase(item.status) === activeTab,
    );
  }, [activeTab, appointments]);

  const upcomingCount = appointments.filter(
    (item) => item.status === "confirmed",
  ).length;

  return (
    <div className="mx-auto w-full max-w-6xl space-y-6">
      <DoctorSectionHeader
        title="Appointments"
        subtitle="Manage your patient consultations and treatment sessions"
        rightSlot={
          <div className="text-right">
            <p className="text-2xl font-bold text-slate-900">{upcomingCount}</p>
            <p className="text-xs text-slate-500">Upcoming today</p>
          </div>
        }
      />

      <div className="flex flex-wrap gap-2">
        {APPOINTMENT_TABS.map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => setActiveTab(tab)}
            className={`rounded-xl px-4 py-2 text-sm font-medium transition ${
              activeTab === tab
                ? "bg-[#0F9EA5] text-white shadow-sm"
                : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-6 text-sm text-slate-600">
          <span className="inline-flex items-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin" /> Loading appointments...
          </span>
        </div>
      ) : null}

      {!loading && error ? (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 p-5 text-sm text-rose-700">
          {error}
        </div>
      ) : null}

      {!loading && !error ? (
        <div className="space-y-3">
          {!filteredAppointments.length ? (
            <div className="rounded-2xl border border-slate-200 bg-white p-6 text-sm text-slate-500">
              No appointments found for this filter.
            </div>
          ) : (
            filteredAppointments.map((appointment) => {
              const appointmentStatus = toTitleCase(appointment.status);

              return (
                <article
                  key={appointment.appointment_id}
                  className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
                >
                  <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                    <div className="space-y-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="text-sm font-semibold text-slate-900">
                          {appointment.patient?.full_name || "Patient"}
                        </p>
                        <span
                          className={`rounded-full border px-2.5 py-0.5 text-xs font-medium ${
                            APPOINTMENT_STATUS_STYLES[appointmentStatus] ||
                            "bg-slate-100 text-slate-700 border-slate-200"
                          }`}
                        >
                          {appointmentStatus}
                        </span>
                      </div>

                      <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500">
                        <span className="inline-flex items-center gap-1">
                          <CalendarDays className="h-3 w-3" />
                          {formatDate(appointment.scheduled_at)}
                        </span>
                        <span className="inline-flex items-center gap-1">
                          <Clock3 className="h-3 w-3" />
                          {formatTime(appointment.scheduled_at)}
                        </span>
                        {appointment.meeting_provider ? (
                          <span className="inline-flex items-center gap-1">
                            <Video className="h-3 w-3" />
                            {toTitleCase(
                              appointment.meeting_provider.replace("_", " "),
                            )}
                          </span>
                        ) : null}
                      </div>
                    </div>

                    {appointment.meeting_link ? (
                      <a
                        href={appointment.meeting_link}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center justify-center rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                      >
                        Join Meeting
                      </a>
                    ) : null}
                  </div>
                </article>
              );
            })
          )}
        </div>
      ) : null}
    </div>
  );
};

export default DoctorAppointmentsPage;
