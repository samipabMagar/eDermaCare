"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { productService } from "@/services/productService";
import { PRODUCT_ROUTE } from "@/constants/routes";
import { resolveImageUrl } from "@/utils/products/productCardHelpers";

const MAX_BRANDS = 8;

const BrandAvatar = ({ name, logoUrl, size = "lg" }) => {
  const [imgError, setImgError] = useState(false);
  const initial = name?.charAt(0)?.toUpperCase() || "B";
  const resolved = resolveImageUrl(logoUrl);
  const sizeClass =
    size === "lg"
      ? "h-14 w-14 text-xl rounded-2xl"
      : "h-16 w-16 text-lg rounded-full";

  if (!resolved || imgError) {
    return (
      <span
        className={`inline-flex flex-shrink-0 items-center justify-center bg-gradient-to-br from-[#2FA4A9] to-[#1D7D82] font-extrabold text-white shadow-md ${sizeClass}`}
      >
        {initial}
      </span>
    );
  }

  return (
    <img
      src={resolved}
      alt={`${name} logo`}
      className={`flex-shrink-0 border border-white/60 bg-white object-cover shadow-md ${sizeClass}`}
      onError={() => setImgError(true)}
      loading="lazy"
    />
  );
};

const BrandTicker = ({ brands }) => {
  const items = [...brands];

  return (
    <div className="relative overflow-hidden">
      <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-20 bg-gradient-to-r from-[#f0fafa] to-transparent" />
      <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-20 bg-gradient-to-l from-[#f0fafa] to-transparent" />

      <div
        className="flex animate-marquee items-center gap-14 py-3"
        style={{ width: "max-content" }}
      >
        {items.map((brand, i) => (
          <Link
            key={`${brand.brand_id}-${i}`}
            href={`${PRODUCT_ROUTE}?brandId=${brand.brand_id}`}
            className="group flex flex-shrink-0 flex-col items-center gap-4 transition-transform hover:-translate-y-0.5"
          >
            {/* Circle avatar */}
            <div className="relative">
              <BrandAvatar
                name={brand.name}
                logoUrl={brand.logo_url}
                size="sm"
              />
             
              <span className="absolute inset-0 rounded-full ring-0 ring-[#2FA4A9]/40 transition-all group-hover:ring-2" />
            </div>
            {/* Brand name label */}
            <span className="whitespace-nowrap text-xs font-bold text-slate-500 group-hover:text-[#1D7D82] transition-colors">
              {brand.name}
            </span>
          </Link>
        ))}
      </div>
    </div>
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
        const visible = response
          .filter((b) => b.is_active !== false)
          .sort((a, b) => a.name.localeCompare(b.name))
          .slice(0, MAX_BRANDS);
        setBrands(visible);
      } catch {
        if (isMounted) setBrands([]);
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
    <section
      id="brands"
      className="relative w-full overflow-hidden bg-gradient-to-b from-[#f0fafa] via-white to-white py-20"
    >
      <div className="pointer-events-none absolute -left-32 top-0 h-72 w-72 rounded-full bg-[#2FA4A9]/8 blur-3xl" />
      <div className="pointer-events-none absolute -right-32 bottom-0 h-72 w-72 rounded-full bg-[#2FA4A9]/6 blur-3xl" />

      <div className="relative mx-auto w-full max-w-7xl px-6">
        <div className="mb-12 flex flex-wrap items-end justify-between gap-6">
          <div className="max-w-xl">
            <span className="inline-flex items-center gap-2 rounded-full bg-[#2FA4A9]/10 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-[#1D7D82]">
              Trusted Brands
            </span>
            <h2 className="mt-4 text-3xl font-extrabold leading-tight text-slate-900 md:text-4xl">
              Explore Top{" "}
              <span className="bg-gradient-to-r from-[#2FA4A9] to-[#1D7D82] bg-clip-text text-transparent">
                Skincare Brands
              </span>
            </h2>
            <p className="mt-3 text-base leading-relaxed text-slate-500">
              Dermatologist-recommended brands curated for every skin type and
              concern.
            </p>
          </div>

          <Link
            href={PRODUCT_ROUTE}
            className="group inline-flex items-center gap-2 rounded-2xl border border-[#2FA4A9]/30 bg-white px-5 py-2.5 text-sm font-bold text-[#1D7D82] shadow-sm transition-all hover:bg-[#2FA4A9] hover:text-white hover:shadow-md"
          >
            View all products
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>

        {!isLoading && brands.length > 0 && (
          <div className="mb-12">
            <BrandTicker brands={brands} />
          </div>
        )}

        {!isLoading && brands.length === 0 && (
          <div className="mt-6 rounded-3xl border border-dashed border-slate-200 bg-white/60 p-8 text-center text-sm text-slate-400">
            Brands will appear here once they are added from the admin panel.
          </div>
        )}
      </div>
    </section>
  );
};

export default HomeBrands;
