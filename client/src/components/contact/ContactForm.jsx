"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { Send, CheckCircle2 } from "lucide-react";
import { contactService } from "@/services/contactService";

export default function ContactForm() {
  const [submitted, setSubmitted] = useState(false);
  const [submittedData, setSubmittedData] = useState(null);
  const [serverError, setServerError] = useState("");

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: {
      name: "",
      email: "",
      subject: "",
      message: "",
    },
  });

  const onSubmit = async (data) => {
    setServerError("");

    try {
      await contactService.submitContactMessage(data);
      setSubmittedData(data);
      setSubmitted(true);
      reset();
    } catch (error) {
      setServerError(error.message || "Failed to send your message.");
    }
  };

  const inputClass =
    "w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-[#2FA4A9] focus:bg-white focus:ring-2 focus:ring-[#2FA4A9]/20";

  return (
    <div className="rounded-3xl bg-white p-8 shadow-xl shadow-slate-200/60 ring-1 ring-slate-100 sm:p-10">
      <span className="text-xs font-bold uppercase tracking-widest text-[#2FA4A9]">
        Send a Message
      </span>
      <h2 className="mt-2 text-2xl font-extrabold text-slate-900 sm:text-3xl">
        We&apos;d love to hear from you
      </h2>
      <p className="mt-2 text-sm text-slate-500">
        Fill in the form below and we&apos;ll get back to you as soon as
        possible.
      </p>

      {submitted ? (
        <div className="mt-10 flex flex-col items-center gap-4 rounded-2xl bg-[#e8f7f8] p-10 text-center">
          <span className="flex h-16 w-16 items-center justify-center rounded-full bg-[#2FA4A9] text-white shadow-lg shadow-[#2FA4A9]/30">
            <CheckCircle2 className="h-8 w-8" />
          </span>
          <h3 className="text-lg font-extrabold text-slate-900">
            Message Sent!
          </h3>
          <p className="text-sm text-slate-600">
            Thank you for reaching out,{" "}
            <strong>{submittedData?.name?.split(" ")[0]}</strong>. We&apos;ll
            reply to <strong>{submittedData?.email}</strong> within 24 hours.
          </p>
          <button
            onClick={() => {
              setSubmitted(false);
              setSubmittedData(null);
              setServerError("");
            }}
            className="mt-2 rounded-xl border border-[#2FA4A9]/40 px-5 py-2 text-sm font-semibold text-[#2FA4A9] transition hover:bg-[#2FA4A9] hover:text-white"
          >
            Send another message
          </button>
        </div>
      ) : (
        <form
          className="mt-8 space-y-5"
          onSubmit={handleSubmit(onSubmit)}
          noValidate
        >
          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-slate-600">
                Full Name <span className="text-rose-500">*</span>
              </label>
              <input
                id="contact-name"
                type="text"
                placeholder="Jane Doe"
                {...register("name", {
                  required: "Full name is required",
                  minLength: {
                    value: 2,
                    message: "Name must be at least 2 characters",
                  },
                })}
                className={`${inputClass} ${errors.name ? "border-rose-300 focus:border-rose-500 focus:ring-rose-200" : ""}`}
              />
              {errors.name && (
                <p className="mt-1.5 text-xs font-medium text-rose-500">
                  {errors.name.message}
                </p>
              )}
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-slate-600">
                Email Address <span className="text-rose-500">*</span>
              </label>
              <input
                id="contact-email"
                type="email"
                placeholder="jane@example.com"
                {...register("email", {
                  required: "Email is required",
                  pattern: {
                    value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                    message: "Please provide a valid email address",
                  },
                })}
                className={`${inputClass} ${errors.email ? "border-rose-300 focus:border-rose-500 focus:ring-rose-200" : ""}`}
              />
              {errors.email && (
                <p className="mt-1.5 text-xs font-medium text-rose-500">
                  {errors.email.message}
                </p>
              )}
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-semibold text-slate-600">
              Subject <span className="text-rose-500">*</span>
            </label>
            <select
              id="contact-subject"
              {...register("subject", {
                required: "Please choose a subject",
              })}
              className={`${inputClass} ${errors.subject ? "border-rose-300 focus:border-rose-500 focus:ring-rose-200" : ""}`}
            >
              <option value="">Select a subject…</option>
              <option value="Appointment / Consultation">
                Appointment / Consultation
              </option>
              <option value="Product Order & Delivery">
                Product Order &amp; Delivery
              </option>
              <option value="Technical Support">Technical Support</option>
              <option value="Billing & Payments">Billing &amp; Payments</option>
              <option value="Partnership Enquiry">Partnership Enquiry</option>
              <option value="Other">Other</option>
            </select>
            {errors.subject && (
              <p className="mt-1.5 text-xs font-medium text-rose-500">
                {errors.subject.message}
              </p>
            )}
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-semibold text-slate-600">
              Message <span className="text-rose-500">*</span>
            </label>
            <textarea
              id="contact-message"
              rows={5}
              placeholder="Tell us how we can help you…"
              {...register("message", {
                required: "Message is required",
                minLength: {
                  value: 10,
                  message: "Message must be at least 10 characters",
                },
              })}
              className={`${inputClass} resize-none ${errors.message ? "border-rose-300 focus:border-rose-500 focus:ring-rose-200" : ""}`}
            />
            {errors.message && (
              <p className="mt-1.5 text-xs font-medium text-rose-500">
                {errors.message.message}
              </p>
            )}
          </div>

          {serverError && (
            <p
              role="alert"
              className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700"
            >
              {serverError}
            </p>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-[#2FA4A9] py-3.5 text-sm font-bold text-white shadow-md shadow-[#2FA4A9]/25 transition hover:bg-[#25888d] hover:shadow-lg hover:shadow-[#2FA4A9]/30 active:scale-95 disabled:opacity-70"
          >
            {isSubmitting ? (
              <>
                <svg
                  className="h-4 w-4 animate-spin"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8v8z"
                  />
                </svg>
                Sending…
              </>
            ) : (
              <>
                <Send className="h-4 w-4" />
                Send Message
              </>
            )}
          </button>
        </form>
      )}
    </div>
  );
}
