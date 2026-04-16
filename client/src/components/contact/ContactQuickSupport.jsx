import Link from "next/link";
import { Stethoscope, ShoppingBag, Headphones } from "lucide-react";
import { DOCTORS_ROUTE, PRODUCT_ROUTE } from "@/constants/routes";

const WHATSAPP_NUMBER = "9779748762712";

const channels = [
  {
    icon: Stethoscope,
    title: "Book a Consultation",
    desc: "Connect directly with a board-certified dermatologist.",
    href: DOCTORS_ROUTE,
    cta: "Browse Doctors",
    external: false,
  },
  {
    icon: ShoppingBag,
    title: "Order Support",
    desc: "Questions about your skincare order or delivery.",
    href: PRODUCT_ROUTE,
    cta: "Browse Products",
    external: false,
  },
  {
    icon: Headphones,
    title: "Live Chat",
    desc: "Chat with our support team on WhatsApp in real-time.",
    href: `https://wa.me/${WHATSAPP_NUMBER}`,
    cta: "Start Chat",
    external: true,
  },
];

export default function ContactQuickSupport() {
  return (
    <div className="rounded-3xl bg-slate-50 p-8 ring-1 ring-slate-100">
      <span className="text-xs font-bold uppercase tracking-widest text-[#2FA4A9]">
        Quick Support
      </span>
      <h3 className="mt-2 text-xl font-extrabold text-slate-900">
        Other ways to reach us
      </h3>

      <div className="mt-6 space-y-4">
        {channels.map(({ icon: Icon, title, desc, href, cta, external }) => (
          <div
            key={title}
            className="flex items-start gap-4 rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-100 transition hover:ring-[#2FA4A9]/30"
          >
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#e8f7f8] text-[#2FA4A9]">
              <Icon className="h-5 w-5" />
            </span>

            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-slate-800">{title}</p>
              <p className="mt-0.5 text-xs text-slate-500">{desc}</p>
            </div>

            {external ? (
              <a
                href={href}
                target="_blank"
                rel="noreferrer"
                className="shrink-0 rounded-lg border border-[#2FA4A9]/40 px-3 py-1.5 text-xs font-semibold text-[#2FA4A9] transition hover:bg-[#2FA4A9] hover:text-white"
              >
                {cta}
              </a>
            ) : (
              <Link
                href={href}
                className="shrink-0 rounded-lg border border-[#2FA4A9]/40 px-3 py-1.5 text-xs font-semibold text-[#2FA4A9] transition hover:bg-[#2FA4A9] hover:text-white"
              >
                {cta}
              </Link>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
