"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Calendar, Clock3 } from "lucide-react";
import { toast } from "react-toastify";
import { treatmentService } from "@/services/treatmentService";
import { TREATMENTS_ROUTE } from "@/constants/routes";

const tabs = ["All", "Pending", "Approved", "Rejected"];

const statusClasses = {
  pending: "bg-blue-50 text-blue-700 border-blue-200",
  approved: "bg-emerald-50 text-emerald-700 border-emerald-200",
  rejected: "bg-rose-50 text-rose-700 border-rose-200",
};

export default function DashboardTreatmentsPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [bookings, setBookings] = useState([]);
  const [activeTab, setActiveTab] = useState("All");

  useEffect(() => {
    const loadBookings = async () => {
      try {
        setIsLoading(true);
        const data = await treatmentService.getMyTreatmentBookings();
        setBookings(Array.isArray(data) ? data : []);
      } catch (error) {
        toast.error(error.message || "Failed to load treatment bookings");
      } finally {
        setIsLoading(false);
      }
    };

    loadBookings();
  }, []);

  const filteredBookings = useMemo(() => {
    return bookings.filter((booking) => {
      const status = String(booking.status || "").toLowerCase();
      return activeTab === "All" || status === activeTab.toLowerCase();
    });
  }, [activeTab, bookings]);

  if (isLoading) {
    return (
      <p className="p-6 text-sm text-slate-500">
        Loading treatment bookings...
      </p>
    );
  }

  return (
    <div className="space-y-6 px-4 py-4 sm:px-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-slate-900">My Treatments</h1>
          <p className="mt-1 text-sm text-slate-500">
            Track your treatment booking requests and their approval status.
          </p>
        </div>
        <Link
          href={TREATMENTS_ROUTE}
          className="rounded-xl bg-[#0F9EA5] px-4 py-2.5 text-sm font-medium text-white hover:bg-[#0c878d]"
        >
          Book Treatment
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
        {filteredBookings.map((booking) => {
          const normalizedStatus = String(booking.status || "").toLowerCase();
          const badgeClass =
            statusClasses[normalizedStatus] || statusClasses.pending;

          return (
            <article
              key={booking.treatment_appointment_id}
              className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
            >
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                  <div className="mb-1 flex flex-wrap items-center gap-2">
                    <p className="text-sm font-semibold text-slate-900">
                      {booking.treatment?.name || "Treatment"}
                    </p>
                    <span
                      className={`rounded-full border px-2.5 py-0.5 text-xs font-medium ${badgeClass}`}
                    >
                      {booking.status}
                    </span>
                  </div>

                  <div className="mt-2 flex flex-wrap items-center gap-4 text-xs text-slate-500">
                    <span className="inline-flex items-center gap-1">
                      <Calendar className="h-3.5 w-3.5" />
                      {new Date(booking.session_date).toLocaleDateString()}
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <Clock3 className="h-3.5 w-3.5" />
                      {new Date(booking.session_date).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>

                  {booking.user_notes ? (
                    <p className="mt-2 text-sm text-slate-600">
                      Notes: {booking.user_notes}
                    </p>
                  ) : null}

                  {booking.status === "rejected" && booking.rejection_reason ? (
                    <p className="mt-2 text-sm text-rose-600">
                      Rejection reason: {booking.rejection_reason}
                    </p>
                  ) : null}
                </div>
              </div>
            </article>
          );
        })}

        {filteredBookings.length === 0 && (
          <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center">
            <p className="text-sm font-medium text-slate-600">
              No treatment bookings found.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
