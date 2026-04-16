"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";

const faqs = [
  {
    q: "How do I book a consultation with a dermatologist?",
    a: "Simply create a free account, browse our verified doctors, pick a time slot that suits you, and confirm your booking. You'll receive a confirmation email with further details.",
  },
  {
    q: "How long does it take to get a response to my email?",
    a: "Our support team aims to respond to all email enquiries within 24 hours on business days. For urgent matters, we recommend calling or WhatsApp messaging us directly.",
  },
  {
    q: "Do you ship skincare products nationwide?",
    a: "Yes! We offer nationwide delivery across Nepal. Estimated delivery times range from 1-3 business days within major cities and 3-7 days for other regions.",
  },
  {
    q: "Can I reschedule or cancel my appointment?",
    a: "Yes. You can reschedule or cancel your appointment up to 2 hours before the scheduled time from your dashboard. After that, a cancellation fee may apply.",
  },
  {
    q: "Is my personal and medical information kept private?",
    a: "Absolutely. All consultations are end-to-end encrypted and your data is stored securely per our privacy policy. We never share your information with third parties.",
  },
];

function FaqItem({ q, a }) {
  const [open, setOpen] = useState(false);

  return (
    <div
      className={`rounded-2xl border transition-all duration-300 ${
        open
          ? "border-[#2FA4A9]/30 bg-[#e8f7f8]/40"
          : "border-slate-100 bg-white"
      }`}
    >
      <button
        className="flex w-full items-center justify-between gap-4 p-5 text-left"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
      >
        <span className="text-sm font-semibold text-slate-800">{q}</span>
        <span
          className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full transition-colors ${
            open
              ? "bg-[#2FA4A9] text-white"
              : "bg-slate-100 text-slate-500"
          }`}
        >
          {open ? (
            <ChevronUp className="h-4 w-4" />
          ) : (
            <ChevronDown className="h-4 w-4" />
          )}
        </span>
      </button>

      <div
        className={`overflow-hidden transition-all duration-300 ${
          open ? "max-h-48 pb-5" : "max-h-0"
        }`}
      >
        <p className="px-5 text-sm leading-relaxed text-slate-500">{a}</p>
      </div>
    </div>
  );
}

export default function ContactFaq() {
  return (
    <section className="bg-slate-50 py-24">
      <div className="mx-auto max-w-3xl px-6">
        <div className="text-center">
          <span className="text-xs font-bold uppercase tracking-widest text-[#2FA4A9]">
            FAQ
          </span>
          <h2 className="mt-3 text-3xl font-extrabold text-slate-900 sm:text-4xl">
            Frequently Asked Questions
          </h2>
          <p className="mt-4 text-[15px] text-slate-500">
            Can&apos;t find the answer you&apos;re looking for? Send us a
            message or chat with us on WhatsApp.
          </p>
        </div>

        <div className="mt-12 space-y-3">
          {faqs.map((item) => (
            <FaqItem key={item.q} {...item} />
          ))}
        </div>
      </div>
    </section>
  );
}
