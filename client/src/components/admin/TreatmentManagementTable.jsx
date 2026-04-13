"use client";

import { useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";
import {
  Clock,
  Edit,
  Eye,
  Loader2,
  Plus,
  Search,
  Trash2,
  Users,
} from "lucide-react";
import { adminService } from "@/services/adminService";
import ConfirmModal from "@/components/ui/ConfirmModal";

const initialForm = {
  name: "",
  description: "",
  is_active: true,
};

const statusColor = {
  Active: "bg-emerald-500/10 text-emerald-700",
  Discontinued: "bg-slate-200 text-slate-700",
};

const getDurationLabel = (description = "") => {
  const normalized = description.toLowerCase();

  if (normalized.includes("laser")) return "8 sessions";
  if (normalized.includes("prp")) return "4 sessions";
  if (normalized.includes("peel")) return "6 weeks";
  if (normalized.includes("microneedl")) return "12 weeks";

  return "6 weeks";
};

const TreatmentManagementTable = () => {
  const [treatments, setTreatments] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editingTreatment, setEditingTreatment] = useState(null);
  const [form, setForm] = useState(initialForm);
  const [viewingTreatment, setViewingTreatment] = useState(null);
  const [confirmDiscontinue, setConfirmDiscontinue] = useState({
    open: false,
    treatment: null,
  });

  const loadData = async () => {
    try {
      setLoading(true);
      const [allTreatments, allBookings] = await Promise.all([
        adminService.getTreatments(),
        adminService.getTreatmentBookings({ limit: 200 }),
      ]);

      setTreatments(allTreatments);
      setBookings(allBookings);
    } catch (error) {
      toast.error(error.message || "Failed to load treatments");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

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
    return treatments
      .map((treatment) => {
        const stats = statsByTreatmentId.get(treatment.treatment_id) || {
          activePlans: 0,
          completedPlans: 0,
        };

        return {
          ...treatment,
          doctor: "Assigned by booking",
          avgDuration: getDurationLabel(treatment.description || ""),
          activePlans: stats.activePlans,
          completedPlans: stats.completedPlans,
          status: treatment.is_active === false ? "Discontinued" : "Active",
        };
      })
      .filter((item) => {
        if (!search.trim()) return true;

        const q = search.toLowerCase();
        return (
          item.name?.toLowerCase().includes(q) ||
          item.description?.toLowerCase().includes(q)
        );
      });
  }, [search, statsByTreatmentId, treatments]);

  const openCreateModal = () => {
    setEditingTreatment(null);
    setForm(initialForm);
    setIsModalOpen(true);
  };

  const openEditModal = (treatment) => {
    setEditingTreatment(treatment);
    setForm({
      name: treatment.name || "",
      description: treatment.description || "",
      is_active: treatment.is_active !== false,
    });
    setIsModalOpen(true);
  };

  const handleSaveTreatment = async () => {
    if (!form.name.trim()) {
      toast.error("Treatment name is required");
      return;
    }

    try {
      setIsSaving(true);

      if (editingTreatment) {
        const updated = await adminService.updateTreatment(
          editingTreatment.treatment_id,
          {
            name: form.name.trim(),
            description: form.description.trim() || undefined,
            is_active: form.is_active,
          },
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
        const created = await adminService.createTreatment({
          name: form.name.trim(),
          description: form.description.trim() || undefined,
          is_active: form.is_active,
        });

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

  const handleDiscontinue = async () => {
    if (!confirmDiscontinue.treatment) return;

    try {
      const updated = await adminService.updateTreatment(
        confirmDiscontinue.treatment.treatment_id,
        { is_active: false },
      );

      setTreatments((prev) =>
        prev.map((item) =>
          item.treatment_id === confirmDiscontinue.treatment.treatment_id
            ? updated
            : item,
        ),
      );

      toast.success("Treatment marked as discontinued");
      setConfirmDiscontinue({ open: false, treatment: null });
    } catch (error) {
      toast.error(error.message || "Failed to discontinue treatment");
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
              onChange={(event) => setSearch(event.target.value)}
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
                            setConfirmDiscontinue({ open: true, treatment })
                          }
                          className="rounded-lg p-1.5 text-slate-500 transition-colors hover:bg-rose-50 hover:text-rose-600"
                          title="Discontinue"
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
      </div>

      {isModalOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white p-5 shadow-xl">
            <h3 className="text-lg font-semibold text-slate-900">
              {editingTreatment ? "Edit Treatment" : "Add Treatment"}
            </h3>
            <p className="mt-1 text-sm text-slate-600">
              Fill treatment details below.
            </p>

            <div className="mt-4 space-y-4">
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

            <div className="mt-5 flex justify-end gap-2">
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
        isOpen={confirmDiscontinue.open}
        title="Discontinue Treatment"
        message={`Are you sure you want to discontinue ${confirmDiscontinue.treatment?.name || "this treatment"}?`}
        confirmText="Discontinue"
        cancelText="Cancel"
        onConfirm={handleDiscontinue}
        onCancel={() => setConfirmDiscontinue({ open: false, treatment: null })}
      />
    </div>
  );
};

export default TreatmentManagementTable;
