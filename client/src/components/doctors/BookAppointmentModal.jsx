"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Calendar,
  CheckCircle2,
  Clock3,
  FileText,
  UserRound,
  X,
} from "lucide-react";
import { toast } from "react-toastify";
import { appointmentService } from "@/services/appointmentService";

const TIME_SLOTS = [
  "09:00",
  "09:30",
  "10:00",
  "10:30",
  "11:00",
  "11:30",
  "12:00",
  "12:30",
  "14:00",
  "14:30",
  "15:00",
  "15:30",
  "16:00",
  "16:30",
  "17:00",
  "17:30",
];

const STEP_ORDER = ["datetime", "details", "confirm"];

const getMinDateString = () => {
  const now = new Date();
  now.setDate(now.getDate() + 1);
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const formatDateForSummary = (value) => {
  if (!value) return "";

  const parsed = new Date(`${value}T00:00:00`);
  return Number.isNaN(parsed.getTime())
    ? value
    : parsed.toLocaleDateString(undefined, {
        weekday: "long",
        month: "short",
        day: "numeric",
        year: "numeric",
      });
};

const formatTimeLabel = (value) => {
  if (!value) return "";
  const [hourString, minuteString] = value.split(":");
  const hour = Number(hourString);
  const minute = Number(minuteString);
  if (Number.isNaN(hour) || Number.isNaN(minute)) return value;

  const suffix = hour >= 12 ? "PM" : "AM";
  const normalizedHour = hour % 12 || 12;
  return `${normalizedHour}:${String(minute).padStart(2, "0")} ${suffix}`;
};

const StepIndicator = ({ step }) => {
  const currentIndex =
    step === "success" ? STEP_ORDER.length : STEP_ORDER.indexOf(step);

  return (
    <div className="mb-5 flex items-center justify-center gap-2">
      {STEP_ORDER.map((currentStep, index) => {
        const isCompleted = currentIndex > index;
        const isActive = currentIndex === index;

        return (
          <div key={currentStep} className="flex items-center gap-2">
            <div
              className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold transition ${
                isCompleted || isActive
                  ? "bg-[#0F9EA5] text-white"
                  : "bg-slate-100 text-slate-500"
              }`}
            >
              {index + 1}
            </div>
            {index < STEP_ORDER.length - 1 ? (
              <div
                className={`h-0.5 w-8 rounded-full ${
                  currentIndex > index ? "bg-[#0F9EA5]" : "bg-slate-200"
                }`}
              />
            ) : null}
          </div>
        );
      })}
    </div>
  );
};

const BookAppointmentModal = ({ open, onClose, doctor }) => {
  const [step, setStep] = useState("datetime");
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("");
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(false);
  const [unavailableSlots, setUnavailableSlots] = useState([]);
  const [loadingSlots, setLoadingSlots] = useState(false);

  const doctorName = doctor?.user?.full_name || "Doctor";
  const doctorSpecialization =
    doctor?.specialization || "Dermatology Specialist";
  const doctorUserId = doctor?.user?.user_id;

  const canContinueDateTime = Boolean(selectedDate && selectedTime);

  const scheduledAtIso = useMemo(() => {
    if (!selectedDate || !selectedTime) return "";
    return new Date(`${selectedDate}T${selectedTime}:00`).toISOString();
  }, [selectedDate, selectedTime]);

  useEffect(() => {
    if (!open || !doctorUserId || !selectedDate) {
      setUnavailableSlots([]);
      return;
    }

    const loadUnavailableSlots = async () => {
      try {
        setLoadingSlots(true);
        const slots = await appointmentService.getDoctorBookedSlots(
          doctorUserId,
          selectedDate,
        );

        const normalizedSlots = slots
          .map((slot) => String(slot).slice(0, 5))
          .filter(Boolean);

        setUnavailableSlots(normalizedSlots);

        if (selectedTime && normalizedSlots.includes(selectedTime)) {
          setSelectedTime("");
        }
      } catch (error) {
        setUnavailableSlots([]);
        if (error.status === 401 || error.status === 403) {
          toast.info("Please login to continue booking");
          onClose();
          return;
        }
        toast.error(error.message || "Failed to load time slots");
      } finally {
        setLoadingSlots(false);
      }
    };

    loadUnavailableSlots();
  }, [doctorUserId, open, onClose, selectedDate, selectedTime]);

  useEffect(() => {
    if (!open) return;

    const handleEsc = (event) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleEsc);

    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener("keydown", handleEsc);
    };
  }, [open, onClose]);

  useEffect(() => {
    if (!open) {
      setStep("datetime");
      setSelectedDate("");
      setSelectedTime("");
      setReason("");
      setUnavailableSlots([]);
      setLoadingSlots(false);
      setLoading(false);
    }
  }, [open]);

  const handleConfirmBooking = async () => {
    if (!doctorUserId || !scheduledAtIso) {
      toast.error("Please select valid appointment details");
      return;
    }

    try {
      setLoading(true);
      await appointmentService.createAppointment({
        doctor_user_id: doctorUserId,
        scheduled_at: scheduledAtIso,
        patient_notes: reason.trim() || undefined,
      });
      setStep("success");
      toast.success("Appointment booked successfully");
    } catch (error) {
      if (error.status === 401 || error.status === 403) {
        toast.info("Please login to book an appointment");
        onClose();
        return;
      }
      toast.error(error.message || "Failed to book appointment");
    } finally {
      setLoading(false);
    }
  };

  if (!open || !doctor) return null;

  return (
    <div className="fixed inset-0 z-100 flex items-center justify-center p-4">
      <button
        type="button"
        onClick={onClose}
        className="absolute inset-0 bg-slate-900/45 backdrop-blur-[2px]"
        aria-label="Close booking dialog"
      />

      <section className="relative z-10 w-full max-w-xl overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl">
        <div className="flex items-start justify-between border-b border-slate-200 bg-linear-to-r from-teal-50 via-cyan-50 to-white px-5 py-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900">
              Book Appointment
            </h2>
            <p className="text-xs text-slate-600">
              {doctorName} • {doctorSpecialization}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-8 w-8 items-center justify-center rounded-full text-slate-500 transition hover:bg-slate-100 hover:text-slate-700"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="px-5 py-5">
          {step !== "success" ? <StepIndicator step={step} /> : null}

          {step === "datetime" ? (
            <div className="space-y-5">
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-semibold text-slate-800">
                  <Calendar className="h-4 w-4 text-teal-700" />
                  Select Date
                </label>
                <input
                  type="date"
                  value={selectedDate}
                  min={getMinDateString()}
                  onChange={(event) => {
                    setSelectedDate(event.target.value);
                    setSelectedTime("");
                  }}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm text-slate-700 outline-none focus:border-teal-600"
                />
              </div>

              {selectedDate ? (
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-sm font-semibold text-slate-800">
                    <Clock3 className="h-4 w-4 text-teal-700" />
                    Select Time
                  </label>

                  <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
                    {TIME_SLOTS.map((slot) => {
                      const isBooked = unavailableSlots.includes(slot);

                      return (
                        <button
                          key={slot}
                          type="button"
                          disabled={isBooked || loadingSlots}
                          onClick={() => setSelectedTime(slot)}
                          className={`rounded-lg border px-2 py-2 text-xs font-medium transition ${
                            isBooked
                              ? "cursor-not-allowed border-transparent bg-slate-100 text-slate-400 line-through"
                              : selectedTime === slot
                                ? "border-teal-600 bg-teal-600 text-white"
                                : "border-slate-200 bg-white text-slate-700 hover:border-teal-300"
                          }`}
                        >
                          {formatTimeLabel(slot)}
                        </button>
                      );
                    })}
                  </div>

                  {loadingSlots ? (
                    <p className="text-[11px] text-slate-500">
                      Loading available slots...
                    </p>
                  ) : unavailableSlots.length ? (
                    <p className="text-[11px] text-slate-500">
                      Crossed-out slots are already booked.
                    </p>
                  ) : null}
                </div>
              ) : null}

              <button
                type="button"
                onClick={() => setStep("details")}
                disabled={!canContinueDateTime}
                className="w-full rounded-lg bg-[#0F9EA5] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#0c878d] disabled:cursor-not-allowed disabled:bg-slate-300"
              >
                Continue
              </button>
            </div>
          ) : null}

          {step === "details" ? (
            <div className="space-y-5">
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-semibold text-slate-800">
                  <FileText className="h-4 w-4 text-teal-700" />
                  Reason / Notes (optional)
                </label>
                <textarea
                  value={reason}
                  onChange={(event) => setReason(event.target.value)}
                  rows={4}
                  placeholder="Describe your skin concern briefly..."
                  className="w-full resize-none rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-700 outline-none focus:border-teal-600 focus:bg-white"
                />
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setStep("datetime")}
                  className="flex-1 rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                >
                  Back
                </button>
                <button
                  type="button"
                  onClick={() => setStep("confirm")}
                  className="flex-1 rounded-lg bg-[#0F9EA5] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#0c878d]"
                >
                  Review Booking
                </button>
              </div>
            </div>
          ) : null}

          {step === "confirm" ? (
            <div className="space-y-5">
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                <h3 className="text-sm font-bold text-slate-900">
                  Booking Summary
                </h3>

                <div className="mt-3 space-y-2">
                  <div className="flex items-center justify-between gap-3">
                    <span className="inline-flex items-center gap-1.5 text-xs text-slate-500">
                      <UserRound className="h-3.5 w-3.5" /> Doctor
                    </span>
                    <span className="text-xs font-semibold text-slate-900">
                      Dr. {doctorName}
                    </span>
                  </div>

                  <div className="flex items-center justify-between gap-3">
                    <span className="inline-flex items-center gap-1.5 text-xs text-slate-500">
                      <Calendar className="h-3.5 w-3.5" /> Date
                    </span>
                    <span className="text-xs font-semibold text-slate-900">
                      {formatDateForSummary(selectedDate)}
                    </span>
                  </div>

                  <div className="flex items-center justify-between gap-3">
                    <span className="inline-flex items-center gap-1.5 text-xs text-slate-500">
                      <Clock3 className="h-3.5 w-3.5" /> Time
                    </span>
                    <span className="text-xs font-semibold text-slate-900">
                      {formatTimeLabel(selectedTime)}
                    </span>
                  </div>

                  {reason.trim() ? (
                    <div className="border-t border-slate-200 pt-2">
                      <p className="text-xs text-slate-500">Notes</p>
                      <p className="mt-1 text-xs text-slate-700">
                        {reason.trim()}
                      </p>
                    </div>
                  ) : null}
                </div>

                <div className="mt-3 flex items-center justify-between border-t border-slate-200 pt-3">
                  <span className="text-xs font-semibold text-slate-700">
                    Appointment Fee
                  </span>
                  <span className="text-sm font-bold text-emerald-700">
                    Free
                  </span>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setStep("details")}
                  className="flex-1 rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                >
                  Back
                </button>
                <button
                  type="button"
                  disabled={loading}
                  onClick={handleConfirmBooking}
                  className="flex-1 rounded-lg bg-[#0F9EA5] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#0c878d] disabled:cursor-not-allowed disabled:bg-slate-300"
                >
                  {loading ? "Booking..." : "Confirm Booking"}
                </button>
              </div>
            </div>
          ) : null}

          {step === "success" ? (
            <div className="space-y-4 py-2 text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/10">
                <CheckCircle2 className="h-8 w-8 text-emerald-600" />
              </div>

              <div>
                <h3 className="text-lg font-bold text-slate-900">
                  Appointment Requested
                </h3>
                <p className="mt-1 text-sm text-slate-600">
                  Your booking with{" "}
                  <span className="font-semibold text-slate-900">
                    Dr. {doctorName}
                  </span>{" "}
                  has been submitted.
                </p>
                <p className="mt-2 text-xs text-slate-500">
                  {formatDateForSummary(selectedDate)} at{" "}
                  {formatTimeLabel(selectedTime)}
                </p>
              </div>

              <p className="text-xs text-slate-500">
                Status:{" "}
                <span className="font-semibold text-amber-600">Pending</span> -
                waiting for doctor confirmation.
              </p>

              <button
                type="button"
                onClick={onClose}
                className="w-full rounded-lg bg-[#0F9EA5] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#0c878d]"
              >
                Done
              </button>
            </div>
          ) : null}
        </div>
      </section>
    </div>
  );
};

export default BookAppointmentModal;
