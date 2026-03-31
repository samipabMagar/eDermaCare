import Image from "next/image";
import { ShieldCheck, Zap, Sparkles } from "lucide-react";

const TRUST_POINTS = [
  {
    icon: ShieldCheck,
    title: "Verified Doctors",
    description:
      "Every doctor is reviewed and verified, giving you peace of mind that your guidance comes from trusted professionals.",
    iconColor: "text-emerald-600",
    iconBg: "bg-emerald-50",
  },
  {
    icon: Zap,
    title: "Smooth Experience",
    description:
      "From booking to ordering products, every step is designed to be fast, clear, and simple — even for first-time users.",
    iconColor: "text-[#1D7D82]",
    iconBg: "bg-[#2FA4A9]/10",
  },
  {
    icon: Sparkles,
    title: "Modern Platform",
    description:
      "A clean, modern design that keeps everything organized and saves your time with fast, intuitive navigation.",
    iconColor: "text-amber-600",
    iconBg: "bg-amber-50",
  },
];

const HomeWhyUs = () => (
  <section id="why-us" className="mx-auto w-full max-w-7xl px-6 py-16">
    <div className="grid gap-12 md:grid-cols-2 md:items-center">
      <div className="flex flex-col gap-6">
        <div>
          <span className="inline-block rounded-full bg-[#2FA4A9]/10 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-[#1D7D82]">
            Why Choose Us
          </span>
          <h2 className="mt-4 text-3xl font-extrabold text-slate-900 md:text-4xl">
            Why People Trust eDermaCare
          </h2>
          <p className="mt-3 text-base text-slate-500">
            Built around your skin health — with verified experts, simple tools,
            and a platform that actually works.
          </p>
        </div>

        <div className="flex flex-col gap-4">
          {TRUST_POINTS.map((point) => (
            <div
              key={point.title}
              className="flex items-start gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:shadow-md"
            >
              <div className={`flex-shrink-0 rounded-xl p-2.5 ${point.iconBg}`}>
                <point.icon className={`h-5 w-5 ${point.iconColor}`} />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  {point.title}
                </h3>
                <p className="mt-1 text-sm leading-6 text-slate-600">
                  {point.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="relative h-[420px] md:h-[500px]">
        <div className="relative h-full w-full overflow-hidden rounded-3xl shadow-xl">
          <Image
            src="https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=800&q=80"
            alt="Verified dermatologist at eDermaCare"
            fill
            className="object-cover object-top"
            sizes="(max-width: 768px) 100vw, 50vw"
          />

          <div className="absolute inset-0 bg-gradient-to-t from-[#0D4F52]/60 via-transparent to-transparent" />
        </div>

        <div className="absolute left-4 top-4 flex items-center gap-2 rounded-2xl bg-white/95 px-4 py-3 shadow-lg backdrop-blur-sm">
          <span className="text-xl font-extrabold text-[#1D7D82]">4.9★</span>
          <div>
            <p className="text-[11px] font-bold text-slate-800">
              Patient Rating
            </p>
            <p className="text-[10px] text-slate-400">10,000+ reviews</p>
          </div>
        </div>

        <div className="absolute bottom-4 right-4 flex items-center gap-2 rounded-2xl bg-white/95 px-4 py-3 shadow-lg backdrop-blur-sm">
          <span className="text-xl font-extrabold text-[#1D7D82]">500+</span>
          <div>
            <p className="text-[11px] font-bold text-slate-800">
              Verified Doctors
            </p>
            <p className="text-[10px] text-slate-400">ready to help you</p>
          </div>
        </div>
      </div>
    </div>
  </section>
);

export default HomeWhyUs;
