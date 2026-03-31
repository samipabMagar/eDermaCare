import Image from "next/image";
import Link from "next/link";
import { Video, ClipboardList, ShoppingBag, ArrowRight } from "lucide-react";
import { DOCTORS_ROUTE, PRODUCT_ROUTE } from "@/constants/routes";

const SERVICES = [
  {
    icon: Video,
    title: "Online Consultations",
    description:
      "Talk to verified dermatologists through secure online consultations. Choose a time that fits your schedule and get trusted advice without waiting in long clinic lines.",
    image:
      "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=800&q=80",
    cta: "Find a Doctor",
    href: DOCTORS_ROUTE,
    badge: "Live Sessions",

    imageRight: true,
  },
  {
    icon: ClipboardList,
    title: "Personalized Treatment Plans",
    description:
      "Receive a clear treatment plan designed around your skin type and goals. Every step feels practical, easy to follow, and focused on real results.",
    image:
      "https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=800&q=80",
    cta: "Book Consultation",
    href: DOCTORS_ROUTE,
    badge: "Tailored for You",
    imageRight: false,
  },
  {
    icon: ShoppingBag,
    title: "Curated Skincare Products",
    description:
      "Shop quality skincare products selected for safety, performance, and skin compatibility. Build a routine with confidence using dermatologist-recommended items.",
    image:
      "https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=800&q=80",
    cta: "Shop Now",
    href: PRODUCT_ROUTE,
    badge: "Dermatologist-Approved",
    imageRight: true,
  },
];

const ServiceRow = ({ service, index }) => {
  const Icon = service.icon;

  const imageFirst = !service.imageRight;

  return (
    <div
      className={`flex flex-col gap-8 md:flex-row md:items-center ${
        imageFirst ? "md:flex-row-reverse" : ""
      }`}
    >
      <div className="relative h-72 flex-1 overflow-hidden rounded-3xl shadow-lg md:h-80">
        <Image
          src={service.image}
          alt={service.title}
          fill
          className="object-cover transition-transform duration-500 hover:scale-105"
          sizes="(max-width: 768px) 100vw, 50vw"
        />

        <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-black/40 to-transparent rounded-b-3xl" />

        <span className="absolute left-4 top-4 rounded-full bg-white/90 px-3 py-1 text-xs font-bold text-[#1D7D82] shadow-sm backdrop-blur-sm">
          {service.badge}
        </span>
      </div>

      <div className="flex flex-1 flex-col gap-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#2FA4A9]/10 text-[#2FA4A9]">
            <Icon className="h-5 w-5" />
          </div>
          <span className="text-xs font-bold uppercase tracking-widest text-[#2FA4A9]">
            0{index + 1}
          </span>
        </div>

        <h3 className="text-2xl font-extrabold text-slate-900">
          {service.title}
        </h3>
        <p className="text-base leading-7 text-slate-600">
          {service.description}
        </p>

        <Link
          href={service.href}
          className="group inline-flex w-fit items-center gap-2 rounded-xl border border-[#2FA4A9]/30 bg-[#2FA4A9]/8 px-5 py-2.5 text-sm font-bold text-[#1D7D82] transition hover:bg-[#2FA4A9] hover:text-white"
        >
          {service.cta}
          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
        </Link>
      </div>
    </div>
  );
};

const HomeServices = () => (
  <section id="services" className="mx-auto w-full max-w-7xl px-6 py-16">
    <div className="mb-12 text-center">
      <span className="inline-block rounded-full bg-[#2FA4A9]/10 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-[#1D7D82]">
        What We Offer
      </span>
      <h2 className="mt-4 text-3xl font-extrabold text-slate-900 md:text-4xl">
        Services Built for Every Skin
      </h2>
      <p className="mx-auto mt-3 max-w-xl text-base text-slate-500">
        From expert consultations to curated products — everything you need for
        better skin, in one place.
      </p>
    </div>

    <div className="flex flex-col gap-16">
      {SERVICES.map((service, i) => (
        <ServiceRow key={service.title} service={service} index={i} />
      ))}
    </div>
  </section>
);

export default HomeServices;
