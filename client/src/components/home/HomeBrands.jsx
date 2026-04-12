"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, Globe } from "lucide-react";
import { productService } from "@/services/productService";
import { PRODUCT_ROUTE } from "@/constants/routes";

const MAX_BRANDS = 8;

const BrandCardSkeleton = () => (
  <div className="animate-pulse rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
    <div className="h-10 w-10 rounded-xl bg-slate-200" />
    <div className="mt-4 h-4 w-2/3 rounded bg-slate-200" />
    <div className="mt-2 h-3 w-full rounded bg-slate-100" />
    <div className="mt-1 h-3 w-4/5 rounded bg-slate-100" />
  </div>
);

const BrandAvatar = ({ name, logoUrl }) => {
  const [hasImageError, setHasImageError] = useState(false);
  const initial = name?.charAt(0)?.toUpperCase() || "B";

  if (!logoUrl || hasImageError) {
    return (
      <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-linear-to-br from-[#2FA4A9] to-[#1D7D82] text-sm font-extrabold text-white">
        {initial}
      </span>
    );
  }

  return (
    <img
      src={logoUrl}
      alt={`${name} logo`}
      className="h-10 w-10 rounded-xl border border-slate-200 bg-white object-cover"
      onError={() => setHasImageError(true)}
      loading="lazy"
    />
  );
};

const HomeBrands = () => {
  const [brands, setBrands] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const fetchBrands = async () => {
      try {
        const response = await productService.getBrands();
        if (!isMounted) return;

        const visibleBrands = response
          .filter((brand) => brand.is_active !== false)
          .sort((a, b) => a.name.localeCompare(b.name))
          .slice(0, MAX_BRANDS);

        setBrands(visibleBrands);
      } catch {
        if (!isMounted) return;
        setBrands([]);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    fetchBrands();

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <section id="brands" className="mx-auto w-full max-w-7xl px-6 py-16">
      <div className="mb-10 flex flex-wrap items-end justify-between gap-4">
        <div>
          <span className="inline-block rounded-full bg-[#2FA4A9]/10 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-[#1D7D82]">
            Trusted Brands
          </span>
          <h2 className="mt-4 text-3xl font-extrabold text-slate-900 md:text-4xl">
            Explore Top Skincare Brands
          </h2>
          <p className="mt-3 max-w-2xl text-base text-slate-500">
            Discover dermatologist-recommended brands and jump straight to their
            product collections.
          </p>
        </div>

        <Link
          href={PRODUCT_ROUTE}
          className="group inline-flex items-center gap-2 rounded-xl border border-[#2FA4A9]/30 bg-[#2FA4A9]/8 px-5 py-2.5 text-sm font-bold text-[#1D7D82] transition hover:bg-[#2FA4A9] hover:text-white"
        >
          View all products
          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
        </Link>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {isLoading &&
          Array.from({ length: 4 }).map((_, index) => (
            <BrandCardSkeleton key={index} />
          ))}

        {!isLoading &&
          brands.map((brand) => {
            return (
              <article
                key={brand.brand_id}
                className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition duration-300 hover:-translate-y-1 hover:border-[#2FA4A9]/40 hover:shadow-md"
              >
                <div className="absolute -right-8 -top-8 h-24 w-24 rounded-full bg-[#2FA4A9]/10 blur-2xl" />

                <div className="relative z-10">
                  <BrandAvatar name={brand.name} logoUrl={brand.logo_url} />

                  <h3 className="mt-4 text-lg font-bold text-slate-900">
                    {brand.name}
                  </h3>

                  <p className="mt-2 line-clamp-2 min-h-10 text-sm leading-6 text-slate-500">
                    {brand.description ||
                      "Quality skincare formulations trusted by professionals."}
                  </p>

                  <div className="mt-4 flex items-center justify-between gap-2">
                    <Link
                      href={`${PRODUCT_ROUTE}?brandId=${brand.brand_id}`}
                      className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#1D7D82] transition group-hover:text-[#2FA4A9]"
                    >
                      Browse
                      <ArrowRight className="h-4 w-4" />
                    </Link>

                    {brand.website_url ? (
                      <a
                        href={brand.website_url}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-2.5 py-1 text-xs font-semibold text-slate-600 transition hover:border-[#2FA4A9]/40 hover:text-[#1D7D82]"
                      >
                        <Globe className="h-3.5 w-3.5" />
                        Website
                      </a>
                    ) : null}
                  </div>
                </div>
              </article>
            );
          })}
      </div>

      {!isLoading && brands.length === 0 ? (
        <div className="mt-6 rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-5 text-sm text-slate-600">
          Brands will appear here once they are added from the admin panel.
        </div>
      ) : null}
    </section>
  );
};

export default HomeBrands;
