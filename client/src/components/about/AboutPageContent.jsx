"use client";

import Image from "next/image";
import Link from "next/link";
import {
  ShieldCheck,
  Stethoscope,
  Sparkles,
  HeartHandshake,
  ArrowRight,
  CheckCircle2,
  Award,
  Users,
  Star,
  Clock,
  ShoppingBag,
  FlaskConical,
} from "lucide-react";
import {
  DOCTORS_ROUTE,
  PRODUCT_ROUTE,
  TREATMENTS_ROUTE,
} from "@/constants/routes";

const stats = [
  { value: "12,000+", label: "Patients Served", icon: Users },
  { value: "120+", label: "Expert Dermatologists", icon: Stethoscope },
  { value: "98%", label: "Satisfaction Rate", icon: Star },
  { value: "24/7", label: "Online Support", icon: Clock },
];

const values = [
  {
    icon: ShieldCheck,
    title: "Evidence-Based Care",
    description:
      "Every recommendation is grounded in peer-reviewed dermatology research and clinical best practices — never guesswork.",
  },
  {
    icon: Sparkles,
    title: "Premium Products",
    description:
      "We curate only dermatologist-approved skincare from globally certified brands, so you never have to second-guess a label.",
  },
  {
    icon: HeartHandshake,
    title: "Patient-First Approach",
    description:
      "From your first consultation to ongoing follow-ups, your comfort, privacy, and skin health outcomes are always our top priority.",
  },
  {
    icon: Award,
    title: "Trusted Expertise",
    description:
      "Our board-certified dermatologists bring decades of combined clinical experience across a wide range of skin conditions.",
  },
];

export default function AboutPageContent() {
  return (
    <div className="min-h-screen bg-white text-slate-800 selection:bg-[#2FA4A9]/20">
      <section className="relative overflow-hidden py-36 text-white">
        <Image
          src="https://images.unsplash.com/photo-1666214277730-e9c7e755e5a3?w=1920&q=85&auto=format&fit=crop"
          alt="Doctor and patient in consultation" 
          fill
          priority
          className="object-cover object-top"
          sizes="100vw"
        />

        <div className="absolute inset-0 bg-gradient-to-br from-slate-800/40 via-[#0a2e30]/52 to-slate-900/48" />


        <div
          className="pointer-events-none absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage:
              "radial-gradient(circle, #2FA4A9 1px, transparent 1px)",
            backgroundSize: "32px 32px",
          }}
        />

        <div className="pointer-events-none absolute -left-20 top-10 h-72 w-72 rounded-full bg-[#2FA4A9]/25 blur-[90px] animate-pulse" />
        <div
          className="pointer-events-none absolute right-10 top-20 h-56 w-56 rounded-full bg-[#E7C873]/15 blur-[80px]"
          style={{ animation: "pulse 4s ease-in-out 1s infinite" }}
        />
        <div
          className="pointer-events-none absolute bottom-20 left-1/2 h-48 w-48 -translate-x-1/2 rounded-full bg-[#2FA4A9]/15 blur-[70px]"
          style={{ animation: "pulse 5s ease-in-out 2s infinite" }}
        />

        <div className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full border border-[#2FA4A9]/20" />
        <div className="pointer-events-none absolute -right-8 -top-8 h-48 w-48 rounded-full border border-[#2FA4A9]/15" />

        <div className="pointer-events-none absolute -bottom-10 -left-10 h-56 w-56 rounded-full border border-[#E7C873]/15" />

        <div className="relative mx-auto max-w-4xl px-6 text-center">
          <span className="mb-6 inline-flex items-center gap-2 rounded-full border border-[#2FA4A9]/40 bg-[#2FA4A9]/15 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-[#7dd8dc] backdrop-blur-sm">
            <span className="h-1.5 w-1.5 rounded-full bg-[#2FA4A9]" />
            About eDermaCare
          </span>

          <h1 className="text-4xl font-extrabold leading-tight tracking-tight sm:text-5xl lg:text-6xl">
            Skin Health,{" "}
            <span className="bg-gradient-to-r from-[#2FA4A9] to-[#7dd8dc] bg-clip-text text-transparent">
              Reimagined
            </span>
          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-base leading-relaxed text-slate-200 sm:text-lg">
            eDermaCare bridges the gap between patients and world-class
            dermatological care — combining expert consultations, evidence-based
            treatments, and premium skincare products in one trusted platform.
          </p>

          <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
            <Link
              href={PRODUCT_ROUTE}
              className="inline-flex items-center gap-2 rounded-xl bg-[#2FA4A9] px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-[#2FA4A9]/30 transition hover:bg-[#25888d] hover:shadow-[#2FA4A9]/50 active:scale-95"
            >
              <ShoppingBag className="h-4 w-4" />
              Shop Products
            </Link>
            <Link
              href={TREATMENTS_ROUTE}
              className="inline-flex items-center gap-2 rounded-xl border border-white/25 bg-white/10 px-6 py-3 text-sm font-semibold text-white backdrop-blur transition hover:bg-white/20"
            >
              <FlaskConical className="h-4 w-4" />
              Browse Treatments
            </Link>
          </div>
        </div>
      </section>

      <section className="relative z-10 -mt-8 px-6 pb-6">
        <div className="mx-auto grid max-w-5xl grid-cols-2 gap-4 sm:grid-cols-4">
          {stats.map(({ value, label, icon: Icon }) => (
            <div
              key={label}
              className="group flex flex-col items-center gap-3 rounded-2xl bg-white p-6 shadow-xl shadow-slate-200/70 ring-1 ring-slate-100 transition hover:-translate-y-1 hover:shadow-2xl hover:ring-[#2FA4A9]/30"
            >
              <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#e8f7f8] text-[#2FA4A9] transition group-hover:bg-[#2FA4A9] group-hover:text-white">
                <Icon className="h-5 w-5" />
              </span>
              <p className="text-2xl font-extrabold text-slate-800">{value}</p>
              <p className="text-center text-xs font-medium text-slate-500">
                {label}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-20">
        <div className="grid items-center gap-14 lg:grid-cols-2">
          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-[#2FA4A9]">
              Our Mission
            </span>
            <h2 className="mt-3 text-3xl font-extrabold leading-tight text-slate-900 sm:text-4xl">
              Accessible Dermatology{" "}
              <span className="text-[#2FA4A9]">for Everyone</span>
            </h2>
            <p className="mt-5 text-[15px] leading-relaxed text-slate-600">
              Skin conditions affect one in three people worldwide, yet access
              to qualified dermatologists remains limited by geography and cost.
              eDermaCare was built to change that — connecting patients with
              board-certified dermatologists, providing evidence-based treatment
              plans, and delivering clinically approved skincare products right
              to your door.
            </p>
            <p className="mt-4 text-[15px] leading-relaxed text-slate-600">
              We believe every person deserves expert skin care, not just those
              who live near a specialist or can afford premium clinic prices.
            </p>

            <ul className="mt-8 space-y-3">
              {[
                "Board-certified dermatologists only",
                "End-to-end encrypted consultations",
                "Clinically verified product recommendations",
                "Personalised treatment plans within hours",
              ].map((pt) => (
                <li
                  key={pt}
                  className="flex items-start gap-3 text-sm text-slate-700"
                >
                  <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-[#2FA4A9]" />
                  {pt}
                </li>
              ))}
            </ul>

            <Link
              href={DOCTORS_ROUTE}
              className="mt-9 inline-flex items-center gap-2 rounded-xl bg-[#2FA4A9] px-6 py-3 text-sm font-semibold text-white shadow-md shadow-[#2FA4A9]/20 transition hover:bg-[#25888d] active:scale-95"
            >
              Meet Our Doctors <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          {/* image side */}
          <div className="relative h-[480px] overflow-hidden rounded-3xl shadow-2xl">
            <Image
              src="https://images.unsplash.com/photo-1551076805-e1869033e561?w=900&q=80"
              alt="Doctor in clinical consultation"
              fill
              className="object-cover object-center"
              sizes="(max-width: 1024px) 100vw, 50vw"
            />

            <div className="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-slate-900/50 to-transparent" />
            <div className="absolute bottom-6 left-6 right-6">
              <div className="inline-flex items-center gap-2 rounded-xl border border-white/20 bg-white/10 px-4 py-2.5 text-sm font-semibold text-white backdrop-blur-md">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
                </span>
                Online consultations available 24 / 7
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-slate-50 py-24">
        <div className="mx-auto max-w-7xl px-6">
          <div className="mx-auto max-w-2xl text-center">
            <span className="text-xs font-bold uppercase tracking-widest text-[#2FA4A9]">
              Our Values
            </span>
            <h2 className="mt-3 text-3xl font-extrabold text-slate-900 sm:text-4xl">
              What We Stand For
            </h2>
            <p className="mt-4 text-[15px] text-slate-600">
              Every decision we make is guided by these core principles that
              keep patients safe, informed, and empowered.
            </p>
          </div>

          <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {values.map(({ icon: Icon, title, description }) => (
              <div
                key={title}
                className="group relative overflow-hidden rounded-2xl bg-white p-7 shadow-md shadow-slate-200/60 ring-1 ring-slate-100 transition hover:-translate-y-1.5 hover:shadow-xl hover:ring-[#2FA4A9]/30"
              >
                <div className="absolute inset-x-0 top-0 h-0.5 origin-left scale-x-0 bg-gradient-to-r from-[#2FA4A9] to-[#7dd8dc] transition-transform duration-300 group-hover:scale-x-100" />

                <span className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-[#e8f7f8] text-[#2FA4A9] transition group-hover:bg-[#2FA4A9] group-hover:text-white">
                  <Icon className="h-6 w-6" />
                </span>
                <h3 className="mt-5 font-bold text-slate-900">{title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-500">
                  {description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-24">
        <div className="grid items-center gap-14 lg:grid-cols-2">
          <div className="relative h-[420px] overflow-hidden rounded-3xl shadow-xl order-2 lg:order-1">
            <Image
              src="https://images.unsplash.com/photo-1616394584738-fc6e612e71b9?w=900&q=80"
              alt="Premium skincare products arranged neatly"
              fill
              className="object-cover object-top"
              sizes="(max-width: 1024px) 100vw, 50vw"
            />
            <div className="absolute inset-0 bg-gradient-to-tr from-[#2FA4A9]/30 to-transparent" />

            <div className="absolute left-5 top-5 flex items-center gap-2.5 rounded-2xl border border-white/20 bg-white/90 px-4 py-2.5 shadow-lg backdrop-blur-sm">
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#e8f7f8] text-[#2FA4A9]">
                <ShieldCheck className="h-5 w-5" />
              </span>
              <div>
                <p className="text-xs font-bold text-slate-800">
                  100% Verified
                </p>
                <p className="text-[11px] text-slate-500">
                  Dermatologist-approved
                </p>
              </div>
            </div>
          </div>

          <div className="order-1 lg:order-2">
            <span className="text-xs font-bold uppercase tracking-widest text-[#2FA4A9]">
              Why eDermaCare
            </span>
            <h2 className="mt-3 text-3xl font-extrabold leading-tight text-slate-900 sm:text-4xl">
              Everything Your Skin{" "}
              <span className="text-[#2FA4A9]">Needs, In One Place</span>
            </h2>
            <p className="mt-5 text-[15px] leading-relaxed text-slate-600">
              From expert medical consultations to clinically tested skincare,
              eDermaCare covers every step of your skin health journey — so you
              never have to search elsewhere.
            </p>

            <div className="mt-8 space-y-5">
              {[
                {
                  title: "Expert Consultations",
                  desc: "Video or chat-based sessions with board-certified dermatologists at your convenience.",
                },
                {
                  title: "Personalised Treatment Plans",
                  desc: "Receive a tailored treatment protocol based on your skin type, concerns, and history.",
                },
                {
                  title: "Curated Skincare Products",
                  desc: "Browse hundreds of dermatologist-approved products, all quality-verified before listing.",
                },
                {
                  title: "Ongoing Follow-Up Support",
                  desc: "Stay connected with your doctor through follow-up messages and progress tracking.",
                },
              ].map(({ title, desc }) => (
                <div key={title} className="flex gap-4">
                  <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#e8f7f8]">
                    <CheckCircle2 className="h-4 w-4 text-[#2FA4A9]" />
                  </span>
                  <div>
                    <p className="text-sm font-bold text-slate-800">{title}</p>
                    <p className="mt-0.5 text-sm text-slate-500">{desc}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-9 flex flex-wrap gap-3">
              <Link
                href={TREATMENTS_ROUTE}
                className="inline-flex items-center gap-2 rounded-xl bg-[#2FA4A9] px-5 py-2.5 text-sm font-semibold text-white shadow-md shadow-[#2FA4A9]/20 transition hover:bg-[#25888d] active:scale-95"
              >
                <FlaskConical className="h-4 w-4" /> View Treatments
              </Link>
              <Link
                href={PRODUCT_ROUTE}
                className="inline-flex items-center gap-2 rounded-xl border border-[#2FA4A9]/40 px-5 py-2.5 text-sm font-semibold text-[#2FA4A9] transition hover:bg-[#e8f7f8]"
              >
                <ShoppingBag className="h-4 w-4" /> Shop Products
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="relative overflow-hidden bg-gradient-to-br from-[#2FA4A9] to-[#1d7a7e] py-20 text-white">
        <div className="pointer-events-none absolute -right-20 -top-20 h-72 w-72 rounded-full bg-white/10 blur-3xl" />
        <div className="pointer-events-none absolute -left-10 bottom-0 h-60 w-60 rounded-full bg-white/5 blur-3xl" />

        <div className="relative mx-auto max-w-3xl px-6 text-center">
          <h2 className="text-3xl font-extrabold sm:text-4xl">
            Ready to Take Care of Your Skin?
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-base text-white/80">
            Consult expert dermatologists, explore clinically tested treatments,
            and shop premium skincare products — all in one place.
          </p>

          <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
            <Link
              href={DOCTORS_ROUTE}
              className="inline-flex items-center gap-2 rounded-xl bg-white px-6 py-3.5 text-sm font-bold text-[#2FA4A9] shadow-lg transition hover:bg-slate-50 hover:shadow-xl active:scale-95"
            >
              <Stethoscope className="h-4 w-4" />
              Book a Consultation
            </Link>
            <Link
              href={PRODUCT_ROUTE}
              className="inline-flex items-center gap-2 rounded-xl border border-white/30 bg-white/10 px-6 py-3.5 text-sm font-semibold text-white backdrop-blur transition hover:bg-white/20"
            >
              <ShoppingBag className="h-4 w-4" />
              Browse Products
            </Link>
            <Link
              href={TREATMENTS_ROUTE}
              className="inline-flex items-center gap-2 rounded-xl border border-white/30 bg-white/10 px-6 py-3.5 text-sm font-semibold text-white backdrop-blur transition hover:bg-white/20"
            >
              <FlaskConical className="h-4 w-4" />
              View Treatments
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
