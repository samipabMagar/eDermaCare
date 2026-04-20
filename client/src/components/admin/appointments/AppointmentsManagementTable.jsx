"use client";

import { useEffect, useMemo, useState } from "react";
import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Filter,
  Loader2,
  Search,
  UserRound,
} from "lucide-react";
import { toast } from "react-toastify";
import { adminService } from "@/services/adminService";
import AppointmentDetailsModal from "@/components/appointments/AppointmentDetailsModal";

const PAGE_SIZE = 10;

const APPOINTMENT_STATUSES = [
  "pending",
  "confirmed",
  "completed",
  "cancelled",
  "rejected",
];

const statusClassMap = {
  pending: "bg-amber-100 text-amber-700",
  confirmed: "bg-sky-100 text-sky-700",
  completed: "bg-emerald-100 text-emerald-700",
  cancelled: "bg-rose-100 text-rose-700",
  rejected: "bg-slate-200 text-slate-700",
};

const formatStatus = (value = "") => {
  if (!value) return "Unknown";
  return value.charAt(0).toUpperCase() + value.slice(1);
};

const formatDateTime = (value) => {
  if (!value) return "-";

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return "-";

  return parsed.toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
};

const AppointmentsManagementTable = () => {
  const [appointments, setAppointments] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);

  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");

  const [statusFilter, setStatusFilter] = useState("");
  const [doctorFilter, setDoctorFilter] = useState("");
  const [patientFilter, setPatientFilter] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  const [sortBy, setSortBy] = useState("scheduled_at");
  const [sortOrder, setSortOrder] = useState("DESC");

  const [page, setPage] = useState(1);
  const [selectedAppointmentId, setSelectedAppointmentId] = useState(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      setSearch(searchInput.trim());
      setPage(1);
    }, 350);

    return () => clearTimeout(timer);
  }, [searchInput]);

  const fetchAppointments = async () => {
    try {
      setLoading(true);

      const response = await adminService.getAdminAppointments({
        page,
        limit: PAGE_SIZE,
        status: statusFilter,
        doctor: doctorFilter.trim(),
        patient: patientFilter.trim(),
        from: fromDate || undefined,
        to: toDate || undefined,
        search,
        sortBy,
        sortOrder,
      });

      setAppointments(response.appointments || []);
      setPagination(response.pagination || null);
    } catch (error) {
      toast.error(error.message || "Failed to load appointments");
      setAppointments([]);
      setPagination(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, [
    page,
    statusFilter,
    doctorFilter,
    patientFilter,
    fromDate,
    toDate,
    search,
    sortBy,
    sortOrder,
  ]);

  const summary = useMemo(() => {
    const total = Number(pagination?.total || appointments.length || 0);
    const pending = appointments.filter(
      (item) => item.status === "pending",
    ).length;
    const confirmed = appointments.filter(
      (item) => item.status === "confirmed",
    ).length;

    return {
      total,
      pending,
      confirmed,
    };
  }, [appointments, pagination]);

  const totalPages = Number(pagination?.totalPages || 1);

  const clearFilters = () => {
    setStatusFilter("");
    setDoctorFilter("");
    setPatientFilter("");
    setFromDate("");
    setToDate("");
    setSearchInput("");
    setSearch("");
    setSortBy("scheduled_at");
    setSortOrder("DESC");
    setPage(1);
  };

  if (loading) {
    return (
      <div className="flex h-72 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-(--brand-primary)" />
      </div>
    );
  }

  return (
    <div className="space-y-5 p-4 sm:p-5">
      <div className="grid grid-cols-1 gap-3 rounded-xl border border-slate-200 bg-linear-to-r from-slate-50 to-cyan-50/50 px-4 py-4 sm:grid-cols-3">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
            Total Appointments
          </p>
          <p className="mt-1 text-2xl font-bold text-slate-900">
            {summary.total}
          </p>
        </div>
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
            Pending On Page
          </p>
          <p className="mt-1 text-2xl font-bold text-amber-600">
            {summary.pending}
          </p>
        </div>
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
            Confirmed On Page
          </p>
          <p className="mt-1 text-2xl font-bold text-sky-600">
            {summary.confirmed}
          </p>
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 sm:p-4">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="inline-flex items-center gap-2 text-sm font-semibold text-slate-800">
            <Filter className="h-4 w-4 text-slate-500" />
            Filters
          </h3>
          <button
            type="button"
            onClick={clearFilters}
            className="text-xs font-semibold text-slate-600 hover:text-slate-900"
          >
            Clear all
          </button>
        </div>

        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
          <div className="xl:col-span-2">
            <div className="relative">
              <Search className="absolute left-3 top-3.5 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search doctor/patient name or email"
                value={searchInput}
                onChange={(event) => setSearchInput(event.target.value)}
                className="w-full rounded-lg border border-slate-300 bg-white py-2.5 pl-9 pr-3 text-sm text-slate-800 outline-none focus:border-(--brand-primary) focus:ring-2 focus:ring-(--brand-primary-soft)"
              />
            </div>
          </div>

          <select
            value={statusFilter}
            onChange={(event) => {
              setStatusFilter(event.target.value);
              setPage(1);
            }}
            className="rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none focus:border-(--brand-primary) focus:ring-2 focus:ring-(--brand-primary-soft)"
          >
            <option value="">All Status</option>
            {APPOINTMENT_STATUSES.map((status) => (
              <option key={status} value={status}>
                {formatStatus(status)}
              </option>
            ))}
          </select>

          <select
            value={`${sortBy}:${sortOrder}`}
            onChange={(event) => {
              const [nextSortBy, nextSortOrder] = event.target.value.split(":");
              setSortBy(nextSortBy);
              setSortOrder(nextSortOrder);
              setPage(1);
            }}
            className="rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none focus:border-(--brand-primary) focus:ring-2 focus:ring-(--brand-primary-soft)"
          >
            <option value="scheduled_at:DESC">Scheduled (Newest)</option>
            <option value="scheduled_at:ASC">Scheduled (Oldest)</option>
            <option value="created_at:DESC">Created (Newest)</option>
            <option value="created_at:ASC">Created (Oldest)</option>
            <option value="status:ASC">Status (A-Z)</option>
          </select>

          <input
            type="text"
            placeholder="Doctor name or email"
            value={doctorFilter}
            onChange={(event) => {
              setDoctorFilter(event.target.value);
              setPage(1);
            }}
            className="rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-800 outline-none focus:border-(--brand-primary) focus:ring-2 focus:ring-(--brand-primary-soft)"
          />

          <input
            type="text"
            placeholder="Patient name or email"
            value={patientFilter}
            onChange={(event) => {
              setPatientFilter(event.target.value);
              setPage(1);
            }}
            className="rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-800 outline-none focus:border-(--brand-primary) focus:ring-2 focus:ring-(--brand-primary-soft)"
          />

          <input
            type="date"
            value={fromDate}
            onChange={(event) => {
              setFromDate(event.target.value);
              setPage(1);
            }}
            className="rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-800 outline-none focus:border-(--brand-primary) focus:ring-2 focus:ring-(--brand-primary-soft)"
          />

          <input
            type="date"
            value={toDate}
            onChange={(event) => {
              setToDate(event.target.value);
              setPage(1);
            }}
            className="rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-800 outline-none focus:border-(--brand-primary) focus:ring-2 focus:ring-(--brand-primary-soft)"
          />
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-slate-200">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Appointment
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Patient
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Doctor
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Status
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Created
                </th>
                <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Action
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100 bg-white">
              {!appointments.length ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-4 py-12 text-center text-sm text-slate-500"
                  >
                    No appointments found for the selected filters.
                  </td>
                </tr>
              ) : (
                appointments.map((appointment) => {
                  const statusClass =
                    statusClassMap[appointment.status] ||
                    "bg-slate-100 text-slate-700";

                  return (
                    <tr
                      key={appointment.appointment_id}
                      className="hover:bg-slate-50/70"
                    >
                      <td className="px-4 py-3 align-top">
                        <div className="text-sm font-semibold text-slate-900">
                          #{appointment.appointment_id}
                        </div>
                        <p className="mt-1 inline-flex items-center gap-1 text-xs text-slate-600">
                          <CalendarDays className="h-3.5 w-3.5 text-slate-400" />
                          {formatDateTime(appointment.scheduled_at)}
                        </p>
                      </td>

                      <td className="px-4 py-3 align-top">
                        <p className="text-sm font-medium text-slate-900">
                          {appointment.patient?.full_name || "N/A"}
                        </p>
                        <p className="mt-1 text-xs text-slate-500">
                          {appointment.patient?.email || "N/A"}
                        </p>
                      </td>

                      <td className="px-4 py-3 align-top">
                        <p className="text-sm font-medium text-slate-900">
                          {appointment.doctor?.full_name || "N/A"}
                        </p>
                        <p className="mt-1 text-xs text-slate-500">
                          {appointment.doctor?.email || "N/A"}
                        </p>
                      </td>

                      <td className="px-4 py-3 align-top">
                        <span
                          className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${statusClass}`}
                        >
                          {formatStatus(appointment.status)}
                        </span>
                      </td>

                      <td className="px-4 py-3 align-top text-sm text-slate-600">
                        {formatDateTime(appointment.created_at)}
                      </td>

                      <td className="px-4 py-3 align-top text-right">
                        <button
                          type="button"
                          onClick={() =>
                            setSelectedAppointmentId(appointment.appointment_id)
                          }
                          className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-100"
                        >
                          <UserRound className="h-3.5 w-3.5" />
                          View
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-xs text-slate-500">
          Page {pagination?.page || 1} of {totalPages} (
          {pagination?.total || appointments.length || 0} total)
        </p>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setPage((prev) => Math.max(1, prev - 1))}
            disabled={!pagination?.hasPrevPage}
            className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <ChevronLeft className="h-3.5 w-3.5" />
            Previous
          </button>

          <button
            type="button"
            onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))}
            disabled={!pagination?.hasNextPage}
            className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Next
            <ChevronRight className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      <AppointmentDetailsModal
        open={Boolean(selectedAppointmentId)}
        appointmentId={selectedAppointmentId}
        onClose={() => setSelectedAppointmentId(null)}
        viewerRole="admin"
      />
    </div>
  );
};

export default AppointmentsManagementTable;
