const steps = ["Information", "Payment"];

const CheckoutProgress = ({ currentStep }) => {
  return (
    <div className="mb-8 flex items-center gap-3">
      {steps.map((label, index) => {
        const stepNumber = index + 1;
        const isActive = currentStep >= stepNumber;

        return (
          <div
            key={label}
            className="flex flex-1 items-center gap-3 last:flex-initial"
          >
            <div
              className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold ${
                isActive
                  ? "bg-[#0F9EA5] text-white"
                  : "bg-slate-200 text-slate-500"
              }`}
            >
              {stepNumber}
            </div>
            <span
              className={`text-sm font-medium ${
                isActive ? "text-slate-900" : "text-slate-500"
              }`}
            >
              {label}
            </span>
            {index < steps.length - 1 && (
              <div className="h-px flex-1 bg-slate-200" />
            )}
          </div>
        );
      })}
    </div>
  );
};

export default CheckoutProgress;
