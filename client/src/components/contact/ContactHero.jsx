import Image from "next/image";

export default function ContactHero() {
  return (
    <section className="relative overflow-hidden py-36 text-slate-900">
      <div className="absolute inset-0 bg-gradient-to-br from-white/60 via-white/70 to-[#e8f7f8]/80 backdrop-blur-[1px]" />

      <div className="pointer-events-none absolute -right-14 -top-14 h-60 w-60 rounded-full border border-[#2FA4A9]/20" />
      <div className="pointer-events-none absolute -right-6 -top-6 h-44 w-44 rounded-full border border-[#2FA4A9]/15" />

      <div className="relative mx-auto max-w-3xl px-6 text-center">
        <span className="mb-6 inline-flex items-center gap-2 rounded-full border border-[#2FA4A9]/40 bg-[#2FA4A9]/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-[#2FA4A9] backdrop-blur-sm">
          <span className="h-1.5 w-1.5 rounded-full bg-[#2FA4A9]" />
          Get In Touch
        </span>

        <h1 className="text-4xl font-extrabold leading-tight tracking-tight text-slate-900 sm:text-5xl lg:text-6xl">
          We&apos;re Here to{" "}
          <span className="bg-gradient-to-r from-[#2FA4A9] to-[#1d7a7e] bg-clip-text text-transparent">
            Help
          </span>
        </h1>

        <p className="mx-auto mt-6 max-w-xl text-base leading-relaxed text-slate-600 sm:text-lg">
          Have a question about a consultation, an order, or just want to say
          hello? Our team in Pokhara is ready to assist you every step of the
          way.
        </p>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <a
            href="tel:+9779748762712"
            className="inline-flex items-center gap-2 rounded-full bg-[#2FA4A9] px-5 py-2.5 text-sm font-semibold text-white shadow-md shadow-[#2FA4A9]/25 transition hover:bg-[#1d7a7e] active:scale-95"
          >
            Call Now
          </a>
          <a
            href="https://wa.me/9779748762712"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 rounded-full border border-[#2FA4A9]/40 bg-white/70 px-5 py-2.5 text-sm font-semibold text-[#2FA4A9] backdrop-blur-sm transition hover:bg-[#2FA4A9] hover:text-white active:scale-95"
          >
            WhatsApp Us
          </a>
        </div>
      </div>
    </section>
  );
}
