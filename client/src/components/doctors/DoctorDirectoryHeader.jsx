import Image from "next/image";
import { Award, Users } from "lucide-react";

const DoctorDirectoryHeader = ({ totalDoctors, availableCount }) => {
  return (
    <section className="space-y-4">
      <div className="relative overflow-hidden rounded-2xl border border-slate-200 shadow-sm">
        <div className="relative h-56 sm:h-45">
          <Image
            src="https://images.unsplash.com/photo-1629909613654-28e377c37b09?auto=format&fit=crop&w=1920&q=80"
            alt="Dermatology clinic"
            fill
            priority
            className="object-cover"
            sizes="(max-width: 640px) 100vw, 1280px"
          />
          <div className="absolute inset-0 bg-linear-to-r from-teal-900/30 via-cyan-900/40 to-sky-900/10" />

          <div className="relative flex h-full items-end p-4 sm:p-6">
            <div className="max-w-2xl">
              <p className="inline-flex rounded-full bg-teal-900/25 px-2.5 py-1 text-xs font-semibold uppercase tracking-widest text-teal-100 ring-1 ring-teal-100/30">
                Our Experts
              </p>
              <h1 className="mt-2 text-3xl font-bold text-sky-50 sm:text-4xl">
                Meet Our <span className="text-cyan-200">Dermatologists</span>
              </h1>
              <p className="mt-2 text-sm text-cyan-50/90 sm:text-base">
                Board-certified skin specialists with experience in clinical and
                cosmetic dermatology.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-4 flex items-center gap-4 text-xs text-slate-500">
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
