"use client";

import { useEffect, useState } from "react";
import { CalendarDays, Clock3, Loader2, Video, X } from "lucide-react";
import { appointmentService } from "@/services/appointmentService";

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

const AppointmentDetailsModal = ({
  open,
  onClose,
  appointmentId,
  viewerRole,
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [appointment, setAppointment] = useState(null);

  const patientNotes = appointment?.patient_notes || "";

  useEffect(() => {
    if (!open || !appointmentId) {
      setAppointment(null);
      setError("");
      setLoading(false);
      return;
    }

    const loadDetails = async () => {
      try {
        setLoading(true);
        setError("");
        const data = await appointmentService.getAppointmentById(appointmentId);
        setAppointment(data);
      } catch (loadError) {
        setError(loadError.message || "Failed to load appointment details");
      } finally {
        setLoading(false);
      }
    };

    loadDetails();
  }, [appointmentId, open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-100 flex items-center justify-center p-4">
      <button
        type="button"
        onClick={onClose}
        className="absolute inset-0 bg-slate-900/45"
        aria-label="Close"
      />

      <section className="relative z-10 w-full max-w-xl rounded-2xl border border-slate-200 bg-white shadow-xl">
        <div className="flex items-start justify-between border-b border-slate-200 px-5 py-4">
          <div>
            <h3 className="text-base font-semibold text-slate-900">
              Appointment Details
            </h3>
            <p className="mt-1 text-xs text-slate-500">
              ID: {appointmentId || "-"}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-8 w-8 items-center justify-center rounded-full text-slate-500 transition hover:bg-slate-100"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="space-y-4 px-5 py-5">
          {loading ? (
            <p className="text-sm text-slate-600">
              <span className="inline-flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" /> Loading details...
              </span>
            </p>
          ) : null}

          {!loading && error ? (
            <div className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-3 text-sm text-rose-700">
              {error}
            </div>
          ) : null}

          {!loading && !error && appointment ? (
            <div className="space-y-3 text-sm text-slate-700">
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                  <p className="text-xs text-slate-500">Status</p>
                  <p className="mt-1 font-semibold text-slate-900">
                    {toTitleCase(appointment.status)}
                  </p>
                </div>

                <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                  <p className="text-xs text-slate-500">Date & Time</p>
                  <p className="mt-1 inline-flex items-center gap-1.5 font-semibold text-slate-900">
                    <CalendarDays className="h-3.5 w-3.5 text-slate-500" />
                    {formatDate(appointment.scheduled_at)}
                  </p>
                  <p className="mt-1 inline-flex items-center gap-1.5 text-xs text-slate-600">
                    <Clock3 className="h-3.5 w-3.5 text-slate-500" />
                    {formatTime(appointment.scheduled_at)}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div className="rounded-xl border border-slate-200 bg-white p-3">
                  <p className="text-xs text-slate-500">Patient</p>
                  <p className="mt-1 font-semibold text-slate-900">
                    {appointment.patient?.full_name || "-"}
                  </p>
                  <p className="mt-1 text-xs text-slate-600">
                    {appointment.patient?.email || ""}
                  </p>
                </div>

                <div className="rounded-xl border border-slate-200 bg-white p-3">
                  <p className="text-xs text-slate-500">Doctor</p>
                  <p className="mt-1 font-semibold text-slate-900">
                    {appointment.doctor?.full_name || "-"}
                  </p>
                  <p className="mt-1 text-xs text-slate-600">
                    {appointment.doctor?.email || ""}
                  </p>
                </div>
              </div>

              {appointment.doctor_notes ? (
                <div className="rounded-xl border border-slate-200 bg-white p-3">
                  <p className="text-xs text-slate-500">Doctor Notes</p>
                  <p className="mt-1 text-sm text-slate-700">
                    {appointment.doctor_notes}
                  </p>
                </div>
              ) : null}

              {appointment.meeting_provider || appointment.meeting_link ? (
                <div className="rounded-xl border border-slate-200 bg-white p-3">
                  <p className="text-xs text-slate-500">Meeting</p>
                  <p className="mt-1 font-medium text-slate-800">
                    {appointment.meeting_provider
                      ? toTitleCase(
                          appointment.meeting_provider.replace("_", " "),
                        )
                      : "Not assigned"}
                  </p>
                  {appointment.meeting_link ? (
                    <a
                      href={appointment.meeting_link}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-2 inline-flex items-center gap-1.5 text-xs font-medium text-teal-700 hover:underline"
                    >
                      <Video className="h-3.5 w-3.5" /> Open meeting link
                    </a>
                  ) : null}
                </div>
              ) : null}

              {patientNotes ? (
                <div className="rounded-xl border border-slate-200 bg-white p-3">
                  <p className="text-xs text-slate-500">Patient Notes</p>
                  <p className="mt-1 text-sm text-slate-700">{patientNotes}</p>
                </div>
              ) : null}

              {appointment.status === "cancelled" ? (
                <div className="rounded-xl border border-slate-200 bg-white p-3">
                  <p className="text-xs text-slate-500">Cancellation Details</p>
                  <p className="mt-1 text-sm text-slate-700">
                    By: {toTitleCase(appointment.cancelled_by || "-")}
                  </p>
                  <p className="mt-1 text-sm text-slate-700">
                    Reason:{" "}
                    {appointment.cancellation_reason || "No reason provided"}
                  </p>
                </div>
              ) : null}

              {viewerRole === "doctor" && appointment.status === "rejected" ? (
                <p className="rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-700">
                  This request was rejected and the patient has been notified by
                  email.
                </p>
              ) : null}
            </div>
          ) : null}
        </div>
      </section>
    </div>
  );
};

export default AppointmentDetailsModal;
