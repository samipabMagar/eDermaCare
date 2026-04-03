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


