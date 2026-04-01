import Link from "next/link";

const CartSummaryCard = ({ summary, isBusy }) => {
  const subtotal = Number(summary.subtotal || 0);
  const shippingFee = subtotal > 3000 ? 0 : 150;
  const total = subtotal + shippingFee;

  return (
    <aside className="sticky top-24 rounded-xl border border-slate-200 bg-white p-6">
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-lg font-bold text-slate-900">Order Summary</h2>
        <p className="text-sm text-slate-500">
          {summary.item_count} {summary.item_count === 1 ? "Item" : "Items"}
        </p>
      </div>

      <div className="space-y-4 text-sm">
        <div className="flex justify-between">
          <span className="text-slate-500">Sub total</span>
          <span className="font-medium text-slate-900">
            Rs. {subtotal.toLocaleString()}
          </span>
        </div>

        <div className="flex justify-between">
          <span className="text-slate-500">Shipping Fee</span>
          <span
            className={`font-medium ${shippingFee === 0 ? "text-[#0F9EA5]" : "text-slate-900"}`}
          >
            {shippingFee === 0 ? "Free" : `Rs. ${shippingFee.toLocaleString()}`}
          </span>
        </div>

        {shippingFee > 0 && (
          <p className="text-xs text-[#0F9EA5]">
            Free shipping on orders above Rs. 3,000
          </p>
        )}
      </div>

      <div className="mt-4 border-t border-slate-200 pt-4">
        <div className="flex justify-between">
          <span className="font-bold text-slate-900">Total cost</span>
          <span className="text-lg font-bold text-[#0F9EA5]">
            Rs. {total.toLocaleString()}
          </span>
        </div>
      </div>

      <Link
        href="/checkout"
        className={`mt-6 inline-flex h-11 w-full items-center justify-center rounded-xl bg-[#1B2731] px-4 text-xs font-semibold uppercase tracking-wider text-white transition hover:bg-[#111B22] ${
          summary.item_count < 1 || isBusy
            ? "pointer-events-none opacity-50"
            : ""
        }`}
      >
        Proceed to Checkout
      </Link>
    </aside>
  );
};

export default CartSummaryCard;
