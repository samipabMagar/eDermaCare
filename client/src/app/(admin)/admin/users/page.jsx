"use client";

import { Users } from "lucide-react";
import AdminPageHeader from "@/components/admin/AdminPageHeader";
import UsersManagementTable from "@/components/admin/users/UsersManagementTable";

const AdminUsersPage = () => {
  return (
    <div className="space-y-4">
      <AdminPageHeader
        badge="User Management"
        icon={Users}
        title="Manage Users"
        description="Search, filter, and maintain user accounts with a clear and efficient admin workflow."
      />

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <UsersManagementTable />
      </div>
    </div>
  );
};

export default AdminUsersPage;
