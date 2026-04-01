"use client";

import { useState } from "react";
import { Minus, Plus, ShoppingCart, Zap, Star } from "lucide-react";
import { formatCategory } from "@/utils/products/productCardHelpers";
import useAddToCart from "@/hooks/useAddToCart";

const StarRating = ({ rating }) => {
  const value = Math.min(5, Math.max(0, Number(rating) || 0));
  return (
    <div className="flex items-center gap-1">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          className={`h-4 w-4 ${
            i < Math.round(value)
              ? "fill-[#E7C873] text-[#E7C873]"
              : "fill-slate-200 text-slate-200"
          }`}
        />
      ))}
      <span className="ml-1.5 text-sm font-medium text-slate-500">
        {value.toFixed(1)}
      </span>
    </div>
  );
};

const StockBadge = ({ qty }) => {
  if (qty <= 0)
    return (
      <span className="rounded-full bg-red-100 px-3 py-1 text-xs font-semibold text-red-600">
        Out of stock
      </span>
    );
  if (qty <= 10)
    return (
      <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-700">
        Only {qty} left
      </span>
    );
  return (
    <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">
      In stock
    </span>
  );
};

const ProductInfoPanel = ({ product }) => {
  const [quantity, setQuantity] = useState(1);
  const { isAdding, addToCart } = useAddToCart();

  const inStock = (product.stock_quantity ?? 0) > 0;
  const maxQty = product.stock_quantity ?? 0;

  const decrease = () => setQuantity((q) => Math.max(1, q - 1));
  const increase = () => setQuantity((q) => Math.min(maxQty, q + 1));

  const handleAddToCart = async () => {
    if (!inStock || isAdding) return;
    await addToCart(product, quantity);
  };

  const skinTypes = Array.isArray(product.skin_type) ? product.skin_type : [];

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap items-center gap-2">
        <span className="rounded-full border border-[#E7C873]/60 bg-[#F5E6B3]/80 px-3 py-1 text-xs font-bold uppercase tracking-wide text-[#8A6B21]">
          {formatCategory(product.category)}
        </span>
        {product.brand?.name && (
          <span className="text-sm font-medium text-[#2FA4A9]">
            by {product.brand.name}
          </span>
        )}
      </div>

      <h1 className="text-2xl font-extrabold leading-snug text-slate-900">
        {product.name}
      </h1>

      <div className="flex flex-wrap items-center gap-3">
        <StarRating rating={product.rating ?? 0} />
        <StockBadge qty={product.stock_quantity ?? 0} />
      </div>

      <div className="h-px bg-slate-100" />

      <div>
        <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
          Price
        </p>
        <p className="text-3xl font-extrabold text-[#1D7D82]">
          Rs {Number(product.price).toFixed(0)}
        </p>
      </div>

      {skinTypes.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {skinTypes.map((type) => (
            <span
              key={type}
              className="rounded-full bg-[#E8F7F8] px-3 py-1 text-xs font-semibold capitalize text-[#2FA4A9]"
            >
              {type}
            </span>
          ))}
        </div>
      )}

      {inStock && (
        <div className="flex flex-col gap-1.5">
          <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
            Quantity
          </p>
          <div className="inline-flex items-center rounded-xl border border-slate-200 bg-white">
            <button
              onClick={decrease}
              disabled={quantity <= 1}
              className="flex h-10 w-10 items-center justify-center rounded-l-xl text-slate-500 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <Minus className="h-4 w-4" />
            </button>

            <span className="w-12 text-center text-sm font-bold text-slate-800">
              {quantity}
            </span>

            <button
              onClick={increase}
              disabled={quantity >= maxQty}
              className="flex h-10 w-10 items-center justify-center rounded-r-xl text-slate-500 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <Plus className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      <div className="flex gap-3">
        <button
          type="button"
          disabled={!inStock || isAdding}
          onClick={handleAddToCart}
          className={`flex cursor-pointer flex-1 items-center justify-center gap-2 rounded-xl py-3 text-sm font-bold tracking-wide transition-all duration-200 ${
            inStock && !isAdding
              ? "bg-[#2FA4A9] text-white hover:bg-[#1D7D82] hover:shadow-md hover:shadow-teal-600/25 active:scale-95"
              : "cursor-not-allowed bg-slate-100 text-slate-400"
          }`}
        >
          <ShoppingCart className="h-4  w-4" />
          {inStock ? (isAdding ? "Adding..." : "Add to Cart") : "Out of Stock"}
        </button>

        {inStock && (
          <button
            type="button"
            className="flex cursor-pointer flex-1 items-center justify-center gap-2 rounded-xl border-2 border-[#2FA4A9] py-3 text-sm font-bold tracking-wide text-[#2FA4A9] transition-all duration-200 hover:bg-[#E8F7F8] active:scale-95"
          >
            Buy Now
          </button>
        )}
      </div>

      {inStock && product.stock_quantity <= 10 && (
        <p className="text-xs text-amber-600">
          Only <strong>{product.stock_quantity}</strong> units left — order
          soon!
        </p>
      )}
    </div>
  );
};

export default ProductInfoPanel;
