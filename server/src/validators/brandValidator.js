import { z } from "zod";

const toOptionalString = (value) => {
  if (value == null) return undefined;
  if (typeof value !== "string") return value;

  const trimmed = value.trim();
  return trimmed === "" ? undefined : trimmed;
};

const toOptionalBoolean = (value) => {
  if (typeof value === "boolean") return value;
  if (typeof value === "string") {
    const normalized = value.trim().toLowerCase();
    if (normalized === "true") return true;
    if (normalized === "false") return false;
  }
  return value;
};

// Validation schema for creating a new brand
export const createBrandSchema = z
  .object({
    name: z
      .string({
        required_error: "Brand name is required",
      })
      .trim()
      .min(1, "Brand name is required")
      .max(100, "Brand name must not exceed 100 characters"),

    description: z.preprocess(toOptionalString, z.string().trim().optional()),

    logo_url: z.preprocess(
      toOptionalString,
      z.string().max(255).optional().nullable(),
    ),

    website_url: z.preprocess(
      toOptionalString,
      z.string().url("Invalid website URL").optional().nullable(),
    ),

    is_active: z.preprocess(toOptionalBoolean, z.boolean().default(true)),
  })
  .strict();

// Validation schema for updating an existing brand
export const updateBrandSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Brand name cannot be empty")
    .max(100, "Brand name must not exceed 100 characters")
    .optional(),

  description: z.preprocess(toOptionalString, z.string().trim().optional()),

  logo_url: z.preprocess(
    toOptionalString,
    z.string().max(255).optional().nullable(),
  ),

  website_url: z.preprocess(
    toOptionalString,
    z.string().url("Invalid website URL").optional().nullable(),
  ),

  is_active: z.preprocess(toOptionalBoolean, z.boolean().optional()),
});
