"use client";

import { CreditCard } from "lucide-react";
import AdminPageHeader from "@/components/admin/AdminPageHeader";
import TransactionManagementTable from "@/components/admin/TransactionManagementTable";

const AdminTransactionsPage = () => {
  return (
    <div className="space-y-4">
      <AdminPageHeader
        badge="Transaction Management"
        icon={CreditCard}
        title="Manage Transactions"
        description="View all payment transactions, track payment status, and manage refunds from one clear workspace."
      />

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <TransactionManagementTable />
      </div>
    </div>
  );
};

export default AdminTransactionsPage;
