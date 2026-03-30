"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { doctorService } from "@/services/doctorService";

const DoctorProfessionalForm = ({ profile }) => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: {
      specialization: profile?.specialization || "",
      license_number: profile?.license_number || "",
      years_of_experience: profile?.years_of_experience || 0,
      consultation_fee: profile?.consultation_fee || 0,
      bio: profile?.bio || "",
    },
  });

  const onSubmit = async (data) => {
    setIsLoading(true);
    setMessage(null);

    try {
      const payload = {
        specialization: data.specialization,
        license_number: data.license_number,
        years_of_experience: parseInt(data.years_of_experience, 10),
        consultation_fee: parseInt(data.consultation_fee, 10),
        bio: data.bio || "",
      };

      await doctorService.updateDoctorProfile(payload);
      setMessage({ type: "success", text: "Professional detail updated successfully!" });
      router.refresh();
    } catch (error) {
      setMessage({ type: "error", text: error.message });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
      <h2 className="text-lg font-semibold text-slate-900">Professional Details</h2>
      <p className="mt-1 text-sm text-slate-500">Update your clinical information and practice settings.</p>

      <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-5" noValidate>
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <div>
            <label htmlFor="specialization" className="block text-sm font-medium text-slate-700">
              Specialization
            </label>
            <input
              id="specialization"
              type="text"
              {...register("specialization", { required: "Specialization is required" })}
              className="mt-1 w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm text-slate-900 outline-none transition focus:border-teal-500 focus:ring-2 focus:ring-teal-100"
            />
            {errors.specialization && (
              <p className="mt-1.5 text-xs font-medium text-red-500">{errors.specialization.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="license_number" className="block text-sm font-medium text-slate-700">
              Medical License Number
            </label>
            <input
              id="license_number"
              type="text"
              {...register("license_number", { required: "License number is required" })}
              className="mt-1 w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm text-slate-900 outline-none transition focus:border-teal-500 focus:ring-2 focus:ring-teal-100"
            />
            {errors.license_number && (
              <p className="mt-1.5 text-xs font-medium text-red-500">{errors.license_number.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="years_of_experience" className="block text-sm font-medium text-slate-700">
              Years of Experience
            </label>
            <input
              id="years_of_experience"
              type="number"
              min="0"
              {...register("years_of_experience", {
                required: "Years of experience is required",
                min: { value: 0, message: "Experience cannot be negative" }
              })}
              className="mt-1 w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm text-slate-900 outline-none transition focus:border-teal-500 focus:ring-2 focus:ring-teal-100"
            />
            {errors.years_of_experience && (
              <p className="mt-1.5 text-xs font-medium text-red-500">{errors.years_of_experience.message}</p>
            )}
          </div>

          {/* Consultation Fee */}
          <div>
            <label htmlFor="consultation_fee" className="block text-sm font-medium text-slate-700">
              Consultation Fee (NPR)
            </label>
            <input
              id="consultation_fee"
              type="number"
              min="0"
              {...register("consultation_fee", {
                required: "Consultation fee is required",
                min: { value: 0, message: "Fee cannot be negative" }
              })}
              className="mt-1 w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm text-slate-900 outline-none transition focus:border-teal-500 focus:ring-2 focus:ring-teal-100"
            />
            {errors.consultation_fee && (
              <p className="mt-1.5 text-xs font-medium text-red-500">{errors.consultation_fee.message}</p>
            )}
          </div>
        </div>

        {/* Bio */}
        <div>
          <label htmlFor="bio" className="block text-sm font-medium text-slate-700">
            Professional Bio
          </label>
          <textarea
            id="bio"
            rows={4}
            {...register("bio")}
            className="mt-1 w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm text-slate-900 outline-none transition focus:border-teal-500 focus:ring-2 focus:ring-teal-100 resize-none"
            placeholder="Tell your patients about your background, approach, and expertise..."
          />
        </div>

        {/* Feedback message */}
        {message && (
          <p
            role="alert"
            className={`rounded-xl px-4 py-2.5 text-sm font-medium ${
              message.type === "success"
                ? "bg-teal-50 text-teal-700"
                : "bg-red-50 text-red-600"
            }`}
          >
            {message.text}
          </p>
        )}

        <button
          type="submit"
          disabled={isLoading}
          className="rounded-xl bg-teal-600 px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-teal-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isLoading ? "Saving..." : "Save Professional Details"}
        </button>
      </form>
    </section>
  );
};

export default DoctorProfessionalForm;
