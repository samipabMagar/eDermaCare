"use client";

import { ClipboardList } from "lucide-react";
import AdminPageHeader from "@/components/admin/AdminPageHeader";
import TreatmentManagementTable from "@/components/admin/TreatmentManagementTable";

const AdminTreatmentsPage = () => {
  return (
    <div className="space-y-3">
      <AdminPageHeader
        badge="Treatment Management"
        icon={ClipboardList}
        title="Manage Treatments"
        description="Create, review, and maintain treatment offerings from one dashboard."
      />

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <TreatmentManagementTable />
      </div>
    </div>
  );
};

export default AdminTreatmentsPage;
