import { Phone, Mail, MapPin, Clock } from "lucide-react";

const cards = [
  {
    icon: Phone,
    label: "Call Us",
    value: "+977 9748762712",
    sub: "Sun - Fri, 9 AM - 6 PM (NPT)",
    bg: "bg-[#e8f7f8]",
    text: "text-[#2FA4A9]",
    href: "tel:+9779748762712",
  },
  {
    icon: Mail,
    label: "Email Us",
    value: "support@edermacare.com",
    sub: "We reply within 24 hours",
    bg: "bg-violet-50",
    text: "text-violet-600",
    href: "mailto:support@edermacare.com",
  },
  {
    icon: MapPin,
    label: "Visit Us",
    value: "Ranipauwa, Pokhara",
    sub: "Gandaki Province, Nepal",
    bg: "bg-rose-50",
    text: "text-rose-500",
    href: "https://maps.app.goo.gl/informatics-college-pokhara",
  },
  {
    icon: Clock,
    label: "Working Hours",
    value: "9 AM - 6 PM",
    sub: "Sunday - Friday",
    bg: "bg-amber-50",
    text: "text-amber-600",
    href: null,
  },
];

function Card({ icon: Icon, label, value, sub, bg, text, href }) {
  const inner = (
    <div className="group flex flex-col items-center gap-3 rounded-2xl bg-white p-6 text-center shadow-xl shadow-slate-200/70 ring-1 ring-slate-100 transition hover:-translate-y-1 hover:shadow-2xl hover:ring-[#2FA4A9]/25">
      <span
        className={`flex h-12 w-12 items-center justify-center rounded-xl ${bg} ${text} transition group-hover:scale-110`}
      >
        <Icon className="h-5 w-5" />
      </span>
      <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
        {label}
      </p>
      <p className="text-sm font-bold text-slate-800">{value}</p>
      <p className="text-xs text-slate-400">{sub}</p>
    </div>
  );

  if (!href) return <div>{inner}</div>;
  return (
    <a
      href={href}
      target={href.startsWith("http") ? "_blank" : undefined}
      rel="noreferrer"
    >
      {inner}
    </a>
  );
}

export default function ContactCards() {
  return (
    <section className="relative z-10 -mt-8 px-6 pb-6">
      <div className="mx-auto grid max-w-5xl grid-cols-2 gap-4 lg:grid-cols-4">
        {cards.map((card) => (
          <Card key={card.label} {...card} />
        ))}
      </div>
    </section>
  );
}
