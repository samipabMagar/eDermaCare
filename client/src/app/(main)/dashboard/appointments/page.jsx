"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Calendar, Clock, MessageCircle } from "lucide-react";
import { toast } from "react-toastify";
import { appointmentService } from "@/services/appointmentService";
import { DOCTORS_ROUTE } from "@/constants/routes";
import AppointmentDetailsModal from "@/components/appointments/AppointmentDetailsModal";

const tabs = ["All", "Pending", "Confirmed", "Completed", "Cancelled"];

const statusStyles = {
  pending: "bg-blue-50 text-blue-700 border-blue-200",
  confirmed: "bg-indigo-50 text-indigo-700 border-indigo-200",
  completed: "bg-green-50 text-green-700 border-green-200",
  cancelled: "bg-rose-50 text-rose-700 border-rose-200",
  rejected: "bg-amber-50 text-amber-700 border-amber-200",
};

export default function DashboardAppointmentsPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [appointments, setAppointments] = useState([]);
  const [activeTab, setActiveTab] = useState("All");
  const [cancelingId, setCancelingId] = useState(null);
  const [detailsAppointmentId, setDetailsAppointmentId] = useState(null);

  useEffect(() => {
    const loadAppointments = async () => {
      try {
        setIsLoading(true);
        const data = await appointmentService.getMyAppointments();
        setAppointments(Array.isArray(data) ? data : []);
      } catch (error) {
        toast.error(error.message || "Failed to load appointments");
      } finally {
        setIsLoading(false);
      }
    };

    loadAppointments();
  }, []);

  const filteredAppointments = useMemo(() => {
    return appointments.filter((appointment) => {
      const normalizedStatus = String(appointment.status || "").toLowerCase();
      return (
        activeTab === "All" || normalizedStatus === activeTab.toLowerCase()
      );
    });
  }, [activeTab, appointments]);

  const handleCancel = async (appointmentId) => {
    try {
      setCancelingId(appointmentId);
      await appointmentService.cancelAppointment(appointmentId);
      setAppointments((prev) =>
        prev.map((item) =>
          item.appointment_id === appointmentId
            ? { ...item, status: "cancelled" }
            : item,
        ),
      );
      toast.success("Appointment cancelled");
    } catch (error) {
      toast.error(error.message || "Failed to cancel appointment");
    } finally {
      setCancelingId(null);
    }
  };

  if (isLoading) {
    return (
      <p className="p-6 text-sm text-slate-500">Loading appointments...</p>
    );
  }

  return (
    <div className="space-y-6 px-4 py-4 sm:px-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Appointments</h1>
          <p className="mt-1 text-sm text-slate-500">
            Manage your dermatology appointments.
          </p>
        </div>
        <Link
          href={DOCTORS_ROUTE}
          className="rounded-xl bg-[#0F9EA5] px-4 py-2.5 text-sm font-medium text-white hover:bg-[#0c878d]"
        >
          Book New
        </Link>
      </div>

      <div className="flex flex-wrap gap-2">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`rounded-xl px-4 py-2 text-sm font-medium transition ${
              activeTab === tab
                ? "bg-[#0F9EA5] text-white"
                : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {filteredAppointments.map((appointment) => {
          const normalizedStatus = String(
            appointment.status || "",
          ).toLowerCase();
          const badgeClass =
            statusStyles[normalizedStatus] || statusStyles.pending;
          const isCancelable = ["pending", "confirmed"].includes(
            normalizedStatus,
          );

          return (
            <article
              key={appointment.appointment_id}
              className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
            >
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                  <div className="mb-1 flex flex-wrap items-center gap-2">
                    <p className="text-sm font-semibold text-slate-900">
                      {appointment.doctor?.full_name || "Doctor"}
                    </p>
                    <span
                      className={`rounded-full border px-2.5 py-0.5 text-xs font-medium ${badgeClass}`}
                    >
                      {appointment.status}
                    </span>
                  </div>

                  <div className="mt-2 flex flex-wrap items-center gap-4 text-xs text-slate-500">
                    <span className="inline-flex items-center gap-1">
                      <Calendar className="h-3.5 w-3.5" />
                      {new Date(appointment.scheduled_at).toLocaleDateString()}
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <Clock className="h-3.5 w-3.5" />
                      {new Date(appointment.scheduled_at).toLocaleTimeString(
                        [],
                        {
                          hour: "2-digit",
                          minute: "2-digit",
                        },
                      )}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() =>
                      setDetailsAppointmentId(appointment.appointment_id)
                    }
                    className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                  >
                    View Details
                  </button>

                  {normalizedStatus === "completed" && (
                    <button
                      type="button"
                      className="inline-flex items-center gap-1.5 rounded-xl bg-[#0F9EA5]/10 px-4 py-2 text-sm font-medium text-[#0F9EA5]"
                    >
                      <MessageCircle className="h-4 w-4" />
                      Chat
                    </button>
                  )}

                  {isCancelable && (
                    <button
                      type="button"
                      onClick={() => handleCancel(appointment.appointment_id)}
                      disabled={cancelingId === appointment.appointment_id}
                      className="rounded-xl border border-rose-200 px-4 py-2 text-sm font-medium text-rose-600 hover:bg-rose-50 disabled:cursor-not-allowed disabled:opacity-70"
                    >
                      {cancelingId === appointment.appointment_id
                        ? "Canceling..."
                        : "Cancel"}
                    </button>
                  )}
                </div>
              </div>
            </article>
          );
        })}

        {filteredAppointments.length === 0 && (
          <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center">
            <p className="text-sm font-medium text-slate-600">
              No appointments found.
            </p>
          </div>
        )}
      </div>

      <AppointmentDetailsModal
        open={Boolean(detailsAppointmentId)}
        appointmentId={detailsAppointmentId}
        viewerRole="user"
        onClose={() => setDetailsAppointmentId(null)}
      />
    </div>
  );
}
