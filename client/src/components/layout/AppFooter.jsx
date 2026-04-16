"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Mail, Phone } from "lucide-react";
import {
  exploreLinks,
  accountLinks,
  socialLinks,
} from "@/constants/footerData";

const AppFooter = () => {
  const pathname = usePathname();

  const hideFooter =
    pathname.startsWith("/dashboard") ||
    pathname.startsWith("/doctor/dashboard") ||
    pathname.startsWith("/admin");

  if (hideFooter) return null;

  return (
    <footer className="relative overflow-hidden bg-slate-900 text-slate-300">
      <div className="pointer-events-none absolute inset-0 -z-0">
        <div className="absolute inset-0 bg-gradient-to-b from-slate-800/40 to-transparent" />
        <div className="absolute -left-24 -top-10 h-72 w-72 rounded-full bg-[#2FA4A9]/10 blur-3xl" />
        <div className="absolute right-0 bottom-0 h-80 w-80 rounded-full bg-[#E7C873]/6 blur-3xl" />
        <div className="absolute left-1/2 top-0 h-px w-3/4 -translate-x-1/2 bg-gradient-to-r from-transparent via-[#2FA4A9]/40 to-transparent" />
      </div>

      <div className="relative z-10 mx-auto w-full max-w-7xl px-6">
        <div className="grid grid-cols-1 gap-12 border-b border-slate-700/60 py-14 sm:grid-cols-2 lg:grid-cols-4">
          <div className="lg:col-span-1">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-[#E7C873]/30 bg-[#F5E6B3]/10 px-3 py-1 text-xs font-semibold uppercase tracking-widest text-[#F5E6B3]">
              <span className="h-1.5 w-1.5 rounded-full bg-[#E7C873]" />
              Skin First Care
            </span>

            <p className="mt-4 text-2xl font-extrabold tracking-tight">
              <span className="text-[#2FA4A9]">e</span>
              <span className="text-white">Derma</span>
              <span className="text-[#2FA4A9]">Care</span>
            </p>

            <p className="mt-3 max-w-xs text-sm leading-6 text-slate-400">
              Your all-in-one skincare destination — trusted products, expert
              dermatology support, and personalised care that helps you feel
              confident every day.
            </p>

            <div className="mt-6 flex items-center gap-3">
              {socialLinks.map(({ href, label, Icon }) => (
                <a
                  key={label}
                  href={href}
                  aria-label={label}
                  className="flex h-9 w-9 p-2 items-center justify-center rounded-full border border-slate-700 text-slate-400 transition-all duration-200 hover:border-[#2FA4A9] hover:bg-[#2FA4A9]/15 hover:text-[#2FA4A9]"
                >
                  <Icon />
                </a>
              ))}
            </div>
          </div>

          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-slate-500">
              Explore
            </p>
            <ul className="mt-5 space-y-3">
              {exploreLinks.map(({ href, label }) => (
                <li key={label}>
                  <Link
                    href={href}
                    className="group flex items-center gap-2 text-sm text-slate-400 transition-colors duration-150 hover:text-white"
                  >
                    <span className="block h-px w-3 bg-[#2FA4A9]/50 transition-all duration-200 group-hover:w-5 group-hover:bg-[#2FA4A9]" />
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-slate-500">
              Account
            </p>
            <ul className="mt-5 space-y-3">
              {accountLinks.map(({ href, label }) => (
                <li key={label}>
                  <Link
                    href={href}
                    className="group flex items-center gap-2 text-sm text-slate-400 transition-colors duration-150 hover:text-white"
                  >
                    <span className="block h-px w-3 bg-[#2FA4A9]/50 transition-all duration-200 group-hover:w-5 group-hover:bg-[#2FA4A9]" />
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-slate-500">
              Contact Us
            </p>

            <ul className="mt-5 space-y-4 text-sm text-slate-400">
              <li className="flex items-start gap-2.5">
                <Mail className="mt-0.5 h-4 w-4 shrink-0 text-[#2FA4A9]" />
                <span>support@edermacare.com</span>
              </li>

              <li className="flex items-start gap-2.5">
                <Phone className="mt-0.5 h-4 w-4 shrink-0 text-[#2FA4A9]" />
                <span>+977-9800000000</span>
              </li>
            </ul>

            <div className="mt-6 inline-flex items-center gap-2 rounded-full border border-slate-700 bg-slate-800/60 px-3.5 py-2 text-xs text-slate-300">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
              </span>
              Online consultation available 24 / 7
            </div>
          </div>
        </div>

        <div className="flex flex-col items-center justify-between gap-3 py-6 text-xs text-slate-500 sm:flex-row">
          <p>© {new Date().getFullYear()} eDermaCare. All rights reserved.</p>

          <div className="flex items-center gap-4">
            <a href="#" className="transition hover:text-slate-300">
              Privacy Policy
            </a>
            <span className="h-3 w-px bg-slate-700" />
            <a href="#" className="transition hover:text-slate-300">
              Terms of Service
            </a>
            <span className="h-3 w-px bg-slate-700" />
            <a href="#" className="transition hover:text-slate-300">
              Cookies
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default AppFooter;
