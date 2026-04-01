import { Minus, Plus, ShoppingBag, Trash2 } from "lucide-react";
import { resolveImageUrl } from "@/utils/products/productCardHelpers";

const CartItemCard = ({ item, onIncrease, onDecrease, onRemove, isBusy }) => {
  const imageUrl = resolveImageUrl(item.image);
  const quantity = Number(item.quantity || 1);
  const unitPrice = Number(item.price || 0);
  const totalPrice = unitPrice * quantity;
  const brand = item.brand || "EDERMACARE";

  return (
    <div className="grid grid-cols-1 items-center gap-4 py-5 md:grid-cols-12 md:gap-4">
      <div className="flex items-center gap-4 md:col-span-5">
        <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-slate-200 bg-slate-100 md:h-20 md:w-20">
          {imageUrl ? (
            <img
              src={imageUrl}
              alt={item.name}
              className="h-full w-full object-cover"
            />
          ) : (
            <ShoppingBag className="h-7 w-7 text-slate-400" />
          )}
        </div>

        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-wider text-[#0F9EA5]">
            {brand}
          </p>
          <h3 className="text-sm font-semibold leading-tight text-slate-900">
            {item.name}
          </h3>
        </div>
      </div>

      <div className="flex items-center justify-center md:col-span-2">
        <div className="flex items-center overflow-hidden rounded-md border border-slate-200">
          <button
            type="button"
            onClick={onDecrease}
            disabled={isBusy || quantity <= 1}
            className="px-2.5 py-1.5 text-slate-700 transition-colors hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <Minus className="h-3.5 w-3.5" />
          </button>

          <span className="w-9 border-x border-slate-200 py-1.5 text-center text-sm font-medium text-slate-900">
            {quantity}
          </span>

          <button
            type="button"
            onClick={onIncrease}
            disabled={isBusy}
            className="px-2.5 py-1.5 text-slate-700 transition-colors hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <Plus className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      <div className="text-center md:col-span-2">
        <span className="mr-1 text-xs text-slate-400 md:hidden">Price:</span>
        <span className="text-sm text-slate-800">
          Rs. {unitPrice.toLocaleString()}
        </span>
      </div>

      <div className="text-center md:col-span-2">
        <span className="mr-1 text-xs text-slate-400 md:hidden">Total:</span>
        <span className="text-sm font-semibold text-slate-900">
          Rs. {totalPrice.toLocaleString()}
        </span>
      </div>

      <div className="flex justify-center md:col-span-1">
        <button
          type="button"
          onClick={onRemove}
          disabled={isBusy}
          className="rounded-md p-2 text-red-400 transition-colors hover:bg-red-50 hover:text-red-500 disabled:cursor-not-allowed disabled:opacity-40"
          aria-label="Remove item"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
};

export default CartItemCard;
