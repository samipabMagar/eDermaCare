"use client";

import Link from "next/link";
import { Factory, Plus } from "lucide-react";
import { ROUTES } from "@/constants/routes";
import AdminPageHeader from "@/components/admin/AdminPageHeader";
import BrandManagementTable from "@/components/admin/BrandManagementTable";

const AdminBrandsPage = () => {
  return (
    <div className="space-y-3">
      <AdminPageHeader
        badge="Brand Management"
        icon={Factory}
        title="Manage Brands"
        description="Review all skincare brands, verify details, and keep your brand directory organized."
        action={
          <Link
            href={ROUTES.ADMIN_BRANDS_NEW}
            className="inline-flex items-center gap-2 rounded-lg bg-(--brand-primary) px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-(--brand-primary-hover)"
          >
            <Plus size={20} />
            Add New Brand
          </Link>
        }
      />

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <BrandManagementTable />
      </div>
    </div>
  );
};

export default AdminBrandsPage;
