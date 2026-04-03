import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

const strongPasswordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/;

export const registerSchema = z
  .object({
    userType: z.enum(["patient", "doctor"]),
    full_name: z
      .string()
      .trim()
      .min(2, "Full name must be at least 2 characters")
      .max(100, "Full name must not exceed 100 characters"),
    email: z
      .string()
      .trim()
      .email("Please enter a valid email address")
      .max(255, "Email must not exceed 255 characters"),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(
        strongPasswordRegex,
        "Password must contain at least one uppercase letter, one lowercase letter, and one number",
      ),
    confirmPassword: z.string().min(1, "Confirm password is required"),
    phone: z
      .string()
      .trim()
      .min(10, "Phone number must be at least 10 characters")
      .max(30, "Phone number must not exceed 30 characters")
      .regex(/^[0-9+\-\s()]+$/, "Invalid phone number format"),
    gender: z.enum(["male", "female", "other"], {
      required_error: "Gender is required",
    }),
    skin_type: z.preprocess(
      (value) => (value === "" ? undefined : value),
      z
        .enum(["normal", "oily", "dry", "combination", "sensitive"])
        .optional()
        .nullable(),
    ),
    specialization: z.string().trim().optional(),
    license_number: z.string().trim().optional(),
    years_of_experience: z.preprocess(
      (value) => (value === "" || value === null ? undefined : value),
      z.coerce.number().int().min(0).optional(),
    ),
    consultation_fee: z.preprocess(
      (value) => (value === "" || value === null ? undefined : value),
      z.coerce.number().min(0).optional(),
    ),
  })
  .superRefine((data, ctx) => {
    if (data.password !== data.confirmPassword) {
      ctx.addIssue({
        code: "custom",
        path: ["confirmPassword"],
        message: "Passwords do not match",
      });
    }

    if (data.userType === "doctor") {
      if (!data.specialization || data.specialization.length === 0) {
        ctx.addIssue({
          code: "custom",
          path: ["specialization"],
          message: "Specialization is required",
        });
      }

      if (!data.license_number || data.license_number.length === 0) {
        ctx.addIssue({
          code: "custom",
          path: ["license_number"],
          message: "License number is required",
        });
      }

      if (data.years_of_experience === undefined) {
        ctx.addIssue({
          code: "custom",
          path: ["years_of_experience"],
          message: "Years of experience is required",
        });
      }

      if (data.consultation_fee === undefined) {
        ctx.addIssue({
          code: "custom",
          path: ["consultation_fee"],
          message: "Consultation fee is required",
        });
      }
    }
  });
