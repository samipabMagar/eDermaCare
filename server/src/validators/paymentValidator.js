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

export const esewaInitiateSchema = z.object({
  success_url: z
    .string({
      invalid_type_error: "Success URL must be a string",
    })
    .trim()
    .url("Success URL must be a valid URL")
    .optional(),
  failure_url: z
    .string({
      invalid_type_error: "Failure URL must be a string",
    })
    .trim()
    .url("Failure URL must be a valid URL")
    .optional(),
});

export const esewaVerifySchema = z.object({
  data: z
    .string({
      required_error: "data is required",
      invalid_type_error: "data must be a string",
    })
    .trim()
    .min(1, "data is required"),
});
