import { X, Package } from "lucide-react";
import { resolveImageUrl } from "@/utils/products/productCardHelpers";

const formatCurrency = (value) => `NPR ${Number(value || 0).toLocaleString()}`;

const formatDate = (value) => {
  if (!value) return "N/A";
  return new Date(value).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

export default function OrderDetailsModal({ isOpen, onClose, order }) {
  if (!isOpen || !order) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm"
      onClick={onClose}
    >
      <div 
        className="relative w-full max-w-md max-h-[85vh] overflow-hidden rounded-2xl bg-white shadow-2xl flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="flex items-center justify-between border-b border-slate-200 px-5 py-4 shrink-0">
          <div>
            <h3 className="font-bold text-slate-900">Order Details</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              {order.order_number} &bull; {formatDate(order.created_at)}
            </p>
          </div>
          <button
            onClick={onClose}
            className="rounded-full p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition"
          >
            <X className="h-5 w-5" />
          </button>
        </header>

        <div className="overflow-y-auto p-5 grow">
          <div className="space-y-4">
            {order.items?.length > 0 ? (
              order.items.map((item) => (
                <div key={item.order_item_id} className="flex gap-4 p-3 rounded-xl border border-slate-100 bg-slate-50">
                  <div className="h-16 w-16 shrink-0 rounded-lg border border-slate-200 bg-white overflow-hidden relative">
                    {item.product_image ? (
                      <img
                        src={resolveImageUrl(item.product_image)}
                        alt={item.product_name}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center bg-slate-100 text-slate-400">
                        <Package className="h-6 w-6" />
                      </div>
                    )}
                  </div>
                  <div className="flex flex-col justify-center min-w-0 flex-1">
                    <p className="font-medium text-sm text-slate-900 line-clamp-2" title={item.product_name}>
                      {item.product_name}
                    </p>
                    <div className="flex items-center justify-between mt-2 text-sm">
                      <span className="text-slate-500">{item.quantity} x {formatCurrency(item.unit_price)}</span>
                      <span className="font-semibold text-slate-900">{formatCurrency(item.line_total)}</span>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-center text-sm text-slate-500 py-4">No items found</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
