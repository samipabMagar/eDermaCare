"use client";

import { useEffect, useMemo, useState } from "react";
import { ChevronDown, Search, Users } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";
import { doctorService } from "@/services/doctorService";
import DoctorCard from "@/components/doctors/DoctorCard";
import DoctorDirectoryHeader from "@/components/doctors/DoctorDirectoryHeader";
import BookAppointmentModal from "@/components/doctors/BookAppointmentModal";
import { LOGIN_ROUTE } from "@/constants/routes";

const DoctorDirectory = () => {
  const PAGE_SIZE = 6;

  const router = useRouter();
  const pathname = usePathname();
  const authState = useSelector((state) => state.auth);
  const [doctors, setDoctors] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSpec, setSelectedSpec] = useState("All");
  const [sortBy, setSortBy] = useState("Experience");
  const [showSortMenu, setShowSortMenu] = useState(false);
  const [bookingDoctor, setBookingDoctor] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);

  const sortByQuery = useMemo(() => {
    return "experience";
  }, [sortBy]);

  useEffect(() => {
    const loadDoctors = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await doctorService.getDoctors({
          page: currentPage,
          limit: PAGE_SIZE,
          search: searchQuery.trim() || undefined,
          specialization: selectedSpec === "All" ? undefined : selectedSpec,
          sortBy: sortByQuery,
          approvalStatus: "approved",
        });

        setDoctors(Array.isArray(response?.doctors) ? response.doctors : []);
        setPagination(response?.pagination || null);
      } catch (loadError) {
        setError(loadError.message || "Unable to load doctors right now.");
      } finally {
        setLoading(false);
      }
    };

    loadDoctors();
  }, [currentPage, searchQuery, selectedSpec, sortByQuery]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedSpec, sortBy]);

  const availableCount = useMemo(() => {
    return doctors.filter((doctor) => doctor.is_available).length;
  }, [doctors]);

  const specializationOptions = useMemo(() => {
    const options = doctors
      .map((doctor) => doctor.specialization)
      .filter(Boolean)
      .sort((a, b) => a.localeCompare(b));

    return ["All", ...new Set(options)];
  }, [doctors]);

  const filteredDoctors = doctors;

  const totalDoctors = Number(pagination?.total || filteredDoctors.length);
  const totalPages = Number(pagination?.total_pages || 1);

  const visiblePageItems = useMemo(() => {
    if (totalPages <= 7) {
      return Array.from({ length: totalPages }, (_, index) => index + 1);
    }

    const pages = [1];
    const start = Math.max(2, currentPage - 1);
    const end = Math.min(totalPages - 1, currentPage + 1);

    if (start > 2) {
      pages.push("ellipsis-left");
    }

    for (let page = start; page <= end; page += 1) {
      pages.push(page);
    }

    if (end < totalPages - 1) {
      pages.push("ellipsis-right");
    }

    pages.push(totalPages);
    return pages;
  }, [currentPage, totalPages]);

  const handleBookAppointment = (doctor) => {
    const isAuthenticated =
      Boolean(authState?.user) || authState?.isAuthenticated === true;

    if (!isAuthenticated) {
      toast.info("Please login to book an appointment");
      const nextRoute = pathname || "/doctors";
      router.push(`${LOGIN_ROUTE}?next=${encodeURIComponent(nextRoute)}`);
      return;
    }

    setBookingDoctor(doctor);
  };

  return (
    <section className="bg-slate-50 pb-10">
      <div className="mx-auto w-full max-w-7xl">
        <div className="px-4 pt-3 sm:px-6 lg:px-10">
          <DoctorDirectoryHeader
            totalDoctors={doctors.length}
            availableCount={availableCount}
          />
        </div>

        <section className="sticky top-16 z-30 mt-3 border-y border-slate-200 bg-white/95 backdrop-blur-md">
          <div className="mx-auto w-full max-w-7xl px-4 py-4 sm:px-6 lg:px-10">
            <div className="flex flex-col gap-4 md:flex-row md:items-center">
              <div className="relative w-full md:max-w-md">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
                  placeholder="Search by name or specialization..."
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-4 text-sm text-slate-700 outline-none focus:border-teal-600 focus:bg-white"
                />
              </div>

              <div className="flex items-center gap-3">
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setShowSortMenu((prev) => !prev)}
                    className="inline-flex h-9 items-center gap-2 rounded-lg border border-slate-200 px-3 text-xs font-medium text-slate-700 hover:bg-slate-50"
                  >
                    Sort: {sortBy}
                    <ChevronDown className="h-3.5 w-3.5" />
                  </button>

                  {showSortMenu ? (
                    <div className="absolute right-0 top-10 z-50 min-w-44 rounded-lg border border-slate-200 bg-white py-1 shadow-sm">
                      {["Experience"].map((option) => (
                        <button
                          key={option}
                          type="button"
                          onClick={() => {
                            setSortBy(option);
                            setShowSortMenu(false);
                          }}
                          className={`block w-full px-4 py-2 text-left text-xs transition ${
                            sortBy === option
                              ? "bg-teal-50 font-semibold text-teal-700"
                              : "text-slate-700 hover:bg-slate-50"
                          }`}
                        >
                          {option}
                        </button>
                      ))}
                    </div>
                  ) : null}
                </div>

                <span className="hidden text-xs text-slate-500 md:inline">
                  {totalDoctors} doctor{totalDoctors === 1 ? "" : "s"}
                </span>
              </div>
            </div>

            <div className="mt-4 flex gap-2 overflow-x-auto pb-1">
              {specializationOptions.map((spec) => (
                <button
                  key={spec}
                  type="button"
                  onClick={() => setSelectedSpec(spec)}
                  className={`whitespace-nowrap rounded-full px-4 py-1.5 text-xs font-medium transition ${
                    selectedSpec === spec
                      ? "bg-[#0F9EA5] text-white"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  {spec}
                </button>
              ))}
            </div>
          </div>
        </section>

        {loading ? (
          <div className="mt-6 px-4 sm:px-6 lg:px-10">
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
              {Array.from({ length: 6 }).map((_, index) => (
                <div
                  key={`skeleton-${index}`}
                  className="h-72 animate-pulse rounded-2xl border border-slate-200 bg-white"
                />
              ))}
            </div>
          </div>
        ) : null}

        {!loading && error ? (
          <div className="mt-6 px-4 sm:px-6 lg:px-10">
            <div className="rounded-2xl border border-rose-200 bg-rose-50 px-5 py-4 text-sm text-rose-700">
              {error}
            </div>
          </div>
        ) : null}

        {!loading && !error && !doctors.length ? (
          <div className="mt-6 px-4 sm:px-6 lg:px-10">
            <div className="rounded-2xl border border-slate-200 bg-white px-5 py-12 text-center">
              <Users className="mx-auto mb-3 h-10 w-10 text-slate-300" />
              <p className="text-base font-semibold text-slate-900">
                No doctors available right now
              </p>
              <p className="mt-2 text-sm text-slate-600">
                Please check back later for updated doctor availability.
              </p>
            </div>
          </div>
        ) : null}

        {!loading && !error && doctors.length ? (
          <div className="mt-5 px-4 sm:px-6 lg:px-10">
            {!filteredDoctors.length ? (
              <div className="rounded-2xl border border-slate-200 bg-white px-5 py-12 text-center">
                <Users className="mx-auto mb-3 h-10 w-10 text-slate-300" />
                <p className="text-base font-semibold text-slate-900">
                  No doctors found
                </p>
                <p className="mt-2 text-sm text-slate-600">
                  Try adjusting your search or filters.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
                {filteredDoctors.map((doctor) => (
                  <DoctorCard
                    key={doctor.profile_id}
                    doctor={doctor}
                    onBookAppointment={handleBookAppointment}
                  />
                ))}
              </div>
            )}

            {totalDoctors > 0 ? (
              <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
                <button
                  type="button"
                  onClick={() =>
                    setCurrentPage((prev) => Math.max(1, prev - 1))
                  }
                  disabled={currentPage <= 1}
                  className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Previous
                </button>

                {totalPages > 1 ? (
                  visiblePageItems.map((item) => {
                    if (typeof item !== "number") {
                      return (
                        <span
                          key={item}
                          className="px-1 text-xs font-semibold text-slate-400"
                        >
                          ...
                        </span>
                      );
                    }

                    const isActive = item === currentPage;

                    return (
                      <button
                        key={`page-${item}`}
                        type="button"
                        onClick={() => setCurrentPage(item)}
                        className={`h-8 min-w-8 rounded-lg px-2 text-xs font-semibold transition ${
                          isActive
                            ? "bg-[#0F9EA5] text-white"
                            : "border border-slate-200 text-slate-700 hover:bg-slate-50"
                        }`}
                      >
                        {item}
                      </button>
                    );
                  })
                ) : (
                  <span className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-600">
                    Page 1 of 1
                  </span>
                )}

                <button
                  type="button"
                  onClick={() =>
                    setCurrentPage((prev) => Math.min(totalPages, prev + 1))
                  }
                  disabled={currentPage >= totalPages}
                  className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            ) : null}
          </div>
        ) : null}

        <BookAppointmentModal
          doctor={bookingDoctor}
          open={Boolean(bookingDoctor)}
          onClose={() => setBookingDoctor(null)}
        />
      </div>
    </section>
  );
};

export default DoctorDirectory;
