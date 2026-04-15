"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Package, ShoppingCart, Star } from "lucide-react";
import { productService } from "@/services/productService";
import {
  getFirstImagePath,
  resolveImageUrl,
  formatCategory,
} from "@/utils/products/productCardHelpers";
import useAddToCart from "@/hooks/useAddToCart";

// ─── Single related product card ────────────────────────────────────────────
const RelatedCard = ({ product }) => {
  const imagePath = getFirstImagePath(product.images);
  const imageUrl = resolveImageUrl(imagePath);
  const inStock = (product.stock_quantity ?? 0) > 0;
  const { isAdding, addToCart } = useAddToCart();

  const handleAddToCart = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!inStock || isAdding) return;
    await addToCart(product, 1);
  };

  return (
    <Link
      href={`/products/${product.product_id}`}
      className="group flex flex-col overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-teal-900/10"
    >
      {/* Image */}
      <div className="relative overflow-hidden bg-gradient-to-br from-[#E8F7F8] to-[#DDF2F3]">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={product.name}
            className="h-44 w-full object-cover transition-transform duration-500 group-hover:scale-110"
          />
        ) : (
          <div className="flex h-44 flex-col items-center justify-center gap-2 text-[#2FA4A9]/40">
            <Package className="h-9 w-9" />
            <span className="text-xs font-medium">No image</span>
          </div>
        )}

        {/* Category badge */}
        <span className="absolute left-3 top-3 rounded-full border border-[#E7C873]/70 bg-[#F5E6B3]/95 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-[#8A6B21] shadow-sm">
          {formatCategory(product.category)}
        </span>
      </div>

      {/* Info */}
      <div className="flex flex-1 flex-col gap-2 p-4">
        <span className="text-xs font-medium text-[#2FA4A9]">
          {product.brand?.name || "eDermaCare"}
        </span>

        <h3 className="line-clamp-2 text-sm font-bold leading-snug text-slate-900 group-hover:text-[#1D7D82] transition-colors">
          {product.name}
        </h3>

        {/* Rating */}
        {product.rating > 0 && (
          <div className="flex items-center gap-1">
            <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
            <span className="text-xs font-semibold text-slate-700">
              {Number(product.rating).toFixed(1)}
            </span>
          </div>
        )}

        <div className="mt-auto flex items-center justify-between pt-1">
          <p className="text-lg font-extrabold text-[#1D7D82]">
            Rs {Number(product.price).toFixed(0)}
          </p>

          <button
            type="button"
            disabled={!inStock || isAdding}
            onClick={handleAddToCart}
            className={`flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-bold tracking-wide transition-all duration-200 ${
              inStock && !isAdding
                ? "bg-[#2FA4A9] text-white hover:bg-[#1D7D82] active:scale-95"
                : "cursor-not-allowed bg-slate-100 text-slate-400"
            }`}
          >
            <ShoppingCart className="h-3.5 w-3.5" />
            {inStock ? (isAdding ? "Adding…" : "Add") : "Sold Out"}
          </button>
        </div>
      </div>
    </Link>
  );
};

// ─── Skeleton loader ─────────────────────────────────────────────────────────
const SkeletonCard = () => (
  <div className="animate-pulse overflow-hidden rounded-2xl border border-slate-200/80 bg-white">
    <div className="h-44 bg-slate-200" />
    <div className="p-4 space-y-3">
      <div className="h-3 w-1/3 rounded-full bg-slate-200" />
      <div className="h-4 w-3/4 rounded-full bg-slate-200" />
      <div className="h-3 w-1/4 rounded-full bg-slate-200" />
      <div className="flex justify-between items-center pt-1">
        <div className="h-5 w-20 rounded-full bg-slate-200" />
        <div className="h-8 w-16 rounded-xl bg-slate-200" />
      </div>
    </div>
  </div>
);

// ─── Main section ─────────────────────────────────────────────────────────────
const RelatedProducts = ({ productId }) => {
  const [related, setRelated] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!productId) return;

    let cancelled = false;
    setLoading(true);

    productService.getRelatedProducts(productId, 4).then((data) => {
      if (!cancelled) {
        setRelated(data);
        setLoading(false);
      }
    });

    return () => { cancelled = true; };
  }, [productId]);

  // Don't render the section if there's nothing to show and we're done loading
  if (!loading && related.length === 0) return null;

  return (
    <section className="mt-14 border-t border-slate-100 pt-10">
      {/* Header */}
      <div className="mb-6 flex items-end justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.15em] text-[#2FA4A9]">
            Same Category
          </p>
          <h2 className="mt-1 text-xl font-bold text-slate-900">
            You May Also Like
          </h2>
        </div>
        <Link
          href="/products"
          className="text-sm font-semibold text-[#2FA4A9] transition hover:text-[#1D7D82] hover:underline underline-offset-4"
        >
          View all →
        </Link>
      </div>

      {/* Grid */}
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {loading
          ? Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)
          : related.map((p) => <RelatedCard key={p.product_id} product={p} />)}
      </div>
    </section>
  );
};

export default RelatedProducts;
