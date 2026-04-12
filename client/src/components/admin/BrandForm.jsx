"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { useDropzone } from "react-dropzone";
import { toast } from "react-toastify";
import Image from "next/image";
import { X } from "lucide-react";
import { adminService } from "@/services/adminService";
import { ROUTES } from "@/constants/routes";

const BrandForm = () => {
  const router = useRouter();
  const [isSaving, setIsSaving] = useState(false);
  const [selectedLogo, setSelectedLogo] = useState(null);

  const { register, handleSubmit } = useForm({
    defaultValues: {
      name: "",
      description: "",
      website_url: "",
      is_active: true,
    },
  });

  const { getRootProps, getInputProps } = useDropzone({
    onDrop: (acceptedFiles) => {
      setSelectedLogo(acceptedFiles[0] || null);
    },
    accept: {
      "image/jpeg": [".jpeg", ".jpg"],
      "image/png": [".png"],
      "image/webp": [".webp"],
      "image/gif": [".gif"],
    },
    maxFiles: 1,
    maxSize: 5 * 1024 * 1024,
  });

  const submitForm = async (values) => {
    const formData = new FormData();
    formData.append("name", values.name.trim());

    if (values.description?.trim()) {
      formData.append("description", values.description.trim());
    }

    if (values.website_url?.trim()) {
      formData.append("website_url", values.website_url.trim());
    }

    formData.append("is_active", String(Boolean(values.is_active)));

    if (selectedLogo) {
      formData.append("logo", selectedLogo);
    }

    try {
      setIsSaving(true);
      await adminService.createBrand(formData);
      toast.success("Brand created successfully");
      router.push(ROUTES.ADMIN_BRANDS);
      router.refresh();
    } catch (error) {
      toast.error(error.message || "Failed to create brand");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(submitForm)}>
      <div className="grid gap-4 sm:grid-cols-2 sm:gap-6">
        <div className="sm:col-span-2">
          <label className="mb-2 block text-sm font-medium text-slate-700">
            Brand Name *
          </label>
          <input
            type="text"
            required
            placeholder="Enter brand name"
            className="block w-full rounded-lg border border-slate-300 bg-slate-50 p-2.5 text-sm text-slate-900 outline-none focus:border-(--brand-primary) focus:ring-2 focus:ring-(--brand-primary-soft)"
            {...register("name")}
          />
        </div>

        <div className="sm:col-span-2">
          <label className="mb-2 block text-sm font-medium text-slate-700">
            Description
          </label>
          <textarea
            rows={4}
            placeholder="Short description about this brand"
            className="block w-full rounded-lg border border-slate-300 bg-slate-50 p-2.5 text-sm text-slate-900 outline-none focus:border-(--brand-primary) focus:ring-2 focus:ring-(--brand-primary-soft)"
            {...register("description")}
          />
        </div>

        <div className="sm:col-span-2">
          <label className="mb-2 block text-sm font-medium text-slate-700">
            Brand Logo
          </label>

          <div
            {...getRootProps()}
            className="flex w-full items-center justify-center"
          >
            <div className="flex w-full cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed border-slate-300 bg-slate-50 transition hover:bg-slate-100">
              <div className="flex flex-col items-center justify-center py-8 text-slate-500">
                <svg
                  className="mb-3 h-8 w-8"
                  xmlns="http://www.w3.org/2000/svg"
                  width={24}
                  height={24}
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 17h3a3 3 0 0 0 0-6h-.025a5.56 5.56 0 0 0 .025-.5A5.5 5.5 0 0 0 7.207 9.021C7.137 9.017 7.071 9 7 9a4 4 0 1 0 0 8h2.167M12 19v-9m0 0-2 2m2-2 2 2"
                  />
                </svg>
                <p className="mb-2 text-sm text-slate-700">
                  <span className="font-semibold">Click to upload</span> or drag
                  and drop
                </p>
                <p className="text-xs">
                  .png, .jpg, .jpeg, .webp, .gif (Max 5MB)
                </p>
              </div>
              <input {...getInputProps()} type="file" />
            </div>
          </div>

          {selectedLogo ? (
            <div className="mt-4 flex items-center gap-4 rounded-lg border border-slate-200 bg-white p-2.5">
              <Image
                className="h-14 w-14 rounded object-cover"
                src={URL.createObjectURL(selectedLogo)}
                width={56}
                height={56}
                alt="Brand logo preview"
              />
              <div className="flex-1">
                <h4 className="text-sm font-medium text-slate-800">
                  {selectedLogo.name}
                </h4>
                <span className="text-sm text-slate-500">
                  {Math.round(selectedLogo.size / 1024)} KB
                </span>
              </div>
              <button
                type="button"
                onClick={() => setSelectedLogo(null)}
                className="cursor-pointer rounded bg-red-500 p-2 text-white transition hover:bg-red-600"
              >
                <X size={18} />
              </button>
            </div>
          ) : null}
        </div>

        <div className="sm:col-span-2">
          <label className="mb-2 block text-sm font-medium text-slate-700">
            Website URL
          </label>
          <input
            type="url"
            placeholder="https://example.com"
            className="block w-full rounded-lg border border-slate-300 bg-slate-50 p-2.5 text-sm text-slate-900 outline-none focus:border-(--brand-primary) focus:ring-2 focus:ring-(--brand-primary-soft)"
            {...register("website_url")}
          />
        </div>

        <div className="sm:col-span-2">
          <label className="inline-flex cursor-pointer items-center gap-2 text-sm font-medium text-slate-700">
            <input
              type="checkbox"
              className="h-4 w-4 rounded border-slate-300 text-(--brand-primary) focus:ring-(--brand-primary)"
              {...register("is_active")}
            />
            Mark this brand as active
          </label>
        </div>
      </div>

      <div className="mt-6 flex items-center gap-3">
        <button
          type="submit"
          disabled={isSaving}
          className="inline-flex cursor-pointer items-center rounded-lg bg-(--brand-primary) px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-(--brand-primary-hover) disabled:opacity-50"
        >
          {isSaving ? "Saving..." : "Create Brand"}
        </button>
      </div>
    </form>
  );
};

export default BrandForm;
