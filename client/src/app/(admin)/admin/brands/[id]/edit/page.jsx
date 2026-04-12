"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Factory, Loader2 } from "lucide-react";
import { toast } from "react-toastify";
import AdminPageHeader from "@/components/admin/AdminPageHeader";
import BrandForm from "@/components/admin/BrandForm";
import { adminService } from "@/services/adminService";

const EditBrandPage = () => {
  const params = useParams();
  const brandId = params?.id;

  const [brand, setBrand] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchBrand = async () => {
      try {
        setIsLoading(true);
        const data = await adminService.getBrandById(brandId);
        setBrand(data);
      } catch (error) {
        toast.error(error.message || "Failed to load brand");
      } finally {
        setIsLoading(false);
      }
    };

    if (brandId) {
      fetchBrand();
    }
  }, [brandId]);

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-(--brand-primary)" />
      </div>
    );
  }

  if (!brand) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white p-6 text-sm text-slate-600">
        Brand not found.
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <AdminPageHeader
        badge="Edit Brand"
        icon={Factory}
        title={`Update ${brand.name}`}
        description="Update brand details, logo, status, and website information."
      />

      <div className="w-full max-w-4xl rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <BrandForm brand={brand} />
      </div>
    </div>
  );
};

export default EditBrandPage;
