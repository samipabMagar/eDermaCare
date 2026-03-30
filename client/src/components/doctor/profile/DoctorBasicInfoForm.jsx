"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { userService } from "@/services/userService";

// Form for editing basic user information for a doctor
const DoctorBasicInfoForm = ({ user }) => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: {
      full_name: user?.full_name || "",
      phone: user?.phone || "",
    },
  });

  const onSubmit = async (data) => {
    setIsLoading(true);
    setMessage(null);

    try {
      await userService.updateProfile({
        full_name: data.full_name,
        phone: data.phone,
      });

      window.dispatchEvent(new Event("userProfileUpdated"));

      setMessage({
        type: "success",
        text: "Basic information updated successfully!",
      });
      router.refresh();
    } catch (error) {
      setMessage({ type: "error", text: error.message });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
      <h2 className="text-lg font-semibold text-slate-900">
        Basic Information
      </h2>
      <p className="mt-1 text-sm text-slate-500">
        Update your name and primary contact number.
      </p>

      <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-5" noValidate>
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <div>
            <label
              htmlFor="full_name"
              className="block text-sm font-medium text-slate-700"
            >
              Full Name
            </label>
            <input
              id="full_name"
              type="text"
              {...register("full_name", {
                required: "Full name is required",
                minLength: { value: 2, message: "Name is too short" }
              })}
              className="mt-1 w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm text-slate-900 outline-none transition focus:border-teal-500 focus:ring-2 focus:ring-teal-100"
            />
            {errors.full_name && (
              <p className="mt-1.5 text-xs font-medium text-red-500">
                {errors.full_name.message}
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="phone"
              className="block text-sm font-medium text-slate-700"
            >
              Phone Number
            </label>
            <input
              id="phone"
              type="tel"
              {...register("phone", {
                required: "Phone number is required",
                pattern: {
                  value: /^[0-9+\-\s()]+$/,
                  message: "Invalid phone number format"
                }
              })}
              className="mt-1 w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm text-slate-900 outline-none transition focus:border-teal-500 focus:ring-2 focus:ring-teal-100"
            />
            {errors.phone && (
              <p className="mt-1.5 text-xs font-medium text-red-500">
                {errors.phone.message}
              </p>
            )}
          </div>
        </div>

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
          {isLoading ? "Saving..." : "Save Changes"}
        </button>
      </form>
    </section>
  );
};

export default DoctorBasicInfoForm;
