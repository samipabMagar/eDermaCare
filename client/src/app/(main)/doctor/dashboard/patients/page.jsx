"use client";

import { useMemo, useState } from "react";
import { useCallback, useEffect } from "react";
import { Loader2, Mail, Phone, CalendarDays, BarChart3 } from "lucide-react";
import DoctorSectionHeader from "@/components/doctor/dashboard/DoctorSectionHeader";
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

const DoctorPatientsPage = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  const loadAppointments = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      const data = await appointmentService.getMyAppointments();
      setAppointments(Array.isArray(data) ? data : []);
    } catch (loadError) {
      setError(loadError.message || "Failed to load patients");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAppointments();
  }, [loadAppointments]);

  const patients = useMemo(() => {
    const patientMap = new Map();

    appointments.forEach((appointment) => {
      const patient = appointment.patient || {};
      const patientId = patient.user_id || patient.id || patient.email || null;

      if (patientId) {
        if (!patientMap.has(patientId)) {
          patientMap.set(patientId, {
            id: patientId,
            name: patient.full_name || "Unknown Patient",
            email: patient.email || "-",
            phone: patient.phone || "-",
            appointments: [],
          });
        }

        patientMap.get(patientId).appointments.push(appointment);
      }
    });

    const uniquePatients = Array.from(patientMap.values()).map((patient) => ({
      ...patient,
      totalAppointments: patient.appointments.length,
      lastAppointmentDate: patient.appointments
        .map((a) => new Date(a.scheduled_at))
        .sort((a, b) => b - a)[0],
      completedAppointments: patient.appointments.filter(
        (a) => String(a.status || "").toLowerCase() === "completed",
      ).length,
    }));

    if (searchTerm.trim()) {
      return uniquePatients.filter(
        (patient) =>
          patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          patient.email.toLowerCase().includes(searchTerm.toLowerCase()),
      );
    }

    return uniquePatients;
  }, [appointments, searchTerm]);

  const stats = useMemo(() => {
    const uniquePatientSet = new Set(
      appointments
        .map((item) => {
          const patient = item.patient || {};
          return (
            patient.user_id ||
            patient.id ||
            patient.email ||
            item.patient_user_id ||
            null
          );
        })
        .filter(Boolean),
    );

    const totalCompletedAppointments = appointments.filter(
      (item) => String(item.status || "").toLowerCase() === "completed",
    ).length;

    return [
      {
        label: "Total Patients",
        value: String(uniquePatientSet.size),
        icon: BarChart3,
        color: "bg-blue-100 text-blue-700",
      },
      {
        label: "Total Appointments",
        value: String(appointments.length),
        icon: CalendarDays,
        color: "bg-teal-100 text-teal-700",
      },
      {
        label: "Completed Sessions",
        value: String(totalCompletedAppointments),
        icon: BarChart3,
        color: "bg-green-100 text-green-700",
      },
    ];
  }, [appointments]);

  return (
    <div className="mx-auto w-full max-w-6xl space-y-6">
      <DoctorSectionHeader
        title="My Patients"
        subtitle="View all patients who have booked appointments with you"
        rightSlot={
          <div className="text-right">
            <p className="text-2xl font-bold text-slate-900">
              {patients.length}
            </p>
            <p className="text-xs text-slate-500">Total patients</p>
          </div>
        }
      />

      {/* Stats Overview */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {stats.map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <div
              key={idx}
              className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs font-medium text-slate-500">
                    {stat.label}
                  </p>
                  <p className="mt-1 text-2xl font-bold text-slate-900">
                    {stat.value}
                  </p>
                </div>
                <div className={`rounded-xl p-2.5 ${stat.color}`}>
                  <Icon className="h-5 w-5" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Search */}
      <div className="rounded-2xl border border-slate-200 bg-white p-4">
        <input
          type="text"
          placeholder="Search patients by name or email..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm placeholder-slate-400 transition focus:border-[#2FA4A9] focus:outline-none focus:ring-1 focus:ring-[#2FA4A9]"
        />
      </div>

      {/* Patients List */}
      {loading ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-6 text-sm text-slate-600">
          <span className="inline-flex items-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin" /> Loading patients...
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
          {!patients.length ? (
            <div className="rounded-2xl border border-slate-200 bg-white p-6 text-center text-sm text-slate-500">
              {searchTerm.trim()
                ? "No patients found matching your search."
                : "No patients found. Appointments will appear here once patients book with you."}
            </div>
          ) : (
            patients.map((patient) => (
              <div
                key={patient.id}
                className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:shadow-md"
              >
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                  <div className="space-y-2 md:flex-1">
                    <div>
                      <p className="text-sm font-semibold text-slate-900">
                        {patient.name}
                      </p>
                      <div className="mt-2 flex flex-wrap items-center gap-4 text-xs text-slate-500">
                        {patient.email !== "-" && (
                          <span className="inline-flex items-center gap-1">
                            <Mail className="h-3.5 w-3.5" />
                            {patient.email}
                          </span>
                        )}
                        {patient.phone !== "-" && (
                          <span className="inline-flex items-center gap-1">
                            <Phone className="h-3.5 w-3.5" />
                            {patient.phone}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center justify-end gap-6 md:gap-8">
                    <div className="text-right">
                      <p className="text-xs font-medium text-slate-500">
                        Total Appointments
                      </p>
                      <p className="mt-1 text-lg font-bold text-slate-900">
                        {patient.totalAppointments}
                      </p>
                    </div>

                    {patient.completedAppointments > 0 && (
                      <div className="text-right">
                        <p className="text-xs font-medium text-slate-500">
                          Completed Sessions
                        </p>
                        <p className="mt-1 text-lg font-bold text-emerald-600">
                          {patient.completedAppointments}
                        </p>
                      </div>
                    )}

                    {patient.lastAppointmentDate && (
                      <div className="text-right">
                        <p className="text-xs font-medium text-slate-500">
                          Last Appointment
                        </p>
                        <p className="mt-1 text-sm font-semibold text-slate-600">
                          {formatDate(patient.lastAppointmentDate)}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      ) : null}
    </div>
  );
};

export default DoctorPatientsPage;
