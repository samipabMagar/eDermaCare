"use client";

import { useEffect, useMemo, useState } from "react";
import { Loader2, Search, Trash2, UserRound } from "lucide-react";
import { toast } from "react-toastify";
import ConfirmModal from "@/components/ui/ConfirmModal";
import { adminService } from "@/services/adminService";

const PAGE_SIZE = 10;

const roleClassMap = {
  admin: "bg-indigo-100 text-indigo-700",
  doctor: "bg-sky-100 text-sky-700",
  user: "bg-slate-100 text-slate-700",
};

const formatRole = (role = "") => {
  if (!role) return "N/A";
  return role.charAt(0).toUpperCase() + role.slice(1);
};

const formatDate = (value) => {
  if (!value) return "N/A";
  return new Intl.DateTimeFormat("en-NP", {
    year: "numeric",
    month: "short",
    day: "2-digit",
  }).format(new Date(value));
};

const resolveProfileImageUrl = (profileImagePath) => {
  if (!profileImagePath) return null;

  if (/^https?:\/\//i.test(profileImagePath)) {
    return profileImagePath;
  }

  const apiBase =
    process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

  try {
    const origin = new URL(apiBase).origin;
    const normalizedPath = profileImagePath.startsWith("/")
      ? profileImagePath
      : `/${profileImagePath}`;
    return `${origin}${normalizedPath}`;
  } catch {
    return null;
  }
};

const UsersManagementTable = () => {
  const [users, setUsers] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);
  const [imageErrors, setImageErrors] = useState({});

  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [page, setPage] = useState(1);

  const [deleteModal, setDeleteModal] = useState({
    isOpen: false,
    user: null,
  });

  useEffect(() => {
    const timer = setTimeout(() => {
      setSearch(searchInput.trim());
      setPage(1);
    }, 350);

    return () => clearTimeout(timer);
  }, [searchInput]);

  const fetchUsers = async () => {
    try {
      setLoading(true);

      const { users: data, pagination: paginationData } =
        await adminService.getUsers({
          search,
          role: roleFilter,
          isActive: statusFilter,
          page,
          limit: PAGE_SIZE,
        });

      setUsers(data);
      setPagination(paginationData);
    } catch (error) {
      toast.error(error.message || "Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [search, roleFilter, statusFilter, page]);

  const headerStats = useMemo(() => {
    const total = pagination?.totalItems ?? users.length;
    const active = users.filter((item) => item.is_active).length;
    const doctors = users.filter((item) => item.role === "doctor").length;

    return { total, active, doctors };
  }, [users, pagination]);

  const openDeleteModal = (user) => {
    setDeleteModal({ isOpen: true, user });
  };

  const closeDeleteModal = () => {
    setDeleteModal({ isOpen: false, user: null });
  };

  const handleImageError = (userId) => {
    setImageErrors((prev) => ({
      ...prev,
      [userId]: true,
    }));
  };

  const handleDelete = async () => {
    if (!deleteModal.user) return;

    try {
      setDeletingId(deleteModal.user.user_id);
      await adminService.deleteUser(deleteModal.user.user_id);
      toast.success("User deleted successfully");
      closeDeleteModal();
      await fetchUsers();
    } catch (error) {
      toast.error(error.message || "Failed to delete user");
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
      <div className="mb-4 grid grid-cols-1 gap-3 rounded-xl border border-slate-200 bg-linear-to-r from-slate-50 to-teal-50/40 px-4 py-4 sm:grid-cols-3">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
            Total Users
          </p>
          <p className="mt-1 text-2xl font-bold text-slate-900">
            {headerStats.total}
          </p>
        </div>
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
            Active On Page
          </p>
          <p className="mt-1 text-2xl font-bold text-emerald-600">
            {headerStats.active}
          </p>
        </div>
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
            Doctors On Page
          </p>
          <p className="mt-1 text-2xl font-bold text-sky-600">
            {headerStats.doctors}
          </p>
        </div>
      </div>

      <div className="mb-5 flex flex-wrap gap-3">
        <div className="min-w-64 flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-5 w-5 text-slate-400" />
            <input
              type="text"
              placeholder="Search by name, email, or phone..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="w-full rounded-lg border border-slate-300 py-2 pl-10 pr-4 text-sm text-slate-800 outline-none focus:border-(--brand-primary) focus:ring-2 focus:ring-(--brand-primary-soft)"
            />
          </div>
        </div>

        <select
          value={roleFilter}
          onChange={(e) => {
            setRoleFilter(e.target.value);
            setPage(1);
          }}
          className="rounded-lg border border-slate-300 px-4 py-2 text-sm text-slate-700 outline-none focus:border-(--brand-primary) focus:ring-2 focus:ring-(--brand-primary-soft)"
        >
          <option value="">All Roles</option>
          <option value="user">Users</option>
          <option value="doctor">Doctors</option>
          <option value="admin">Admins</option>
        </select>

        <select
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value);
            setPage(1);
          }}
          className="rounded-lg border border-slate-300 px-4 py-2 text-sm text-slate-700 outline-none focus:border-(--brand-primary) focus:ring-2 focus:ring-(--brand-primary-soft)"
        >
          <option value="">All Status</option>
          <option value="true">Active</option>
          <option value="false">Inactive</option>
        </select>
      </div>

      <div className="overflow-x-auto rounded-xl border border-slate-200">
        <table className="w-full text-left text-sm">
          <thead className="sticky top-0 bg-slate-100/90 backdrop-blur">
            <tr className="border-b border-slate-200">
              <th className="px-4 py-3 font-semibold text-slate-700">User</th>
              <th className="px-4 py-3 font-semibold text-slate-700">Role</th>
              <th className="px-4 py-3 font-semibold text-slate-700">Phone</th>
              <th className="px-4 py-3 font-semibold text-slate-700">Status</th>
              <th className="px-4 py-3 font-semibold text-slate-700">Joined</th>
              <th className="px-4 py-3 font-semibold text-slate-700">
                Actions
              </th>
            </tr>
          </thead>

          <tbody>
            {users.length === 0 ? (
              <tr>
                <td
                  colSpan="6"
                  className="px-6 py-8 text-center text-slate-500"
                >
                  No users found for the selected filters.
                </td>
              </tr>
            ) : (
              users.map((user) => {
                const roleClass =
                  roleClassMap[user.role] || "bg-slate-100 text-slate-700";
                const isAdmin = user.role === "admin";
                const profileImageUrl = resolveProfileImageUrl(
                  user.profile_image,
                );
                const shouldShowProfileImage =
                  Boolean(profileImageUrl) && !imageErrors[user.user_id];

                return (
                  <tr
                    key={user.user_id}
                    className="border-b border-slate-200 last:border-b-0 hover:bg-slate-50"
                  >
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-slate-500">
                          {shouldShowProfileImage ? (
                            <img
                              src={profileImageUrl}
                              alt={user.full_name || "User"}
                              className="h-full w-full rounded-full object-cover"
                              onError={() => handleImageError(user.user_id)}
                            />
                          ) : (
                            <UserRound className="h-4 w-4" />
                          )}
                        </div>
                        <div>
                          <p className="font-semibold text-slate-900">
                            {user.full_name || "N/A"}
                          </p>
                          <p className="text-xs text-slate-500">
                            {user.email || "N/A"}
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="px-4 py-4">
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-semibold ${roleClass}`}
                      >
                        {formatRole(user.role)}
                      </span>
                    </td>

                    <td className="px-4 py-4 text-slate-700">
                      {user.phone || "N/A"}
                    </td>

                    <td className="px-4 py-4">
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-semibold ${
                          user.is_active
                            ? "bg-emerald-100 text-emerald-700"
                            : "bg-rose-100 text-rose-700"
                        }`}
                      >
                        {user.is_active ? "Active" : "Inactive"}
                      </span>
                    </td>

                    <td className="px-4 py-4 text-slate-700">
                      {formatDate(user.created_at)}
                    </td>

                    <td className="px-4 py-4">
                      <button
                        type="button"
                        onClick={() => openDeleteModal(user)}
                        disabled={isAdmin || deletingId === user.user_id}
                        className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-rose-600 text-white transition hover:bg-rose-700 disabled:cursor-not-allowed disabled:bg-slate-300"
                        title={
                          isAdmin
                            ? "Admin accounts cannot be deleted"
                            : "Delete user"
                        }
                        aria-label="Delete user"
                      >
                        {deletingId === user.user_id ? (
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

      {pagination ? (
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700">
          <p>
            Page {pagination.page} of {pagination.totalPages} •{" "}
            {pagination.totalItems} total records
          </p>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
              disabled={!pagination.hasPrevPage}
              className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-medium transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-50"
            >
              Previous
            </button>
            <button
              type="button"
              onClick={() => setPage((prev) => prev + 1)}
              disabled={!pagination.hasNextPage}
              className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-medium transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      ) : null}

      <ConfirmModal
        isOpen={deleteModal.isOpen}
        title="Delete User Account"
        message={`Are you sure you want to delete ${deleteModal.user?.full_name || "this user"}? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        isLoading={Boolean(deletingId)}
        onConfirm={handleDelete}
        onCancel={closeDeleteModal}
      />
    </div>
  );
};

export default UsersManagementTable;
