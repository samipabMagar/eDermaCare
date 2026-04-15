"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  Award,
  CheckCircle,
  ChevronDown,
  Clock,
  Filter,
  Search,
  Shield,
  Users,
  X,
} from "lucide-react";
import { toast } from "react-toastify";
import TreatmentBookingModal from "@/components/treatments/TreatmentBookingModal";
import { treatmentService } from "@/services/treatmentService";
import { DOCTORS_ROUTE } from "@/constants/routes";
import { resolveImageUrl } from "@/utils/products/productCardHelpers";

const PAGE_SIZE = 9;

const getVisiblePages = (currentPage, totalPages) => {
  if (totalPages <= 5) {
    return Array.from({ length: totalPages }, (_, index) => index + 1);
  }

  if (currentPage <= 3) {
    return [1, 2, 3, 4, 5];
  }

  if (currentPage >= totalPages - 2) {
    return [
      totalPages - 4,
      totalPages - 3,
      totalPages - 2,
      totalPages - 1,
      totalPages,
    ];
  }

  return [
    currentPage - 2,
    currentPage - 1,
    currentPage,
    currentPage + 1,
    currentPage + 2,
  ];
};

const sortOptions = [
  { value: "name", label: "Name: A to Z" },
  { value: "price-low", label: "Price: Low to High" },
  { value: "price-high", label: "Price: High to Low" },
  { value: "duration", label: "Duration: Short to Long" },
];

const normalizeTreatments = (apiTreatments = []) => {
  return apiTreatments.map((item) => {
    const durationMinutes = item.duration_minutes || null;
    const benefitTags = Array.isArray(item.benefit_tags)
      ? item.benefit_tags
      : [];

    return {
      treatment_id: item.treatment_id,
      name: item.name,
      description: item.description || "No description available.",
      image: item.image_url ? resolveImageUrl(item.image_url) : null,
      duration: durationMinutes ? `${durationMinutes} min` : "N/A",
      duration_minutes: durationMinutes,
      price: Number(item.price ?? 0),
      benefits: benefitTags,
    };
  });
};

const TreatmentCatalog = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("name");
  const [page, setPage] = useState(1);
  const [showSortDropdown, setShowSortDropdown] = useState(false);
  const [bookingTreatment, setBookingTreatment] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [treatments, setTreatments] = useState([]);
  const [pagination, setPagination] = useState(null);

  useEffect(() => {
    const loadTreatments = async () => {
      try {
        setIsLoading(true);
        setError("");
        const { treatments: rows, pagination: paginationMeta } =
          await treatmentService.getTreatments({
            search: searchQuery,
            sort: sortBy,
            page,
            limit: PAGE_SIZE,
          });
        setTreatments(normalizeTreatments(rows));
        setPagination(paginationMeta);
      } catch (err) {
        setTreatments([]);
        setPagination(null);
        setError(err.message || "Failed to load treatments");
      } finally {
        setIsLoading(false);
      }
    };

    loadTreatments();
  }, [page, searchQuery, sortBy]);

  useEffect(() => {
    if (!error) return;
    toast.error(error);
  }, [error]);

  return (
    <div className="min-h-screen bg-slate-50">
      <section className="relative overflow-hidden pb-14 pt-14">
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage:
              "url('https://images.unsplash.com/photo-1713085085470-fba013d67e65?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D')",
          }}
        />

        <div className="absolute inset-0 bg-white/50" />
        <div className="absolute inset-0 bg-linear-to-t from-white/50 via-white/50 to-transparent" />

        <div className="absolute right-10 top-20 h-72 w-72 rounded-full bg-[#2FA4A9]/20 blur-3xl" />
        <div className="absolute bottom-8 left-10 h-56 w-56 rounded-full bg-amber-200/30 blur-3xl" />

        <div className="relative z-10 mx-auto w-full max-w-7xl px-6">
          <div className="mx-auto max-w-3xl text-center">
            <span className="inline-block rounded-full bg-white/60 px-3 py-1 text-xs font-bold uppercase tracking-[0.18em] text-[#0F9EA5] shadow-sm backdrop-blur-sm">
              Our Treatments
            </span>
            <h1 className="mt-4 text-4xl font-extrabold tracking-tight text-slate-900 md:text-5xl">
              Premium Skincare{" "}
              <span className="bg-linear-to-r from-[#0F9EA5] to-[#2FA4A9] bg-clip-text text-transparent drop-shadow-sm">
                Treatments
              </span>
            </h1>
            <p className="mx-auto mt-4 max-w-2xl text-lg font-medium text-slate-700">
              Advanced dermatological procedures performed by specialists using
              modern treatment technology and personalized care plans.
            </p>

            <div className="mt-8 flex flex-wrap items-center justify-center gap-4 text-sm font-medium text-slate-700">
              <div className="flex items-center gap-2 rounded-full border border-white/60 bg-white/50 px-4 py-2 shadow-sm backdrop-blur-sm transition-colors hover:bg-white/70">
                <Award className="h-4 w-4 text-[#0F9EA5]" />
                <span>Board Certified</span>
              </div>
              <div className="flex items-center gap-2 rounded-full border border-white/60 bg-white/50 px-4 py-2 shadow-sm backdrop-blur-sm transition-colors hover:bg-white/70">
                <Users className="h-4 w-4 text-[#0F9EA5]" />
                <span>10,000+ Patients</span>
              </div>
              <div className="flex items-center gap-2 rounded-full border border-white/60 bg-white/50 px-4 py-2 shadow-sm backdrop-blur-sm transition-colors hover:bg-white/70">
                <Shield className="h-4 w-4 text-[#0F9EA5]" />
                <span>FDA Approved</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="sticky top-16 z-20 border-y border-slate-200 bg-white/85 backdrop-blur-xl">
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-4 px-6 py-4 md:flex-row md:items-center">
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              placeholder="Search treatments..."
              value={searchQuery}
              onChange={(event) => {
                setSearchQuery(event.target.value);
                setPage(1);
              }}
              className="w-full rounded-lg border border-slate-200 bg-white py-2.5 pl-10 pr-10 text-sm text-slate-700 outline-none focus:border-[#0F9EA5]"
            />
            {searchQuery ? (
              <button
                type="button"
                onClick={() => {
                  setSearchQuery("");
                  setPage(1);
                }}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-700"
              >
                <X className="h-4 w-4" />
              </button>
            ) : null}
          </div>

          <div className="flex-1" />

          <div className="relative">
            <button
              type="button"
              onClick={() => setShowSortDropdown((prev) => !prev)}
              className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
            >
              <Filter className="h-4 w-4" />
              <span>
                {sortOptions.find((item) => item.value === sortBy)?.label}
              </span>
              <ChevronDown className="h-4 w-4" />
            </button>

            {showSortDropdown ? (
              <div className="absolute right-0 top-full z-30 mt-2 w-48 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-lg">
                {sortOptions.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => {
                      setSortBy(option.value);
                      setPage(1);
                      setShowSortDropdown(false);
                    }}
                    className={`w-full px-4 py-2.5 text-left text-sm ${
                      sortBy === option.value
                        ? "bg-teal-50 font-semibold text-[#0F9EA5]"
                        : "text-slate-700 hover:bg-slate-50"
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            ) : null}
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-7xl px-6 pb-2 pt-8">
        <p className="text-sm text-slate-500">
          Showing{" "}
          <span className="font-semibold text-slate-800">
            {pagination?.totalItems ?? treatments.length}
          </span>{" "}
          treatments
        </p>
      </section>

      <section className="mx-auto w-full max-w-7xl px-6 pb-20">
        {isLoading ? (
          <div className="grid gap-6 pt-4 md:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, index) => (
              <div
                key={index}
                className="overflow-hidden rounded-2xl border border-slate-200 bg-white"
              >
                <div className="h-48 animate-pulse bg-slate-200" />
                <div className="space-y-3 p-6">
                  <div className="h-4 animate-pulse rounded bg-slate-200" />
                  <div className="h-4 w-2/3 animate-pulse rounded bg-slate-200" />
                  <div className="h-9 animate-pulse rounded bg-slate-200" />
                </div>
              </div>
            ))}
          </div>
        ) : treatments.length ? (
          <div className="mt-4 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {treatments.map((treatment) => {
              return (
                <article
                  key={treatment.treatment_id}
                  className="group overflow-hidden rounded-2xl border border-slate-200 bg-white transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
                >
                  <div className="relative h-48 overflow-hidden">
                    {treatment.image ? (
                      <img
                        src={treatment.image}
                        alt={treatment.name}
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center bg-slate-200 text-sm font-medium text-slate-500">
                        No image
                      </div>
                    )}
                    <div className="absolute inset-0 bg-linear-to-t from-black/50 to-transparent" />
                    <div className="absolute bottom-3 left-3 flex items-center gap-1.5 text-xs text-white/90">
                      <Clock className="h-3.5 w-3.5" />
                      <span>{treatment.duration}</span>
                    </div>
                  </div>

                  <div className="p-6">
                    <div className="mb-2 flex items-start justify-between gap-3">
                      <div>
                        <h3 className="text-lg font-bold text-slate-900 group-hover:text-[#0F9EA5]">
                          {treatment.name}
                        </h3>
                      </div>
                      <div className="text-right">
                        <span className="text-[11px] text-slate-500">from</span>
                        <p className="text-lg font-bold text-[#0F9EA5]">
                          Rs. {treatment.price.toLocaleString()}
                        </p>
                      </div>
                    </div>

                    <p className="mb-4 line-clamp-2 text-sm leading-relaxed text-slate-600">
                      {treatment.description}
                    </p>

                    <div className="mb-5 flex flex-wrap gap-2">
                      {treatment.benefits.map((benefit) => (
                        <span
                          key={benefit}
                          className="inline-flex items-center gap-1 rounded-full bg-teal-50 px-2.5 py-1 text-xs text-[#0F9EA5]"
                        >
                          <CheckCircle className="h-3 w-3" />
                          {benefit}
                        </span>
                      ))}
                    </div>

                    <button
                      type="button"
                      onClick={() => setBookingTreatment(treatment)}
                      className="flex w-full items-center justify-center rounded-lg bg-linear-to-r from-[#0F9EA5] to-[#2FA4A9] px-4 py-2.5 text-sm font-semibold text-white transition hover:opacity-90"
                    >
                      Book Treatment
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        ) : (
          <div className="py-20 text-center">
            <Search className="mx-auto mb-4 h-12 w-12 text-slate-300" />
            <h3 className="mb-2 text-lg font-semibold text-slate-800">
              No treatments found
            </h3>
            <p className="text-sm text-slate-500">
              Try adjusting your search or filter criteria.
            </p>
          </div>
        )}

        {pagination ? (
          <div className="mt-8 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white px-3 py-3">
            <button
              type="button"
              onClick={() => setPage((prev) => Math.max(1, prev - 1))}
              disabled={!pagination.hasPrevPage}
              className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Previous
            </button>

            <div className="flex flex-wrap items-center gap-1.5">
              {getVisiblePages(pagination.page, pagination.totalPages).map(
                (pageNumber) => {
                  const isCurrent = pagination.page === pageNumber;

                  return (
                    <button
                      key={pageNumber}
                      type="button"
                      onClick={() => setPage(pageNumber)}
                      aria-current={isCurrent ? "page" : undefined}
                      className={`min-w-9 rounded-lg px-3 py-1.5 text-sm font-semibold transition ${
                        isCurrent
                          ? "bg-[#2FA4A9] text-white"
                          : "border border-slate-300 text-slate-700 hover:bg-slate-100"
                      }`}
                    >
                      {pageNumber}
                    </button>
                  );
                },
              )}
            </div>

            <span className="text-xs font-medium text-slate-500">
              Page {pagination.page} of {pagination.totalPages}
            </span>

            <button
              type="button"
              onClick={() =>
                setPage((prev) => Math.min(pagination.totalPages, prev + 1))
              }
              disabled={!pagination.hasNextPage}
              className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Next
            </button>
          </div>
        ) : null}
      </section>

      <section className="bg-linear-to-r from-[#0F9EA5] to-[#25888d] py-16">
        <div className="mx-auto w-full max-w-7xl px-6 text-center">
          <h2 className="mb-4 text-3xl font-bold text-white">
            Not sure which treatment is right for you?
          </h2>
          <p className="mx-auto mb-8 max-w-xl text-white/85">
            Book a free consultation with our dermatologists to get a
            personalized treatment plan.
          </p>
          <Link
            href={DOCTORS_ROUTE}
            className="inline-flex items-center rounded-lg bg-white px-8 py-3 text-sm font-semibold text-[#0F9EA5] transition hover:bg-slate-100"
          >
            Book Free Consultation
            <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </div>
      </section>

      <TreatmentBookingModal
        open={Boolean(bookingTreatment)}
        treatment={bookingTreatment}
        onClose={() => setBookingTreatment(null)}
      />
    </div>
  );
};

export default TreatmentCatalog;
