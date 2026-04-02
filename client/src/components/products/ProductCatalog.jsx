"use client";

import ProductFilters from "@/components/products/ProductFilters";
import ProductSearchBar from "@/components/products/ProductSearchBar";
import ProductResultsGrid from "@/components/products/ProductResultsGrid";
import useProductCatalog from "@/hooks/useProductCatalog";
import { Leaf, ShieldCheck, Sparkles } from "lucide-react";

const TRUST_BADGES = [
  { icon: Leaf, label: "Dermatologist-Approved" },
  { icon: ShieldCheck, label: "Clinically Tested" },
  { icon: Sparkles, label: "Premium Skincare" },
];

const ProductCatalog = () => {
  const {
    brands,
    filters,
    searchDraft,
    isLoading,
    error,
    products,
    setSearchDraft,
    handleFilterChange,
    handleResetFilters,
  } = useProductCatalog();

  return (
    <div className="relative min-h-screen bg-slate-50">
      <section className="relative overflow-hidden bg-gradient-to-r from-[#165558] via-[#2FA4A9] to-[#1B8B90]">
        <div className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-8 left-0 h-40 w-40 rounded-full bg-white/10 blur-2xl" />

        <div className="relative mx-auto w-full max-w-7xl px-6 py-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h1 className="text-xl font-extrabold tracking-tight text-white md:text-2xl">
                Shop Skincare That{" "}
                <span className="text-[#F5E6B3]">Actually Works</span>
              </h1>
              <p className="mt-0.5 text-xs text-white/75">
                Dermatologist-recommended products tailored to your skin.
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              {TRUST_BADGES.map(({ icon: Icon, label }) => (
                <span
                  key={label}
                  className="inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1 text-[11px] font-bold text-[#1D7D82] shadow-sm"
                >
                  <Icon className="h-3 w-3 text-[#2FA4A9]" />
                  {label}
                </span>
              ))}
            </div>
          </div>

          <div className="mt-4">
            <ProductSearchBar
              searchDraft={searchDraft}
              onSearchDraftChange={setSearchDraft}
            />
          </div>
        </div>
      </section>

      <main className="mx-auto w-full max-w-7xl px-6 py-7 pb-16">
        {error && (
          <div className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[300px_minmax(0,1fr)]">
          <ProductFilters
            filters={filters}
            brands={brands}
            onFilterChange={handleFilterChange}
            onResetFilters={handleResetFilters}
          />
          <ProductResultsGrid isLoading={isLoading} products={products} />
        </div>
      </main>
    </div>
  );
};

export default ProductCatalog;
