"use client";

import Link from "next/link";
import { Factory, Plus, ShoppingBag } from "lucide-react";
import { ROUTES } from "@/constants/routes";
import AdminPageHeader from "@/components/admin/AdminPageHeader";
import ProductManagementTable from "@/components/admin/ProductManagementTable";

const AdminProductsPage = () => {
  return (
    <div className="space-y-3">
      <AdminPageHeader
        badge="Product Management"
        icon={ShoppingBag}
        title="Manage Product Catalog"
        description="Create new products and keep your catalog clean, updated, and organized for users."
        action={
          <div className="flex items-center gap-2">
            <Link
              href={ROUTES.ADMIN_BRANDS_NEW}
              className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:border-(--brand-primary) hover:text-(--brand-primary)"
            >
              <Factory size={18} />
              Add Brand
            </Link>
            <Link
              href={ROUTES.ADMIN_PRODUCTS_NEW}
              className="inline-flex items-center gap-2 rounded-lg bg-(--brand-primary) px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-(--brand-primary-hover)"
            >
              <Plus size={20} />
              Add New Product
            </Link>
          </div>
        }
      />

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <ProductManagementTable />
      </div>
    </div>
  );
};

export default AdminProductsPage;
