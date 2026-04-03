const CheckoutOrderSummary = ({ items, summary }) => {
  const subtotal = Number(summary?.subtotal || 0);
  const shippingFee = Number(summary?.shipping_fee || 0);
  const grandTotal = Number(summary?.grand_total || 0);

  return (
    <aside className="sticky top-24 rounded-xl border border-slate-200 bg-white p-6">
      <h2 className="mb-4 text-lg font-bold text-slate-900">Order Summary</h2>

      <div className="max-h-56 space-y-3 overflow-y-auto pr-1">
        {items.map((item) => (
          <div
            key={item.cart_item_id || item.product_id}
            className="flex items-center justify-between gap-3"
          >
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-slate-900">
                {item.name}
              </p>
              <p className="text-xs text-slate-500">Qty: {item.quantity}</p>
            </div>
            <span className="text-sm font-semibold text-slate-900">
              Rs.{" "}
              {(
                Number(item.price || 0) * Number(item.quantity || 0)
              ).toLocaleString()}
            </span>
          </div>
        ))}
      </div>

      <div className="mt-5 space-y-3 border-t border-slate-200 pt-4 text-sm">
        <div className="flex justify-between">
          <span className="text-slate-500">Sub total</span>
          <span className="font-medium text-slate-900">
            Rs. {subtotal.toLocaleString()}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-slate-500">Shipping</span>
          <span
            className={`font-medium ${shippingFee === 0 ? "text-[#0F9EA5]" : "text-slate-900"}`}
          >
            {shippingFee === 0 ? "Free" : `Rs. ${shippingFee.toLocaleString()}`}
          </span>
        </div>
        <div className="flex justify-between border-t border-slate-200 pt-3">
          <span className="font-bold text-slate-900">Total</span>
          <span className="text-lg font-bold text-[#0F9EA5]">
            Rs. {grandTotal.toLocaleString()}
          </span>
        </div>
      </div>
    </aside>
  );
};

export default CheckoutOrderSummary;
