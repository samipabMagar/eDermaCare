"use client";

import { Factory } from "lucide-react";
import AdminPageHeader from "@/components/admin/AdminPageHeader";
import BrandForm from "@/components/admin/BrandForm";

const CreateBrandPage = () => {
  return (
    <div className="space-y-2">
      <AdminPageHeader
        badge="Create Brand"
        icon={Factory}
        title="Add New Brand"
        description="Create a skincare brand so it can be assigned to products and showcased across the platform."
      />

      <div className="w-full max-w-4xl rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <BrandForm />
      </div>
    </div>
  );
};

export default CreateBrandPage;
