"use client";

import { CalendarCheck2 } from "lucide-react";
import AdminPageHeader from "@/components/admin/AdminPageHeader";
import AppointmentsManagementTable from "@/components/admin/appointments/AppointmentsManagementTable";

const AdminAppointmentsPage = () => {
  return (
    <div className="space-y-4">
      <AdminPageHeader
        badge="Appointments"
        icon={CalendarCheck2}
        title="Manage Appointments"
        description="Review all appointments across the platform with quick filters for doctor, patient, status, and date range."
      />

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <AppointmentsManagementTable />
      </div>
    </div>
  );
};

export default AdminAppointmentsPage;
