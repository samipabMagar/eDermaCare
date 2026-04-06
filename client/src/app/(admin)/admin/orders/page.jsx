"use client";

import { ShoppingBag } from "lucide-react";
import AdminPageHeader from "@/components/admin/AdminPageHeader";
import OrderManagementTable from "@/components/admin/orders/OrderManagementTable";

const AdminOrdersPage = () => {
  return (
    <div className="space-y-4">
      <AdminPageHeader
        badge="Order Management"
        icon={ShoppingBag}
        title="Manage Orders"
        description="Track customer orders, apply filters quickly, and update order progress from one clear workspace."
      />

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <OrderManagementTable />
      </div>
    </div>
  );
};

export default AdminOrdersPage;
