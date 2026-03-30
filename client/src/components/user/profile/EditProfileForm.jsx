"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { userService } from "@/services/userService";

const SKIN_TYPES = ["normal", "oily", "dry", "combination", "sensitive"];
const GENDERS = ["male", "female", "other"];

const EditProfileForm = ({ user }) => {
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
      gender: user?.gender || "",
      skin_type: user?.skin_type || "",
      city: user?.address?.city || "",
      province: user?.address?.province || "",
    },
  });

  const onSubmit = async (data) => {
    setIsLoading(true);
    setMessage(null);

    try {
      const payload = {
        full_name: data.full_name,
        phone: data.phone,
        gender: data.gender,
        skin_type: data.skin_type || null,
        address:
          data.city && data.province
            ? { city: data.city, province: data.province }
            : null,
      };

      await userService.updateProfile(payload);
      
      // Notify AppNavbar to sync new info (like name changes) instantly
      window.dispatchEvent(new Event("userProfileUpdated"));

      setMessage({ type: "success", text: "Profile updated successfully!" });
      router.refresh();
    } catch (error) {
      setMessage({ type: "error", text: error.message });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-6">
      <h2 className="text-lg font-semibold text-slate-900">
        Personal Information
      </h2>
      <p className="mt-1 text-sm text-slate-500">
        Update your name, contact details, and skin type.
      </p>

      <form onSubmit={handleSubmit(onSubmit)} className="mt-4 space-y-4" noValidate>
        {/* Full Name */}
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
              minLength: { value: 2, message: "Name is too short" },
            })}
            className="mt-1 w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm text-slate-900 outline-none transition focus:border-teal-500 focus:ring-2 focus:ring-teal-100"
          />
          {errors.full_name && (
            <p className="mt-1.5 text-xs font-medium text-red-500">
              {errors.full_name.message}
            </p>
          )}
        </div>

        {/* Phone Number */}
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
                message: "Invalid phone number format",
              },
            })}
            className="mt-1 w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm text-slate-900 outline-none transition focus:border-teal-500 focus:ring-2 focus:ring-teal-100"
          />
          {errors.phone && (
            <p className="mt-1.5 text-xs font-medium text-red-500">
              {errors.phone.message}
            </p>
          )}
        </div>

        {/* Gender & Skin Type */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <div>
            <label
              htmlFor="gender"
              className="block text-sm font-medium text-slate-700"
            >
              Gender
            </label>
            <select
              id="gender"
              {...register("gender", { required: "Gender is required" })}
              className="mt-1 w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm text-slate-900 outline-none transition focus:border-teal-500 focus:ring-2 focus:ring-teal-100"
            >
              <option value="">Select gender</option>
              {GENDERS.map((g) => (
                <option key={g} value={g} className="capitalize">
                  {g.charAt(0).toUpperCase() + g.slice(1)}
                </option>
              ))}
            </select>
            {errors.gender && (
              <p className="mt-1.5 text-xs font-medium text-red-500">
                {errors.gender.message}
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="skin_type"
              className="block text-sm font-medium text-slate-700"
            >
              Skin Type
            </label>
            <select
              id="skin_type"
              {...register("skin_type")}
              className="mt-1 w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm text-slate-900 outline-none transition focus:border-teal-500 focus:ring-2 focus:ring-teal-100"
            >
              <option value="">Select skin type</option>
              {SKIN_TYPES.map((s) => (
                <option key={s} value={s} className="capitalize">
                  {s.charAt(0).toUpperCase() + s.slice(1)}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* City & Province */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <div>
            <label
              htmlFor="city"
              className="block text-sm font-medium text-slate-700"
            >
              City
            </label>
            <input
              id="city"
              type="text"
              {...register("city")}
              className="mt-1 w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm text-slate-900 outline-none transition focus:border-teal-500 focus:ring-2 focus:ring-teal-100"
            />
          </div>

          <div>
            <label
              htmlFor="province"
              className="block text-sm font-medium text-slate-700"
            >
              Province
            </label>
            <input
              id="province"
              type="text"
              {...register("province")}
              className="mt-1 w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm text-slate-900 outline-none transition focus:border-teal-500 focus:ring-2 focus:ring-teal-100"
            />
          </div>
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
          {isLoading ? "Saving..." : "Save Changes"}
        </button>
      </form>
    </section>
  );
};

export default EditProfileForm;
