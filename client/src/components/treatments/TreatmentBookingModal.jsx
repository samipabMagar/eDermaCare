"use client";

import { useEffect, useState } from "react";
import { Calendar, FileText, X } from "lucide-react";
import { toast } from "react-toastify";
import { treatmentService } from "@/services/treatmentService";

const getMinDateTimeLocal = () => {
  const now = new Date();
  now.setMinutes(now.getMinutes() + 30);
  return now.toISOString().slice(0, 16);
};

const getDateFromNepalInput = (dateTimeValue) => {
  if (!dateTimeValue) return null;
  const isoWithOffset = `${dateTimeValue}:00+05:45`;
  const parsed = new Date(isoWithOffset);
  if (Number.isNaN(parsed.getTime())) return null;
  return parsed;
};

const isWithinNepalBookingWindow = (dateTimeValue) => {
  if (!dateTimeValue) {
    return false;
  }

  const parsed = getDateFromNepalInput(dateTimeValue);
  if (!parsed) {
    return false;
  }

  const weekday = new Intl.DateTimeFormat("en-US", {
    timeZone: "Asia/Kathmandu",
    weekday: "short",
  }).format(parsed);

  if (weekday === "Sat") {
    return false;
  }

  const [_, timePart] = dateTimeValue.split("T");
  const [hourText = "0", minuteText = "0"] = (timePart || "").split(":");
  const hour = Number(hourText);
  const minute = Number(minuteText);
  const totalMinutes = hour * 60 + minute;

  return totalMinutes >= 9 * 60 && totalMinutes <= 18 * 60;
};

const formatDateTimeLabel = (isoDate) => {
  if (!isoDate) return "";
  const parsed = new Date(isoDate);
  if (Number.isNaN(parsed.getTime())) return "";

  return parsed.toLocaleString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
};

const TreatmentBookingModal = ({ open, onClose, treatment }) => {
  const [sessionDate, setSessionDate] = useState("");
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isBooked, setIsBooked] = useState(false);

  useEffect(() => {
    if (!open) {
      setSessionDate("");
      setNotes("");
      setIsSubmitting(false);
      setIsBooked(false);
      return;
    }

    const handleEsc = (event) => {
      if (event.key === "Escape") onClose();
    };

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleEsc);

    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener("keydown", handleEsc);
    };
  }, [open, onClose]);

  const handleSubmit = async () => {
    if (!treatment?.treatment_id) {
      toast.error("Treatment information is missing");
      return;
    }

    if (!sessionDate) {
      toast.error("Please choose session date and time");
      return;
    }

    if (!isWithinNepalBookingWindow(sessionDate)) {
      toast.error(
        "Booking is available Sunday to Friday between 9:00 AM and 6:00 PM Nepal time",
      );
      return;
    }

    const sessionDateAsIso = getDateFromNepalInput(sessionDate)?.toISOString();
    if (!sessionDateAsIso) {
      toast.error("Invalid date and time selected");
      return;
    }

    try {
      setIsSubmitting(true);
      await treatmentService.createTreatmentBooking({
        treatment_id: treatment.treatment_id,
        session_date: sessionDateAsIso,
        reminder_frequency: "monthly",
        user_notes: notes.trim() || undefined,
      });

      setIsBooked(true);
      toast.success("Treatment booking request sent");
    } catch (error) {
      if (error.status === 401 || error.status === 403) {
        toast.info("Please sign in to book treatment");
      } else {
        toast.error(error.message || "Failed to create booking");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!open || !treatment) return null;

  return (
    <div className="fixed inset-0 z-100 flex items-center justify-center p-4">
      <button
        type="button"
        onClick={onClose}
        className="absolute inset-0 bg-slate-900/50 backdrop-blur-[2px]"
        aria-label="Close booking modal"
      />

      <section className="relative z-10 w-full max-w-lg overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl">
        <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50 px-5 py-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Book Treatment</h2>
            <p className="text-xs text-slate-600">{treatment.name}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-8 w-8 items-center justify-center rounded-full text-slate-500 hover:bg-slate-200"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="space-y-4 px-5 py-5">
          {isBooked ? (
            <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800">
              <p className="font-semibold">Booking request submitted.</p>
              <p className="mt-1">
                Your appointment is pending admin approval. You will receive an
                email update once reviewed.
              </p>
            </div>
          ) : (
            <>
              <label className="block text-sm font-medium text-slate-700">
                <span className="mb-1.5 flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-[#0F9EA5]" />
                  Session date and time (Nepal time)
                </span>
                <input
                  type="datetime-local"
                  value={sessionDate}
                  min={getMinDateTimeLocal()}
                  onChange={(event) => setSessionDate(event.target.value)}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm text-slate-700 outline-none focus:border-[#0F9EA5]"
                />
              </label>

              <p className="rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-800">
                Booking hours: Sunday to Friday, 9:00 AM to 6:00 PM (NPT).
              </p>

              <p className="rounded-lg bg-slate-50 px-3 py-2 text-xs text-slate-600">
                Reminder schedule: Monthly
              </p>

              <label className="block text-sm font-medium text-slate-700">
                <span className="mb-1.5 flex items-center gap-2">
                  <FileText className="h-4 w-4 text-[#0F9EA5]" />
                  Notes (optional)
                </span>
                <textarea
                  rows={4}
                  value={notes}
                  onChange={(event) => setNotes(event.target.value)}
                  className="w-full resize-none rounded-lg border border-slate-200 px-3 py-2.5 text-sm text-slate-700 outline-none focus:border-[#0F9EA5]"
                  placeholder="Mention skin concerns, preferred timing, or prior treatment history."
                />
              </label>

              {sessionDate ? (
                <p className="rounded-lg bg-slate-50 px-3 py-2 text-xs text-slate-600">
                  Selected: {formatDateTimeLabel(sessionDate)}
                </p>
              ) : null}
            </>
          )}
        </div>

        <div className="flex gap-3 border-t border-slate-200 px-5 py-4">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
          >
            {isBooked ? "Close" : "Cancel"}
          </button>

          {!isBooked ? (
            <button
              type="button"
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="flex-1 rounded-lg bg-[#0F9EA5] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#0c878d] disabled:cursor-not-allowed disabled:bg-slate-300"
            >
              {isSubmitting ? "Submitting..." : "Request Booking"}
            </button>
          ) : null}
        </div>
      </section>
    </div>
  );
};

export default TreatmentBookingModal;
