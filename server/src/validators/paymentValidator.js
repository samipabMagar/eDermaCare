import { z } from "zod";

export const khaltiInitiateSchema = z.object({
  return_url: z
    .string({
      invalid_type_error: "Return URL must be a string",
    })
    .trim()
    .url("Return URL must be a valid URL")
    .optional(),
});

export const khaltiVerifySchema = z.object({
  pidx: z
    .string({
      required_error: "pidx is required",
      invalid_type_error: "pidx must be a string",
    })
    .trim()
    .min(1, "pidx is required"),
});



