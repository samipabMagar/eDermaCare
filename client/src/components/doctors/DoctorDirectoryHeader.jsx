import { Award, Users } from "lucide-react";

const DoctorDirectoryHeader = ({
  totalDoctors,
  availableCount,
  averageRating,
}) => {
  return (
    <section className="relative overflow-hidden rounded-2xl border border-slate-200 bg-linear-to-br from-teal-50 via-cyan-50 to-white p-6 shadow-sm sm:p-8">
      <div className="max-w-2xl">
        <p className="text-xs font-semibold uppercase tracking-widest text-teal-700">
          Our Experts
        </p>
        <h1 className="mt-2 text-3xl font-bold text-slate-900 sm:text-4xl">
          Meet Our Dermatologists
        </h1>
        <p className="mt-3 text-sm text-slate-600 sm:text-base">
          Board-certified skin specialists with experience in clinical and
          cosmetic dermatology.
        </p>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
        <div className="rounded-xl border border-teal-100 bg-white/85 p-3">
          <p className="text-[11px] uppercase tracking-wide text-slate-500">
            Total Doctors
          </p>
          <p className="mt-0.5 text-xl font-semibold text-slate-900">
            {totalDoctors}
          </p>
        </div>

        <div className="rounded-xl border border-teal-100 bg-white/85 p-3">
          <p className="text-[11px] uppercase tracking-wide text-slate-500">
            Available Now
          </p>
          <p className="mt-0.5 text-xl font-semibold text-emerald-700">
            {availableCount}
          </p>
        </div>

        <div className="rounded-xl border border-teal-100 bg-white/85 p-3">
          <p className="text-[11px] uppercase tracking-wide text-slate-500">
            Average Rating
          </p>
          <p className="mt-0.5 text-xl font-semibold text-teal-700">
            {averageRating}
          </p>
        </div>
      </div>

      <div className="pointer-events-none absolute -right-10 -top-12 hidden h-40 w-40 rounded-full bg-teal-100/70 blur-2xl md:block" />
      <div className="pointer-events-none absolute -bottom-10 right-12 hidden h-24 w-24 rounded-full bg-cyan-100/80 blur-xl md:block" />

      <div className="mt-5 flex items-center gap-4 text-xs text-slate-500">
        <span className="inline-flex items-center gap-1.5">
          <Users className="h-3.5 w-3.5 text-teal-700" />
          Trusted by patients across Nepal
        </span>
        <span className="inline-flex items-center gap-1.5">
          <Award className="h-3.5 w-3.5 text-teal-700" />
          Approved dermatologist network
        </span>
      </div>
    </section>
  );
};

export default DoctorDirectoryHeader;
