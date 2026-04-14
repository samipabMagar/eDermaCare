"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { useDropzone } from "react-dropzone";
import { toast } from "react-toastify";
import {
  ChevronLeft,
  ChevronRight,
  Clock,
  Edit,
  Eye,
  Loader2,
  Plus,
  Search,
  Trash2,
  Users,
  X,
} from "lucide-react";
import { adminService } from "@/services/adminService";
import ConfirmModal from "@/components/ui/ConfirmModal";
import { resolveImageUrl } from "@/utils/products/productCardHelpers";

const initialForm = {
  name: "",
  description: "",
  price: "",
  benefit_tags: "",
  duration_minutes: "",
  is_active: true,
};

const PAGE_SIZE = 10;

const statusColor = {
  Active: "bg-emerald-500/10 text-emerald-700",
  Discontinued: "bg-slate-200 text-slate-700",
};

const toTagArray = (value = "") =>
  value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);

const TreatmentManagementTable = () => {
  const [treatments, setTreatments] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editingTreatment, setEditingTreatment] = useState(null);
  const [form, setForm] = useState(initialForm);
  const [selectedImage, setSelectedImage] = useState(null);
  const [viewingTreatment, setViewingTreatment] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState({
    open: false,
    treatment: null,
  });

  const loadData = async () => {
    try {
      setLoading(true);
      const [treatmentResult, allBookings] = await Promise.all([
        adminService.getTreatments({
          page,
          limit: PAGE_SIZE,
          search: search.trim(),
          sort: "name",
        }),
        adminService.getTreatmentBookings({ limit: 200 }),
      ]);

      setTreatments(treatmentResult.treatments);
      setPagination(treatmentResult.pagination);
      setBookings(allBookings);
    } catch (error) {
      toast.error(error.message || "Failed to load treatments");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [page, search]);

  const statsByTreatmentId = useMemo(() => {
    const map = new Map();

    bookings.forEach((booking) => {
      const treatmentId = booking.treatment_id;
      const current = map.get(treatmentId) || {
        activePlans: 0,
        completedPlans: 0,
      };

      if (["pending", "approved"].includes(booking.status)) {
        current.activePlans += 1;
      }

      if (
        booking.status === "approved" &&
        new Date(booking.session_date) < new Date()
      ) {
        current.completedPlans += 1;
      }

      map.set(treatmentId, current);
    });

    return map;
  }, [bookings]);

  const rows = useMemo(() => {
    return treatments.map((treatment) => {
      const stats = statsByTreatmentId.get(treatment.treatment_id) || {
        activePlans: 0,
        completedPlans: 0,
      };

      return {
        ...treatment,
        doctor: "Assigned by booking",
        avgDuration: treatment.duration_minutes
          ? `${treatment.duration_minutes} min`
          : "N/A",
        activePlans: stats.activePlans,
        completedPlans: stats.completedPlans,
        status: treatment.is_active === false ? "Discontinued" : "Active",
      };
    });
  }, [statsByTreatmentId, treatments]);

  const onDrop = useCallback((acceptedFiles) => {
    setSelectedImage(acceptedFiles[0] || null);
  }, []);

  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    accept: {
      "image/jpeg": [".jpeg", ".jpg"],
      "image/png": [".png"],
      "image/webp": [".webp"],
      "image/gif": [".gif"],
    },
    maxFiles: 1,
    maxSize: 5 * 1024 * 1024,
  });

  const openCreateModal = () => {
    setEditingTreatment(null);
    setForm(initialForm);
    setSelectedImage(null);
    setIsModalOpen(true);
  };

  const openEditModal = (treatment) => {
    setEditingTreatment(treatment);
    setForm({
      name: treatment.name || "",
      description: treatment.description || "",
      price:
        treatment.price !== null && treatment.price !== undefined
          ? String(treatment.price)
          : "",
      benefit_tags: Array.isArray(treatment.benefit_tags)
        ? treatment.benefit_tags.join(", ")
        : "",
      duration_minutes: treatment.duration_minutes
        ? String(treatment.duration_minutes)
        : "",
      is_active: treatment.is_active !== false,
    });
    setSelectedImage(null);
    setIsModalOpen(true);
  };

  const handleSaveTreatment = async () => {
    if (!form.name.trim()) {
      toast.error("Treatment name is required");
      return;
    }

    if (!form.duration_minutes) {
      toast.error("Duration in minutes is required");
      return;
    }

    if (!form.price) {
      toast.error("Price is required");
      return;
    }

    const durationValue = Number(form.duration_minutes);
    if (!Number.isInteger(durationValue) || durationValue <= 0) {
      toast.error("Duration must be a positive whole number");
      return;
    }

    const priceValue = Number(form.price);
    if (Number.isNaN(priceValue) || priceValue < 0) {
      toast.error("Price must be a valid positive number");
      return;
    }

    const tagArray = toTagArray(form.benefit_tags);
    const formData = new FormData();
    formData.append("name", form.name.trim());
    if (form.description.trim()) {
      formData.append("description", form.description.trim());
    }
    formData.append("price", String(priceValue));
    formData.append("benefit_tags", JSON.stringify(tagArray));
    formData.append("duration_minutes", String(durationValue));
    formData.append("is_active", String(Boolean(form.is_active)));
    if (selectedImage) {
      formData.append("image", selectedImage);
    }

    try {
      setIsSaving(true);

      if (editingTreatment) {
        const updated = await adminService.updateTreatment(
          editingTreatment.treatment_id,
          formData,
        );

        setTreatments((prev) =>
          prev.map((item) =>
            item.treatment_id === editingTreatment.treatment_id
              ? updated
              : item,
          ),
        );

        toast.success("Treatment updated successfully");
      } else {
        const created = await adminService.createTreatment(formData);

        setTreatments((prev) => [created, ...prev]);
        toast.success("Treatment created successfully");
      }

      setIsModalOpen(false);
    } catch (error) {
      toast.error(error.message || "Failed to save treatment");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteTreatment = async () => {
    if (!confirmDelete.treatment) return;

    try {
      await adminService.deleteTreatment(confirmDelete.treatment.treatment_id);

      setTreatments((prev) =>
        prev.filter(
          (item) => item.treatment_id !== confirmDelete.treatment.treatment_id,
        ),
      );

      if (rows.length === 1 && page > 1) {
        setPage((prev) => Math.max(1, prev - 1));
      } else {
        await loadData();
      }

      toast.success("Treatment deleted successfully");
      setConfirmDelete({ open: false, treatment: null });
    } catch (error) {
      toast.error(error.message || "Failed to delete treatment");
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
    <div className="space-y-6 p-4 sm:p-5">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h2 className="text-xl font-semibold text-slate-900">
            Treatment Management
          </h2>
          <p className="text-sm text-slate-600">Monitor all treatment plans</p>
        </div>

        <button
          type="button"
          onClick={openCreateModal}
          className="inline-flex w-fit items-center gap-2 rounded-xl bg-(--brand-primary) px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-(--brand-primary-hover)"
        >
          <Plus className="h-4 w-4" />
          Add Treatment
        </button>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white">
        <div className="border-b border-slate-200 p-4">
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              value={search}
              onChange={(event) => {
                setSearch(event.target.value);
                setPage(1);
              }}
              placeholder="Search treatments..."
              className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2 pl-9 pr-4 text-sm text-slate-700 outline-none focus:border-(--brand-primary) focus:ring-2 focus:ring-(--brand-primary-soft)"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200">
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Treatment
                </th>
                <th className="hidden px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500 sm:table-cell">
                  Doctor
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Active
                </th>
                <th className="hidden px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500 md:table-cell">
                  Completed
                </th>
                <th className="hidden px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500 md:table-cell">
                  Duration
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Status
                </th>
                <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Actions
                </th>
              </tr>
            </thead>

            <tbody>
              {rows.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    className="px-4 py-10 text-center text-sm text-slate-500"
                  >
                    No treatments found.
                  </td>
                </tr>
              ) : (
                rows.map((treatment) => (
                  <tr
                    key={treatment.treatment_id}
                    className="border-b border-slate-100 transition-colors hover:bg-slate-50"
                  >
                    <td className="px-4 py-3 font-medium text-slate-900">
                      {treatment.name}
                    </td>
                    <td className="hidden px-4 py-3 text-slate-600 sm:table-cell">
                      {treatment.doctor}
                    </td>
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center gap-1 text-slate-900">
                        <Users className="h-3 w-3 text-slate-500" />
                        {treatment.activePlans}
                      </span>
                    </td>
                    <td className="hidden px-4 py-3 text-slate-600 md:table-cell">
                      {treatment.completedPlans}
                    </td>
                    <td className="hidden px-4 py-3 text-slate-600 md:table-cell">
                      <span className="inline-flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {treatment.avgDuration}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`rounded-full px-2 py-1 text-[11px] font-semibold ${statusColor[treatment.status]}`}
                      >
                        {treatment.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          type="button"
                          onClick={() => setViewingTreatment(treatment)}
                          className="rounded-lg p-1.5 text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900"
                          title="View"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => openEditModal(treatment)}
                          className="rounded-lg p-1.5 text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900"
                          title="Edit"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            setConfirmDelete({ open: true, treatment })
                          }
                          className="rounded-lg p-1.5 text-slate-500 transition-colors hover:bg-rose-50 hover:text-rose-600"
                          title="Delete"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {pagination ? (
          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 px-4 py-3">
            <p className="text-xs text-slate-500">
              Page {pagination.page} of {pagination.totalPages} (
              {pagination.totalItems} total)
            </p>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setPage((prev) => Math.max(1, prev - 1))}
                disabled={!pagination.hasPrevPage}
                className="inline-flex items-center gap-1 rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <ChevronLeft className="h-4 w-4" />
                Previous
              </button>

              <button
                type="button"
                onClick={() =>
                  setPage((prev) => Math.min(pagination.totalPages, prev + 1))
                }
                disabled={!pagination.hasNextPage}
                className="inline-flex items-center gap-1 rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Next
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        ) : null}
      </div>

      {isModalOpen ? (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/40 p-4">
          <div className="mx-auto my-6 flex w-full max-w-2xl flex-col overflow-hidden rounded-2xl bg-white shadow-xl">
            <div className="flex items-start justify-between border-b border-slate-200 px-5 py-4">
              <div>
                <h3 className="text-lg font-semibold text-slate-900">
                  {editingTreatment ? "Edit Treatment" : "Add Treatment"}
                </h3>
                <p className="mt-1 text-sm text-slate-600">
                  Fill treatment details below.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="rounded-lg p-1.5 text-slate-500 transition hover:bg-slate-100 hover:text-slate-800"
                aria-label="Close modal"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="max-h-[calc(100vh-14rem)] space-y-4 overflow-y-auto px-5 py-4">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">
                  Name
                </label>
                <input
                  value={form.name}
                  onChange={(event) =>
                    setForm((prev) => ({ ...prev, name: event.target.value }))
                  }
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-800 outline-none focus:border-(--brand-primary)"
                  placeholder="Treatment name"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">
                  Price (Rs)
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.price}
                  onChange={(event) =>
                    setForm((prev) => ({
                      ...prev,
                      price: event.target.value,
                    }))
                  }
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-800 outline-none focus:border-(--brand-primary)"
                  placeholder="5000"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">
                  Description
                </label>
                <textarea
                  rows={4}
                  value={form.description}
                  onChange={(event) =>
                    setForm((prev) => ({
                      ...prev,
                      description: event.target.value,
                    }))
                  }
                  className="w-full resize-none rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-800 outline-none focus:border-(--brand-primary)"
                  placeholder="Short description"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">
                  Treatment Image
                </label>
                <div
                  {...getRootProps()}
                  className="flex w-full items-center justify-center"
                >
                  <div className="flex w-full cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed border-slate-300 bg-slate-50 transition hover:bg-slate-100">
                    <div className="flex flex-col items-center justify-center py-6 text-slate-500">
                      <p className="mb-1 text-sm text-slate-700">
                        <span className="font-semibold">Click to upload</span>{" "}
                        or drag and drop
                      </p>
                      <p className="text-xs">
                        .png, .jpg, .jpeg, .webp, .gif (Max 5MB)
                      </p>
                    </div>
                    <input {...getInputProps()} type="file" />
                  </div>
                </div>

                {selectedImage ? (
                  <div className="mt-3 flex items-center gap-3 rounded-lg border border-slate-200 bg-white p-2.5">
                    <Image
                      src={URL.createObjectURL(selectedImage)}
                      width={56}
                      height={56}
                      alt="Treatment preview"
                      className="h-14 w-14 rounded object-cover"
                    />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-slate-800">
                        {selectedImage.name}
                      </p>
                      <p className="text-xs text-slate-500">
                        {Math.round(selectedImage.size / 1024)} KB
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setSelectedImage(null)}
                      className="rounded bg-red-500 p-1.5 text-white hover:bg-red-600"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ) : editingTreatment?.image_url ? (
                  <div className="mt-3 rounded-lg border border-slate-200 bg-white p-2.5">
                    <img
                      src={resolveImageUrl(editingTreatment.image_url)}
                      alt={editingTreatment.name}
                      className="h-24 w-full rounded object-cover"
                    />
                    <p className="mt-1 text-xs text-slate-500">Current image</p>
                  </div>
                ) : null}
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">
                  Benefit Tags (comma separated)
                </label>
                <input
                  value={form.benefit_tags}
                  onChange={(event) =>
                    setForm((prev) => ({
                      ...prev,
                      benefit_tags: event.target.value,
                    }))
                  }
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-800 outline-none focus:border-(--brand-primary)"
                  placeholder="Collagen Production, Pore Minimizing"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">
                  Duration (minutes)
                </label>
                <input
                  type="number"
                  min="1"
                  value={form.duration_minutes}
                  onChange={(event) =>
                    setForm((prev) => ({
                      ...prev,
                      duration_minutes: event.target.value,
                    }))
                  }
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-800 outline-none focus:border-(--brand-primary)"
                  placeholder="45"
                />
              </div>

              <label className="inline-flex items-center gap-2 text-sm text-slate-700">
                <input
                  type="checkbox"
                  checked={form.is_active}
                  onChange={(event) =>
                    setForm((prev) => ({
                      ...prev,
                      is_active: event.target.checked,
                    }))
                  }
                  className="h-4 w-4 rounded border-slate-300"
                />
                Mark as active
              </label>
            </div>

            <div className="flex justify-end gap-2 border-t border-slate-200 px-5 py-4">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="rounded-lg border border-slate-300 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveTreatment}
                disabled={isSaving}
                className="rounded-lg bg-(--brand-primary) px-4 py-2 text-sm font-semibold text-white hover:bg-(--brand-primary-hover) disabled:opacity-60"
              >
                {isSaving ? "Saving..." : "Save"}
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {viewingTreatment ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white p-5 shadow-xl">
            <h3 className="text-lg font-semibold text-slate-900">
              Treatment Details
            </h3>
            <div className="mt-4 space-y-3 text-sm">
              <p>
                <span className="font-semibold text-slate-700">Name:</span>{" "}
                <span className="text-slate-900">{viewingTreatment.name}</span>
              </p>
              <p>
                <span className="font-semibold text-slate-700">Status:</span>{" "}
                <span className="text-slate-900">
                  {viewingTreatment.status}
                </span>
              </p>
              <p>
                <span className="font-semibold text-slate-700">Price:</span>{" "}
                <span className="text-slate-900">
                  Rs. {Number(viewingTreatment.price || 0).toLocaleString()}
                </span>
              </p>
              {viewingTreatment.image_url ? (
                <div>
                  <span className="font-semibold text-slate-700">Image:</span>
                  <img
                    src={resolveImageUrl(viewingTreatment.image_url)}
                    alt={viewingTreatment.name}
                    className="mt-2 h-28 w-full rounded-lg border border-slate-200 object-cover"
                  />
                </div>
              ) : null}
              <p>
                <span className="font-semibold text-slate-700">
                  Description:
                </span>{" "}
                <span className="text-slate-900">
                  {viewingTreatment.description || "No description"}
                </span>
              </p>
              <p>
                <span className="font-semibold text-slate-700">
                  Active Plans:
                </span>{" "}
                <span className="text-slate-900">
                  {viewingTreatment.activePlans}
                </span>
              </p>
              <p>
                <span className="font-semibold text-slate-700">
                  Completed Plans:
                </span>{" "}
                <span className="text-slate-900">
                  {viewingTreatment.completedPlans}
                </span>
              </p>
              <p>
                <span className="font-semibold text-slate-700">Duration:</span>{" "}
                <span className="text-slate-900">
                  {viewingTreatment.avgDuration}
                </span>
              </p>
              <div>
                <span className="font-semibold text-slate-700">
                  Benefit Tags:
                </span>
                <div className="mt-2 flex flex-wrap gap-2">
                  {(viewingTreatment.benefit_tags || []).length > 0 ? (
                    viewingTreatment.benefit_tags.map((tag) => (
                      <span
                        key={tag}
                        className="rounded-full bg-slate-100 px-2.5 py-1 text-xs text-slate-700"
                      >
                        {tag}
                      </span>
                    ))
                  ) : (
                    <span className="text-slate-500">No tags</span>
                  )}
                </div>
              </div>
            </div>

            <div className="mt-5 flex justify-end">
              <button
                type="button"
                onClick={() => setViewingTreatment(null)}
                className="rounded-lg bg-(--brand-primary) px-4 py-2 text-sm font-semibold text-white hover:bg-(--brand-primary-hover)"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      ) : null}

      <ConfirmModal
        isOpen={confirmDelete.open}
        title="Delete Treatment"
        message={`Are you sure you want to delete ${confirmDelete.treatment?.name || "this treatment"}?`}
        confirmText="Delete"
        cancelText="Cancel"
        onConfirm={handleDeleteTreatment}
        onCancel={() => setConfirmDelete({ open: false, treatment: null })}
      />
    </div>
  );
};

export default TreatmentManagementTable;
