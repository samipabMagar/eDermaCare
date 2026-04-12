"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { Loader2, Search, Trash2, Globe } from "lucide-react";
import { toast } from "react-toastify";
import ConfirmModal from "@/components/ui/ConfirmModal";
import { adminService } from "@/services/adminService";
import { resolveImageUrl } from "@/utils/products/productCardHelpers";

const BrandManagementTable = () => {
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [deletingId, setDeletingId] = useState(null);
  const [deleteModal, setDeleteModal] = useState({ show: false, brand: null });

  useEffect(() => {
    fetchBrands();
  }, []);

  const fetchBrands = async () => {
    try {
      setLoading(true);
      const data = await adminService.getBrands();
      setBrands(data);
    } catch (error) {
      toast.error(error.message || "Failed to load brands");
    } finally {
      setLoading(false);
    }
  };

  const filteredBrands = useMemo(() => {
    return brands.filter((brand) => {
      const bySearch =
        !search ||
        brand.name?.toLowerCase().includes(search.toLowerCase()) ||
        brand.description?.toLowerCase().includes(search.toLowerCase());

      const byStatus =
        status === ""
          ? true
          : status === "active"
            ? brand.is_active !== false
            : brand.is_active === false;

      return bySearch && byStatus;
    });
  }, [brands, search, status]);

  const confirmDelete = (brand) => {
    setDeleteModal({ show: true, brand });
  };

  const closeDeleteModal = () => {
    setDeleteModal({ show: false, brand: null });
  };

  const handleDelete = async () => {
    if (!deleteModal.brand) return;

    try {
      setDeletingId(deleteModal.brand.brand_id);
      await adminService.deleteBrand(deleteModal.brand.brand_id);
      setBrands((prev) =>
        prev.filter((item) => item.brand_id !== deleteModal.brand.brand_id),
      );
      closeDeleteModal();
      toast.success("Brand deleted successfully");
    } catch (error) {
      toast.error(error.message || "Failed to delete brand");
    } finally {
      setDeletingId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex h-72 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-(--brand-primary)" />
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-4">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 bg-slate-50/70 px-4 py-3">
        <div>
          <h3 className="text-sm font-semibold text-slate-900">
            Brands Directory
          </h3>
          <p className="text-xs text-slate-600">
            Total records: {filteredBrands.length}
          </p>
        </div>
      </div>

      <div className="mb-5 flex flex-wrap gap-4">
        <div className="min-w-64 flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-5 w-5 text-slate-400" />
            <input
              type="text"
              placeholder="Search by brand name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-lg border border-slate-300 py-2 pl-10 pr-4 text-sm text-slate-800 outline-none focus:border-(--brand-primary) focus:ring-2 focus:ring-(--brand-primary-soft)"
            />
          </div>
        </div>

        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="rounded-lg border border-slate-300 px-4 py-2 text-sm text-slate-700 outline-none focus:border-(--brand-primary) focus:ring-2 focus:ring-(--brand-primary-soft)"
        >
          <option value="">All Status</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
      </div>

      <div className="overflow-x-auto rounded-xl border border-slate-200">
        <table className="w-full text-left text-sm">
          <thead className="sticky top-0 bg-slate-100/90 backdrop-blur">
            <tr className="border-b border-slate-200">
              <th className="px-4 py-3 font-semibold text-slate-700">Brand</th>
              <th className="px-4 py-3 font-semibold text-slate-700">
                Website
              </th>
              <th className="px-4 py-3 font-semibold text-slate-700">Status</th>
              <th className="px-4 py-3 font-semibold text-slate-700">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {filteredBrands.length === 0 ? (
              <tr>
                <td
                  colSpan="4"
                  className="px-6 py-8 text-center text-slate-500"
                >
                  No brands found
                </td>
              </tr>
            ) : (
              filteredBrands.map((brand) => {
                const logoUrl = resolveImageUrl(brand.logo_url);

                return (
                  <tr
                    key={brand.brand_id}
                    className="border-b border-slate-200 last:border-b-0 hover:bg-slate-50"
                  >
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-3">
                        {logoUrl ? (
                          <img
                            src={logoUrl}
                            alt={brand.name}
                            className="h-12 w-12 rounded-lg border border-slate-200 object-cover"
                          />
                        ) : (
                          <div className="flex h-12 w-12 items-center justify-center rounded-lg border border-slate-200 bg-slate-100 text-sm font-semibold text-slate-500">
                            {brand.name?.charAt(0)?.toUpperCase() || "B"}
                          </div>
                        )}
                        <div>
                          <p className="font-semibold text-slate-900">
                            {brand.name}
                          </p>
                          <p className="line-clamp-1 text-xs text-slate-500">
                            {brand.description || "No description"}
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="px-4 py-4">
                      {brand.website_url ? (
                        <Link
                          href={brand.website_url}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 text-slate-700 transition hover:text-(--brand-primary)"
                        >
                          <Globe className="h-4 w-4" />
                          Visit
                        </Link>
                      ) : (
                        <span className="text-slate-400">N/A</span>
                      )}
                    </td>

                    <td className="px-4 py-4">
                      <span
                        className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${
                          brand.is_active !== false
                            ? "bg-emerald-100 text-emerald-700"
                            : "bg-slate-200 text-slate-700"
                        }`}
                      >
                        {brand.is_active !== false ? "Active" : "Inactive"}
                      </span>
                    </td>

                    <td className="px-4 py-4">
                      <button
                        type="button"
                        onClick={() => confirmDelete(brand)}
                        disabled={deletingId === brand.brand_id}
                        className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-rose-600 text-white transition hover:bg-rose-700 disabled:opacity-50"
                        title="Delete brand"
                        aria-label="Delete brand"
                      >
                        {deletingId === brand.brand_id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Trash2 className="h-4 w-4" />
                        )}
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      <ConfirmModal
        isOpen={deleteModal.show}
        title="Confirm Delete"
        message={`Are you sure you want to delete ${deleteModal.brand?.name || "this brand"}?`}
        confirmText="Delete"
        cancelText="Cancel"
        isLoading={Boolean(deletingId)}
        onConfirm={handleDelete}
        onCancel={closeDeleteModal}
      />
    </div>
  );
};

export default BrandManagementTable;
