import { z } from "zod";

// Validation schema for user registration
export const registerSchema = z.object({
  full_name: z
    .string({
      required_error: "Full name is required",
    })
    .min(2, "Full name must be at least 2 characters")
    .max(100, "Full name must not exceed 100 characters")
    .trim(),

  email: z
    .string({
      required_error: "Email is required",
    })
    .email("Invalid email format")
    .max(255, "Email must not exceed 255 characters")
    .trim(),

  phone: z
    .string({
      required_error: "Phone number is required",
    })
    .min(10, "Phone number must be at least 10 characters")
    .max(30, "Phone number must not exceed 30 characters")
    .regex(/^[0-9+\-\s()]+$/, "Invalid phone number format")
    .trim(),

  password: z
    .string({
      required_error: "Password is required",
    })
    .min(8, "Password must be at least 8 characters")
    .max(255, "Password must not exceed 255 characters")
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      "Password must contain at least one uppercase letter, one lowercase letter, and one number",
    ),

  gender: z.enum(["male", "female", "other"], {
    required_error: "Gender is required",
    invalid_type_error: "Gender must be either male, female, or other",
  }),

  skin_type: z
    .enum(["normal", "oily", "dry", "combination", "sensitive"], {
      invalid_type_error:
        "Skin type must be normal, oily, dry, combination, or sensitive",
    })
    .optional()
    .nullable(),

  address: z
    .object({
      city: z.string().min(1, "City is required"),
      province: z.string().min(1, "Province is required"),
    })
    .optional()
    .nullable(),

  profile_image: z.string().max(255).optional().nullable(),

  role: z.enum(["admin", "doctor", "user"]).default("user").optional(),
});

// Validation schema for user login
export const loginSchema = z.object({
  email: z
    .string({
      required_error: "Email is required",
    })
    .email("Invalid email format")
    .max(255, "Email must not exceed 255 characters")
    .trim(),

  password: z
    .string({
      required_error: "Password is required",
    })
    .min(1, "Password is required"),
});

// Validation schema for updating user profile
export const updateProfileSchema = z
  .object({
    full_name: z
      .string()
      .min(2, "Full name must be at least 2 characters")
      .max(100, "Full name must not exceed 100 characters")
      .trim()
      .optional(),

    phone: z
      .string()
      .min(10, "Phone number must be at least 10 characters")
      .max(30, "Phone number must not exceed 30 characters")
      .regex(/^[0-9+\-\s()]+$/, "Invalid phone number format")
      .trim()
      .optional(),

    gender: z
      .enum(["male", "female", "other"], {
        invalid_type_error: "Gender must be either male, female, or other",
      })
      .optional(),

    skin_type: z
      .enum(["normal", "oily", "dry", "combination", "sensitive"], {
        invalid_type_error:
          "Skin type must be normal, oily, dry, combination, or sensitive",
      })
      .optional()
      .nullable(),

    address: z
      .object({
        city: z.string().min(1, "City is required"),
        province: z.string().min(1, "Province is required"),
      })
      .optional()
      .nullable(),

    profile_image: z.string().max(255).optional().nullable(),
  })
  .strict();

// Validation schema for changing user password
export const changePasswordSchema = z
  .object({
    current_password: z
      .string({
        required_error: "Current password is required",
      })
      .min(1, "Current password is required"),

    new_password: z
      .string({
        required_error: "New password is required",
      })
      .min(8, "New password must be at least 8 characters")
      .max(255, "New password must not exceed 255 characters")
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
        "New password must contain at least one uppercase letter, one lowercase letter, and one number",
      ),

    confirm_new_password: z.string({
      required_error: "Confirm new password is required",
    }),
  })
  .refine((data) => data.new_password === data.confirm_new_password, {
    message: "New password and confirm new password must match",
    path: ["confirm_new_password"],
  });

// Validation schema for user ID route params
export const userIdParamsSchema = z.object({
  userId: z.coerce
    .number({
      required_error: "User ID is required",
      invalid_type_error: "User ID must be a number",
    })
    .int("User ID must be an integer")
    .positive("User ID must be a positive number"),
});
