import { z } from "zod";

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
  is_active: z
    .boolean({
      invalid_type_error: "is_active must be a boolean",
    })
    .optional(),
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
  is_active: z
    .boolean({
      invalid_type_error: "is_active must be a boolean",
    })
    .optional(),
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
  reminder_frequency: z.enum(["weekly", "monthly"], {
    invalid_type_error: "reminder_frequency must be weekly or monthly",
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
