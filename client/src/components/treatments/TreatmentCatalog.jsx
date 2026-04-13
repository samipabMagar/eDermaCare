"use client";

import { useEffect, useMemo, useState } from "react";
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
  Sparkles,
  Users,
  X,
  Zap,
  Sun,
  Droplets,
  Leaf,
  Heart,
} from "lucide-react";
import { toast } from "react-toastify";
import TreatmentBookingModal from "@/components/treatments/TreatmentBookingModal";
import { treatmentService } from "@/services/treatmentService";
import { DOCTORS_ROUTE } from "@/constants/routes";

const categories = [
  { id: "all", label: "All Treatments" },
  { id: "facial", label: "Facials" },
  { id: "laser", label: "Laser" },
  { id: "injectable", label: "Injectables" },
  { id: "body", label: "Body" },
  { id: "hair", label: "Hair" },
];

const sortOptions = [
  { value: "name", label: "Name: A to Z" },
  { value: "price-low", label: "Price: Low to High" },
  { value: "price-high", label: "Price: High to Low" },
  { value: "duration", label: "Duration: Short to Long" },
];

const iconByCategory = {
  facial: Sparkles,
  laser: Sun,
  injectable: Zap,
  body: Droplets,
  hair: Leaf,
  all: Heart,
};

const visualMetaBySlug = {
  hydrafacial: {
    image_url:
      "https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=1200&h=800&fit=crop",
    duration_minutes: 60,
    price: 5000,
    benefit_tags: ["Deep Hydration", "Pore Cleansing", "Even Skin Tone"],
  },
  "prp-therapy": {
    image_url:
      "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=1200&h=800&fit=crop",
    duration_minutes: 90,
    price: 15000,
    benefit_tags: ["Collagen Boost", "Hair Growth", "Natural Healing"],
  },
  microneedling: {
    image_url:
      "https://images.unsplash.com/photo-1516975080664-ed2fc6a32937?w=1200&h=800&fit=crop",
    duration_minutes: 45,
    price: 6000,
    benefit_tags: ["Collagen Production", "Pore Minimizing", "Scar Healing"],
  },
  "co2-laser-resurfacing": {
    image_url:
      "https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=1200&h=800&fit=crop",
    duration_minutes: 45,
    price: 12000,
    benefit_tags: ["Scar Reduction", "Wrinkle Removal", "Skin Tightening"],
  },
  "chemical-peel": {
    image_url:
      "https://images.unsplash.com/photo-1487412947147-5cebf100ffc2?w=1200&h=800&fit=crop",
    duration_minutes: 30,
    price: 3500,
    benefit_tags: ["Pigmentation Control", "Smooth Texture", "Brightening"],
  },
};

const classifyCategory = (name = "", description = "") => {
  const value = `${name} ${description}`.toLowerCase();

  if (value.includes("laser")) return "laser";
  if (
    value.includes("prp") ||
    value.includes("filler") ||
    value.includes("botox")
  ) {
    return "injectable";
  }
  if (value.includes("hair")) return "hair";
  if (value.includes("body")) return "body";

  return "facial";
};

const buildFallbackMeta = (category) => {
  const prices = {
    facial: 4500,
    laser: 12000,
    injectable: 15000,
    body: 18000,
    hair: 9000,
  };

  const basePrice = prices[category] ?? 5000;
  return {
    image_url:
      "https://images.unsplash.com/photo-1515377905703-c4788e51af15?w=1200&h=800&fit=crop",
    duration_minutes: 45,
    price: basePrice,
    benefit_tags: ["Expert Care", "Safe Procedure", "Visible Results"],
  };
};

const normalizeTreatments = (apiTreatments = []) => {
  return apiTreatments.map((item) => {
    const category = classifyCategory(item.name, item.description || "");
    const visualMeta =
      visualMetaBySlug[item.slug] || buildFallbackMeta(category);

    const imageUrl = item.image_url || visualMeta.image_url;
    const durationMinutes =
      item.duration_minutes || visualMeta.duration_minutes;
    const benefitTags =
      Array.isArray(item.benefit_tags) && item.benefit_tags.length > 0
        ? item.benefit_tags
        : visualMeta.benefit_tags;

    return {
      treatment_id: item.treatment_id,
      name: item.name,
      description: item.description || "Personalized dermatology treatment.",
      category,
      icon: iconByCategory[category] || Sparkles,
      image: imageUrl,
      duration: `${durationMinutes} min`,
      duration_minutes: durationMinutes,
      price: Number(item.price ?? visualMeta.price ?? 0),
      benefits: benefitTags,
    };
  });
};

const TreatmentCatalog = () => {
  const [activeCategory, setActiveCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("name");
  const [showSortDropdown, setShowSortDropdown] = useState(false);
  const [bookingTreatment, setBookingTreatment] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [treatments, setTreatments] = useState([]);

  useEffect(() => {
    const loadTreatments = async () => {
      try {
        setIsLoading(true);
        setError("");
        const data = await treatmentService.getTreatments();
        setTreatments(normalizeTreatments(data));
      } catch (err) {
        setTreatments([]);
        setError(err.message || "Failed to load treatments");
      } finally {
        setIsLoading(false);
      }
    };

    loadTreatments();
  }, []);

  useEffect(() => {
    if (!error) return;
    toast.error(error);
  }, [error]);

  const filteredTreatments = useMemo(() => {
    return [...treatments]
      .filter(
        (treatment) =>
          activeCategory === "all" || treatment.category === activeCategory,
      )
      .filter((treatment) => {
        const normalizedQuery = searchQuery.trim().toLowerCase();
        if (!normalizedQuery) return true;

        return (
          treatment.name.toLowerCase().includes(normalizedQuery) ||
          treatment.description.toLowerCase().includes(normalizedQuery)
        );
      })
      .sort((a, b) => {
        if (sortBy === "name") return a.name.localeCompare(b.name);
        if (sortBy === "price-low") return a.price - b.price;
        if (sortBy === "price-high") return b.price - a.price;
        if (sortBy === "duration")
          return a.duration_minutes - b.duration_minutes;
        return a.name.localeCompare(b.name);
      });
  }, [activeCategory, searchQuery, sortBy, treatments]);

  return (
    <div className="min-h-screen bg-slate-50">
      <section className="relative overflow-hidden bg-linear-to-br from-teal-50 via-white to-cyan-50 pb-14 pt-14">
        <div className="absolute right-10 top-20 h-72 w-72 rounded-full bg-[#2FA4A9]/10 blur-3xl" />
        <div className="absolute bottom-8 left-10 h-56 w-56 rounded-full bg-amber-200/20 blur-3xl" />

        <div className="relative mx-auto w-full max-w-7xl px-6">
          <div className="mx-auto max-w-3xl text-center">
            <span className="text-xs font-bold uppercase tracking-[0.18em] text-[#0F9EA5]">
              Our Treatments
            </span>
            <h1 className="mt-3 text-4xl font-extrabold tracking-tight text-slate-900 md:text-5xl">
              Premium Skincare{" "}
              <span className="bg-linear-to-r from-[#0F9EA5] to-[#2FA4A9] bg-clip-text text-transparent">
                Treatments
              </span>
            </h1>
            <p className="mx-auto mt-4 max-w-2xl text-lg text-slate-600">
              Advanced dermatological procedures performed by specialists using
              modern treatment technology and personalized care plans.
            </p>

            <div className="mt-8 flex flex-wrap items-center justify-center gap-6 text-sm text-slate-600">
              <div className="flex items-center gap-2">
                <Award className="h-4 w-4 text-[#0F9EA5]" />
                <span>Board Certified</span>
              </div>
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-[#0F9EA5]" />
                <span>10,000+ Patients</span>
              </div>
              <div className="flex items-center gap-2">
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
              onChange={(event) => setSearchQuery(event.target.value)}
              className="w-full rounded-lg border border-slate-200 bg-white py-2.5 pl-10 pr-10 text-sm text-slate-700 outline-none focus:border-[#0F9EA5]"
            />
            {searchQuery ? (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-700"
              >
                <X className="h-4 w-4" />
              </button>
            ) : null}
          </div>

          <div className="no-scrollbar flex flex-1 items-center gap-2 overflow-x-auto">
            {categories.map((category) => (
              <button
                key={category.id}
                type="button"
                onClick={() => setActiveCategory(category.id)}
                className={`whitespace-nowrap rounded-full px-4 py-2 text-sm font-medium transition-all ${
                  activeCategory === category.id
                    ? "bg-[#0F9EA5] text-white shadow"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                {category.label}
              </button>
            ))}
          </div>

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
            {filteredTreatments.length}
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
        ) : filteredTreatments.length ? (
          <div className="mt-4 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredTreatments.map((treatment) => {
              const Icon = treatment.icon || Sparkles;

              return (
                <article
                  key={treatment.treatment_id}
                  className="group overflow-hidden rounded-2xl border border-slate-200 bg-white transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
                >
                  <div className="relative h-48 overflow-hidden">
                    <img
                      src={treatment.image}
                      alt={treatment.name}
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
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
                        <p className="mt-1 inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-slate-600">
                          <Icon className="h-3.5 w-3.5" />
                          {treatment.category}
                        </p>
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
