"use client";

import { useEffect, useMemo, useState } from "react";
import { ChevronDown, Search, Users } from "lucide-react";
import { doctorService } from "@/services/doctorService";
import DoctorCard from "@/components/doctors/DoctorCard";
import DoctorDirectoryHeader from "@/components/doctors/DoctorDirectoryHeader";

const DoctorDirectory = () => {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSpec, setSelectedSpec] = useState("All");
  const [sortBy, setSortBy] = useState("Rating");
  const [showSortMenu, setShowSortMenu] = useState(false);

  useEffect(() => {
    const loadDoctors = async () => {
      try {
        setLoading(true);
        setError("");

        const doctorList = await doctorService.getDoctors();
        setDoctors(doctorList);
      } catch (loadError) {
        setError(loadError.message || "Unable to load doctors right now.");
      } finally {
        setLoading(false);
      }
    };

    loadDoctors();
  }, []);

  const availableCount = useMemo(() => {
    return doctors.filter((doctor) => doctor.is_available).length;
  }, [doctors]);

  const averageRating = useMemo(() => {
    if (!doctors.length) {
      return "0.0";
    }

    const totalRating = doctors.reduce(
      (sum, doctor) => sum + Number(doctor.rating || 0),
      0,
    );

    return (totalRating / doctors.length).toFixed(1);
  }, [doctors]);

  const specializationOptions = useMemo(() => {
    const options = doctors
      .map((doctor) => doctor.specialization)
      .filter(Boolean)
      .sort((a, b) => a.localeCompare(b));

    return ["All", ...new Set(options)];
  }, [doctors]);

  const filteredDoctors = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLowerCase();

    const next = doctors.filter((doctor) => {
      const name = String(doctor.user?.full_name || "").toLowerCase();
      const specialization = String(doctor.specialization || "").toLowerCase();
      const bio = String(doctor.bio || "").toLowerCase();

      const matchSearch =
        !normalizedQuery ||
        name.includes(normalizedQuery) ||
        specialization.includes(normalizedQuery) ||
        bio.includes(normalizedQuery);

      const matchSpec =
        selectedSpec === "All" ||
        String(doctor.specialization || "") === selectedSpec;

      return matchSearch && matchSpec;
    });

    next.sort((a, b) => {
      if (sortBy === "Experience") {
        return (
          Number(b.years_of_experience || 0) -
          Number(a.years_of_experience || 0)
        );
      }

      if (sortBy === "Reviews") {
        return Number(b.total_reviews || 0) - Number(a.total_reviews || 0);
      }

      if (sortBy === "Fee: Low to High") {
        return (
          Number(a.consultation_fee || 0) - Number(b.consultation_fee || 0)
        );
      }

      return Number(b.rating || 0) - Number(a.rating || 0);
    });

    return next;
  }, [doctors, searchQuery, selectedSpec, sortBy]);

  return (
    <section className="bg-slate-50 pb-10">
      <div className="mx-auto w-full max-w-7xl">
        <div className="px-4 pt-3 sm:px-6 lg:px-10">
          <DoctorDirectoryHeader
            totalDoctors={doctors.length}
            availableCount={availableCount}
            averageRating={averageRating}
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
                      {[
                        "Rating",
                        "Experience",
                        "Reviews",
                        "Fee: Low to High",
                      ].map((option) => (
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
                  {filteredDoctors.length} doctor
                  {filteredDoctors.length === 1 ? "" : "s"}
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
                  <DoctorCard key={doctor.profile_id} doctor={doctor} />
                ))}
              </div>
            )}
          </div>
        ) : null}
      </div>
    </section>
  );
};

export default DoctorDirectory;
