const CheckoutInfoStep = ({ formData, onChange, onContinue, isBusy }) => {
  return (
    <div className="space-y-6">
      <section className="rounded-xl border border-slate-200 bg-white p-5">
        <h2 className="mb-4 text-base font-semibold text-slate-900">
          Delivery Information
        </h2>

        <div className="space-y-4">
          <div>
            <label
              htmlFor="full_name"
              className="mb-1.5 block text-sm font-medium text-slate-700"
            >
              Full Name
            </label>
            <input
              id="full_name"
              value={formData.full_name}
              onChange={(event) => onChange("full_name", event.target.value)}
              placeholder="Your full name"
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none focus:border-[#0F9EA5]"
            />
          </div>

          <div>
            <label
              htmlFor="email"
              className="mb-1.5 block text-sm font-medium text-slate-700"
            >
              Email
            </label>
            <input
              id="email"
              type="email"
              value={formData.email}
              onChange={(event) => onChange("email", event.target.value)}
              placeholder="you@example.com"
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none focus:border-[#0F9EA5]"
            />
          </div>

          <div>
            <label
              htmlFor="shipping_address"
              className="mb-1.5 block text-sm font-medium text-slate-700"
            >
              Shipping Address
            </label>
            <textarea
              id="shipping_address"
              value={formData.shipping_address}
              onChange={(event) =>
                onChange("shipping_address", event.target.value)
              }
              placeholder="Street, area, city"
              rows={3}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none focus:border-[#0F9EA5]"
            />
          </div>

          <div>
            <label
              htmlFor="contact_phone"
              className="mb-1.5 block text-sm font-medium text-slate-700"
            >
              Contact Phone
            </label>
            <input
              id="contact_phone"
              value={formData.contact_phone}
              onChange={(event) =>
                onChange("contact_phone", event.target.value)
              }
              placeholder="98XXXXXXXX"
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none focus:border-[#0F9EA5]"
            />
          </div>

          <div>
            <label
              htmlFor="notes"
              className="mb-1.5 block text-sm font-medium text-slate-700"
            >
              Notes (Optional)
            </label>
            <textarea
              id="notes"
              value={formData.notes}
              onChange={(event) => onChange("notes", event.target.value)}
              placeholder="Any delivery notes"
              rows={2}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none focus:border-[#0F9EA5]"
            />
          </div>
        </div>
      </section>

      <button
        type="button"
        onClick={onContinue}
        disabled={isBusy}
        className="inline-flex h-11 items-center justify-center rounded-xl bg-[#1B2731] px-5 text-xs font-semibold uppercase tracking-wider text-white transition hover:bg-[#111B22] disabled:cursor-not-allowed disabled:opacity-60"
      >
        Continue to Payment
      </button>
    </div>
  );
};

export default CheckoutInfoStep;
