const paymentOptions = [
  {
    value: "cod",
    label: "Cash on Delivery",
    description: "Pay when you receive your order",
    enabled: true,
  },
  {
    value: "khalti",
    label: "Khalti",
    description: "Pay online with Khalti",
    enabled: true,
  },
//   {
//     value: "esewa",
//     label: "eSewa (Coming soon)",
//     description: "Not enabled yet",
//     enabled: false,
//   },
//   {
//     value: "stripe",
//     label: "Stripe (Coming soon)",
//     description: "Not enabled yet",
//     enabled: false,
//   },
];

const CheckoutPaymentStep = ({
  paymentMethod,
  onChangePaymentMethod,
  onBack,
  onPlaceOrder,
  isBusy,
  total,
}) => {
  return (
    <div className="space-y-6">
      <section className="rounded-xl border border-slate-200 bg-white p-5">
        <h2 className="mb-4 text-base font-semibold text-slate-900">
          Payment Method
        </h2>

        <div className="space-y-3">
          {paymentOptions.map((option) => {
            const selected = paymentMethod === option.value;
            return (
              <label
                key={option.value}
                className={`flex cursor-pointer items-start gap-3 rounded-lg border p-3 transition ${
                  selected
                    ? "border-[#0F9EA5] bg-[#0F9EA5]/5"
                    : "border-slate-200"
                } ${option.enabled ? "" : "cursor-not-allowed opacity-60"}`}
              >
                <input
                  type="radio"
                  name="payment_method"
                  value={option.value}
                  checked={selected}
                  disabled={!option.enabled || isBusy}
                  onChange={(event) =>
                    onChangePaymentMethod(event.target.value)
                  }
                  className="mt-0.5"
                />
                <div>
                  <p className="text-sm font-semibold text-slate-900">
                    {option.label}
                  </p>
                  <p className="text-xs text-slate-500">{option.description}</p>
                </div>
              </label>
            );
          })}
        </div>
      </section>

      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          onClick={onBack}
          disabled={isBusy}
          className="inline-flex h-11 items-center justify-center rounded-xl border border-slate-300 px-5 text-xs font-semibold uppercase tracking-wider text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-60"
        >
          Back
        </button>

        <button
          type="button"
          onClick={onPlaceOrder}
          disabled={isBusy}
          className="inline-flex h-11 flex-1 items-center justify-center rounded-xl bg-[#1B2731] px-5 text-xs font-semibold uppercase tracking-wider text-white transition hover:bg-[#111B22] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isBusy
            ? "Processing..."
            : `Place Order - Rs. ${Number(total || 0).toLocaleString()}`}
        </button>
      </div>
    </div>
  );
};

export default CheckoutPaymentStep;
