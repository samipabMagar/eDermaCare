"use client";

import Link from "next/link";
import { Eye, ShoppingCart, Package } from "lucide-react";
import {
  formatCategory,
  getFirstImagePath,
  resolveImageUrl,
} from "@/utils/products/productCardHelpers";
import useAddToCart from "@/hooks/useAddToCart";

const StockBadge = ({ qty }) => {
  if (qty <= 0)
    return (
      <span className="rounded-full bg-red-100 px-2 py-0.5 text-[10px] font-semibold text-red-600">
        Out of stock
      </span>
    );
  if (qty <= 10)
    return (
      <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-semibold text-amber-700">
        Low stock
      </span>
    );
  return (
    <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-semibold text-emerald-700">
      In stock
    </span>
  );
};

const ProductCard = ({ product }) => {
  const imagePath = getFirstImagePath(product.images);
  const imageUrl = resolveImageUrl(imagePath);
  const inStock = (product.stock_quantity ?? 0) > 0;
  const { isAdding, addToCart } = useAddToCart();

  const handleAddToCart = async (event) => {
    event.preventDefault();
    event.stopPropagation();
    if (!inStock || isAdding) return;
    await addToCart(product, 1);
  };

  return (
    <Link
      href={`/products/${product.product_id}`}
      className="group relative flex flex-col overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1.5 hover:shadow-xl hover:shadow-teal-900/10"
    >
      <div className="relative overflow-hidden bg-linear-to-br from-[#E8F7F8] to-[#DDF2F3]">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={product.name}
            className="h-52 w-full object-cover transition-transform duration-500 group-hover:scale-110"
          />
        ) : (
          <div className="flex h-52 flex-col items-center justify-center gap-2 text-[#2FA4A9]/50">
            <Package className="h-10 w-10" />
            <span className="text-xs font-medium">No image</span>
          </div>
        )}
        <div className="absolute inset-x-0 bottom-0 h-12 bg-linear-to-t from-black/20 to-transparent" />
        <span className="absolute left-3 top-3 rounded-full border border-[#E7C873]/70 bg-[#F5E6B3]/95 px-3 py-1 text-[11px] font-bold uppercase tracking-wide text-[#8A6B21] shadow-sm">
          {formatCategory(product.category)}
        </span>
      </div>

      <div className="flex flex-1 flex-col gap-2 p-4">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-[#2FA4A9]">
            {product.brand?.name || "No brand"}
          </span>
          <StockBadge qty={product.stock_quantity ?? 0} />
        </div>

        <h3 className="line-clamp-1 text-[15px] font-bold leading-snug text-slate-900">
          {product.name}
        </h3>

        <div className="flex items-center justify-between">
          <p className="text-xl font-extrabold text-[#1D7D82]">
            Rs {Number(product.price).toFixed(0)}
          </p>
        </div>

        <div className="mt-auto flex gap-2">
          <Link
            href={`/products/${product.product_id}`}
            onClick={(e) => e.stopPropagation()}
            className="flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-[#2FA4A9]/50 py-2.5 text-xs font-bold text-[#2FA4A9] transition hover:bg-[#E8F7F8] active:scale-95"
          >
            <Eye className="h-3.5 w-3.5" />
            Details
          </Link>

          <button
            type="button"
            disabled={!inStock || isAdding}
            onClick={handleAddToCart}
            className={`flex flex-1 items-center justify-center gap-1.5 rounded-xl py-2.5 text-xs font-bold tracking-wide shadow-sm transition-all duration-200 ${
              inStock && !isAdding
                ? "bg-[#2FA4A9] text-white hover:bg-[#1D7D82] active:scale-95"
                : "cursor-not-allowed bg-slate-100 text-slate-400"
            }`}
          >
            <ShoppingCart className="h-3.5 w-3.5" />
            {inStock ? (isAdding ? "Adding..." : "Add to Cart") : "Sold Out"}
          </button>
        </div>
      </div>
    </Link>
  );
};

export default ProductCard;
