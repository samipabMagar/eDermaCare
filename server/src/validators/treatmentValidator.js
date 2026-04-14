import { z } from "zod";

const benefitTagsSchema = z.preprocess(
  (value) => {
    if (Array.isArray(value)) return value;

    if (typeof value === "string") {
      const parsedValue = value.trim();
      if (!parsedValue) return [];

      try {
        const parsed = JSON.parse(parsedValue);
        if (Array.isArray(parsed)) {
          return parsed;
        }
      } catch {
        return parsedValue
          .split(",")
          .map((item) => item.trim())
          .filter(Boolean);
      }
    }

    return value;
  },
  z
    .array(
      z
        .string({
          invalid_type_error: "Each benefit tag must be a string",
        })
        .trim()
        .min(1, "Benefit tag cannot be empty")
        .max(60, "Benefit tag must not exceed 60 characters"),
      {
        invalid_type_error: "benefit_tags must be an array of strings",
      },
    )
    .max(10, "benefit_tags must not exceed 10 items"),
);

export const createTreatmentSchema = z.object({
  name: z
    .string({
      required_error: "Treatment name is required",
      invalid_type_error: "Treatment name must be a string",
    })
    .trim()
    .min(2, "Treatment name must be at least 2 characters")
    .max(120, "Treatment name must not exceed 120 characters"),
  description: z
    .string({
      invalid_type_error: "Description must be a string",
    })
    .trim()
    .max(2000, "Description must not exceed 2000 characters")
    .optional(),
  price: z.coerce
    .number({
      invalid_type_error: "price must be a number",
    })
    .min(0, "price must be zero or positive")
    .max(10000000, "price is too large")
    .optional(),
  image_url: z
    .string({
      invalid_type_error: "image_url must be a string",
    })
    .trim()
    .url("image_url must be a valid URL")
    .optional(),
  benefit_tags: benefitTagsSchema.optional(),
  duration_minutes: z.coerce
    .number({
      invalid_type_error: "duration_minutes must be a number",
    })
    .int("duration_minutes must be an integer")
    .positive("duration_minutes must be a positive number")
    .max(1440, "duration_minutes must not exceed 1440")
    .optional(),
  is_active: z.coerce.boolean().optional(),
});

export const updateTreatmentSchema = z.object({
  name: z
    .string({
      invalid_type_error: "Treatment name must be a string",
    })
    .trim()
    .min(2, "Treatment name must be at least 2 characters")
    .max(120, "Treatment name must not exceed 120 characters")
    .optional(),
  description: z
    .string({
      invalid_type_error: "Description must be a string",
    })
    .trim()
    .max(2000, "Description must not exceed 2000 characters")
    .optional(),
  price: z.coerce
    .number({
      invalid_type_error: "price must be a number",
    })
    .min(0, "price must be zero or positive")
    .max(10000000, "price is too large")
    .optional(),
  image_url: z
    .string({
      invalid_type_error: "image_url must be a string",
    })
    .trim()
    .url("image_url must be a valid URL")
    .optional(),
  benefit_tags: benefitTagsSchema.optional(),
  duration_minutes: z.coerce
    .number({
      invalid_type_error: "duration_minutes must be a number",
    })
    .int("duration_minutes must be an integer")
    .positive("duration_minutes must be a positive number")
    .max(1440, "duration_minutes must not exceed 1440")
    .optional(),
  is_active: z.coerce.boolean().optional(),
});

export const createTreatmentAppointmentSchema = z.object({
  treatment_id: z.coerce
    .number({
      required_error: "treatment_id is required",
      invalid_type_error: "treatment_id must be a number",
    })
    .int("treatment_id must be an integer")
    .positive("treatment_id must be a positive integer"),
  session_date: z
    .string({
      required_error: "session_date is required",
      invalid_type_error: "session_date must be an ISO datetime string",
    })
    .datetime("session_date must be a valid ISO datetime"),
  reminder_frequency: z.enum(["monthly"], {
    invalid_type_error: "reminder_frequency must be monthly",
  }),
  user_notes: z
    .string({
      invalid_type_error: "user_notes must be a string",
    })
    .trim()
    .max(2000, "user_notes must not exceed 2000 characters")
    .optional(),
});

export const reviewTreatmentAppointmentSchema = z.object({
  decision: z.enum(["approved", "rejected"], {
    required_error: "decision is required",
    invalid_type_error: "decision must be approved or rejected",
  }),
  admin_notes: z
    .string({
      invalid_type_error: "admin_notes must be a string",
    })
    .trim()
    .max(2000, "admin_notes must not exceed 2000 characters")
    .optional(),
  rejection_reason: z
    .string({
      invalid_type_error: "rejection_reason must be a string",
    })
    .trim()
    .max(2000, "rejection_reason must not exceed 2000 characters")
    .optional(),
});
