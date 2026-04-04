"use client";

import { useMemo, useState } from "react";
import { useCallback, useEffect } from "react";
import { CalendarDays, Clock3, Loader2, Video, X } from "lucide-react";
import { toast } from "react-toastify";
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

const ACTION_TITLES = {
  confirm: "Confirm Appointment",
  reject: "Reject Appointment",
  complete: "Complete Appointment",
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
  const [actionModal, setActionModal] = useState({
    open: false,
    type: null,
    appointment: null,
  });
  const [meetingProvider, setMeetingProvider] = useState("google_meet");
  const [meetingLink, setMeetingLink] = useState("");
  const [doctorNotes, setDoctorNotes] = useState("");
  const [rejectionReason, setRejectionReason] = useState("");
  const [submittingAction, setSubmittingAction] = useState(false);

  const loadAppointments = useCallback(async () => {
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
  }, []);

  useEffect(() => {
    loadAppointments();
  }, [loadAppointments]);

  const closeActionModal = () => {
    setActionModal({ open: false, type: null, appointment: null });
    setMeetingProvider("google_meet");
    setMeetingLink("");
    setDoctorNotes("");
    setRejectionReason("");
    setSubmittingAction(false);
  };

  const openActionModal = (type, appointment) => {
    setActionModal({ open: true, type, appointment });
    setMeetingProvider("google_meet");
    setMeetingLink("");
    setDoctorNotes("");
    setRejectionReason("");
  };

  const submitAction = async () => {
    const appointmentId = actionModal.appointment?.appointment_id;
    if (!appointmentId || !actionModal.type) return;

    try {
      setSubmittingAction(true);

      if (actionModal.type === "confirm") {
        if (!meetingLink.trim()) {
          toast.error("Meeting link is required");
          return;
        }

        await appointmentService.confirmAppointment(appointmentId, {
          meeting_provider: meetingProvider,
          meeting_link: meetingLink.trim(),
          doctor_notes: doctorNotes.trim() || undefined,
        });
        toast.success("Appointment confirmed");
      }

      if (actionModal.type === "reject") {
        await appointmentService.rejectAppointment(appointmentId, {
          rejection_reason: rejectionReason.trim() || undefined,
        });
        toast.success("Appointment rejected");
      }

      if (actionModal.type === "complete") {
        await appointmentService.completeAppointment(appointmentId, {
          doctor_notes: doctorNotes.trim() || undefined,
        });
        toast.success("Appointment completed");
      }

      closeActionModal();
      await loadAppointments();
    } catch (actionError) {
      toast.error(actionError.message || "Failed to update appointment");
    } finally {
      setSubmittingAction(false);
    }
  };

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
                      <div className="flex items-center gap-2">
                        <a
                          href={appointment.meeting_link}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center justify-center rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                        >
                          Join Meeting
                        </a>
                      </div>
                    ) : null}

                    {appointment.status === "pending" ? (
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() =>
                            openActionModal("confirm", appointment)
                          }
                          className="rounded-xl bg-[#0F9EA5] px-4 py-2 text-sm font-medium text-white transition hover:bg-[#0c878d]"
                        >
                          Confirm
                        </button>
                        <button
                          type="button"
                          onClick={() => openActionModal("reject", appointment)}
                          className="rounded-xl border border-rose-300 px-4 py-2 text-sm font-medium text-rose-600 transition hover:bg-rose-50"
                        >
                          Reject
                        </button>
                      </div>
                    ) : null}

                    {appointment.status === "confirmed" ? (
                      <button
                        type="button"
                        onClick={() => openActionModal("complete", appointment)}
                        className="rounded-xl bg-emerald-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-emerald-700"
                      >
                        Mark Complete
                      </button>
                    ) : null}
                  </div>
                </article>
              );
            })
          )}
        </div>
      ) : null}

      {actionModal.open ? (
        <div className="fixed inset-0 z-100 flex items-center justify-center p-4">
          <button
            type="button"
            onClick={closeActionModal}
            className="absolute inset-0 bg-slate-900/45"
            aria-label="Close"
          />

          <section className="relative z-10 w-full max-w-lg rounded-2xl border border-slate-200 bg-white shadow-xl">
            <div className="flex items-start justify-between border-b border-slate-200 px-5 py-4">
              <div>
                <h3 className="text-base font-semibold text-slate-900">
                  {ACTION_TITLES[actionModal.type]}
                </h3>
                <p className="mt-1 text-xs text-slate-500">
                  {actionModal.appointment?.patient?.full_name || "Patient"} •{" "}
                  {formatDate(actionModal.appointment?.scheduled_at)}{" "}
                  {formatTime(actionModal.appointment?.scheduled_at)}
                </p>
              </div>

              <button
                type="button"
                onClick={closeActionModal}
                className="inline-flex h-8 w-8 items-center justify-center rounded-full text-slate-500 transition hover:bg-slate-100"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-4 px-5 py-5">
              {actionModal.type === "confirm" ? (
                <>
                  <div>
                    <label className="mb-1 block text-sm font-medium text-slate-700">
                      Meeting Provider
                    </label>
                    <select
                      value={meetingProvider}
                      onChange={(event) =>
                        setMeetingProvider(event.target.value)
                      }
                      className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm text-slate-700 outline-none focus:border-teal-600"
                    >
                      <option value="google_meet">Google Meet</option>
                      <option value="zoom">Zoom</option>
                    </select>
                  </div>

                  <div>
                    <label className="mb-1 block text-sm font-medium text-slate-700">
                      Meeting Link
                    </label>
                    <input
                      type="url"
                      value={meetingLink}
                      onChange={(event) => setMeetingLink(event.target.value)}
                      placeholder="https://..."
                      className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm text-slate-700 outline-none focus:border-teal-600"
                    />
                  </div>
                </>
              ) : null}

              {actionModal.type === "reject" ? (
                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700">
                    Rejection Reason (optional)
                  </label>
                  <textarea
                    rows={4}
                    value={rejectionReason}
                    onChange={(event) => setRejectionReason(event.target.value)}
                    placeholder="Briefly explain why this appointment is rejected"
                    className="w-full resize-none rounded-lg border border-slate-200 px-3 py-2.5 text-sm text-slate-700 outline-none focus:border-teal-600"
                  />
                </div>
              ) : null}

              {actionModal.type === "complete" ||
              actionModal.type === "confirm" ? (
                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700">
                    Doctor Notes (optional)
                  </label>
                  <textarea
                    rows={4}
                    value={doctorNotes}
                    onChange={(event) => setDoctorNotes(event.target.value)}
                    placeholder="Add any consultation notes"
                    className="w-full resize-none rounded-lg border border-slate-200 px-3 py-2.5 text-sm text-slate-700 outline-none focus:border-teal-600"
                  />
                </div>
              ) : null}

              <div className="flex gap-3 pt-1">
                <button
                  type="button"
                  onClick={closeActionModal}
                  className="flex-1 rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={submittingAction}
                  onClick={submitAction}
                  className="flex-1 rounded-lg bg-[#0F9EA5] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#0c878d] disabled:cursor-not-allowed disabled:bg-slate-300"
                >
                  {submittingAction ? "Saving..." : "Confirm"}
                </button>
              </div>
            </div>
          </section>
        </div>
      ) : null}
    </div>
  );
};

export default DoctorAppointmentsPage;
