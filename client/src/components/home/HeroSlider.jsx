"use client";

import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/navigation";
import "swiper/css/effect-fade";

import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination, Navigation, EffectFade } from "swiper/modules";
import Image from "next/image";
import Link from "next/link";
import { CalendarCheck, ShoppingBag, ArrowRight, Sparkles } from "lucide-react";
import {
  DOCTORS_ROUTE,
  PRODUCT_ROUTE,
  REGISTER_ROUTE,
} from "@/constants/routes";

const SLIDES = [
  {
    id: 1,

    image:
      "https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=1600&q=80",
    badge: "Premium Skincare",
    headline: "Glow Naturally with",
    highlight: "Our Skincare Products",
    subtitle:
      "Explore dermatologist-recommended cleansers, serums, and moisturizers tailored to every skin type.",
    primaryCta: { label: "Shop Now", href: PRODUCT_ROUTE, icon: ShoppingBag },
    secondaryCta: { label: "Learn More", href: PRODUCT_ROUTE },

    overlay: "from-[#0D4F52]/80 via-[#0D4F52]/50 to-transparent",
  },
  {
    id: 2,

    image:
      "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=1600&q=80",
    badge: "Certified Dermatologists",
    headline: "Consult",
    highlight: "Certified Dermatologists",
    subtitle:
      "Book a video or in-person consultation with a verified dermatologist in just a few clicks.",
    primaryCta: {
      label: "Book Appointment",
      href: DOCTORS_ROUTE,
      icon: CalendarCheck,
    },
    secondaryCta: { label: "View Doctors", href: DOCTORS_ROUTE },
    overlay: "from-[#0A3D3F]/85 via-[#0A3D3F]/55 to-transparent",
  },
  {
    id: 3,

    image:
      "https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=1600&q=80",
    badge: " All-in-One Platform",
    headline: "Personalized",
    highlight: "Skin Care Solutions",
    subtitle:
      "Get expert medical advice and the right products together — your complete skin care journey starts here.",
    primaryCta: {
      label: "Get Started Free",
      href: REGISTER_ROUTE,
      icon: Sparkles,
    },
    secondaryCta: { label: "See How It Works", href: "/" },
    overlay: "from-[#0F5E62]/80 via-[#0F5E62]/50 to-transparent",
  },
];

const SlideContent = ({ slide }) => (
  <div className="relative h-[540px] w-full md:h-[620px]">
    <Image
      src={slide.image}
      alt={slide.headline}
      fill
      priority
      className="object-cover object-center"
      sizes="100vw"
    />

    <div className={`absolute inset-0 bg-gradient-to-r ${slide.overlay}`} />

    <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-black/40 to-transparent" />

    <div className="absolute inset-0 flex items-center">
      <div className="mx-auto w-full max-w-7xl px-6 md:px-10">
        <div className="max-w-xl">
          <span className="mb-5 inline-flex items-center rounded-full border border-white/30 bg-white/15 px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-white backdrop-blur-sm">
            {slide.badge}
          </span>

          <h2 className="mt-3 text-4xl font-extrabold leading-tight tracking-tight text-white md:text-5xl lg:text-[3.2rem]">
            {slide.headline}{" "}
            <span className="text-[#F5E6B3]">{slide.highlight}</span>
          </h2>

   
          <p className="mt-4 max-w-md text-base leading-7 text-white/80">
            {slide.subtitle}
          </p>

      
          <div className="mt-7 flex flex-wrap gap-3">
            <Link
              href={slide.primaryCta.href}
              className="group inline-flex items-center gap-2 rounded-xl bg-white px-6 py-3.5 text-sm font-bold text-[#0D4F52] shadow-lg transition-all hover:bg-teal-50 hover:shadow-xl active:scale-95"
            >
              {slide.primaryCta.icon && (
                <slide.primaryCta.icon className="h-4 w-4" />
              )}
              {slide.primaryCta.label}
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>

            <Link
              href={slide.secondaryCta.href}
              className="inline-flex items-center gap-2 rounded-xl border border-white/40 bg-white/10 px-6 py-3.5 text-sm font-bold text-white backdrop-blur-sm transition-all hover:bg-white/20 active:scale-95"
            >
              {slide.secondaryCta.label}
            </Link>
          </div>
        </div>
      </div>
    </div>
  </div>
);

const StatItem = ({ value, label }) => (
  <div className="text-center">
    <p className="text-2xl font-extrabold text-[#1D7D82]">{value}</p>
    <p className="text-xs font-medium text-slate-500">{label}</p>
  </div>
);

const HeroSlider = () => (
  <section>
    <Swiper
      modules={[Autoplay, Pagination, Navigation, EffectFade]}
      effect="fade" 
      autoplay={{ delay: 5000, disableOnInteraction: false }}
      pagination={{ clickable: true }}
      navigation={true}
      loop={true}
      className="hero-swiper"
    >
      {SLIDES.map((slide) => (
        <SwiperSlide key={slide.id}>
          <SlideContent slide={slide} />
        </SwiperSlide>
      ))}
    </Swiper>

   
    <div className="border-b border-slate-100 bg-white">
      <div className="mx-auto flex w-full max-w-7xl flex-wrap justify-around gap-6 px-6 py-5">
        <StatItem value="500+" label="Verified Doctors" />
        <div className="hidden w-px self-stretch bg-slate-200 sm:block" />
        <StatItem value="10,000+" label="Happy Patients" />
        <div className="hidden w-px self-stretch bg-slate-200 sm:block" />
        <StatItem value="5,000+" label="Skincare Products" />
        <div className="hidden w-px self-stretch bg-slate-200 sm:block" />
        <StatItem value="4.9★" label="Average Rating" />
      </div>
    </div>

  
    <style>{`
      .hero-swiper .swiper-button-next,
      .hero-swiper .swiper-button-prev {
        color: white;
        background: rgba(255,255,255,0.15);
        border-radius: 50%;
        width: 44px;
        height: 44px;
        backdrop-filter: blur(6px);
        border: 1px solid rgba(255,255,255,0.3);
        transition: background 0.2s;
      }
      .hero-swiper .swiper-button-next:hover,
      .hero-swiper .swiper-button-prev:hover {
        background: rgba(255,255,255,0.28);
      }
      .hero-swiper .swiper-button-next::after,
      .hero-swiper .swiper-button-prev::after {
        font-size: 14px;
        font-weight: 700;
      }
      .hero-swiper .swiper-pagination-bullet {
        background: white;
        opacity: 0.5;
        width: 8px;
        height: 8px;
      }
      .hero-swiper .swiper-pagination-bullet-active {
        opacity: 1;
        width: 24px;
        border-radius: 4px;
        background: #F5E6B3;
      }
    `}</style>
  </section>
);

export default HeroSlider;
