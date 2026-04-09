import { z } from "zod";

export const appointmentChatParamsSchema = z.object({
  appointmentId: z.coerce
    .number({
      required_error: "appointmentId is required",
      invalid_type_error: "appointmentId must be a number",
    })
    .int("appointmentId must be an integer")
    .positive("appointmentId must be a positive integer"),
});

export const sendMessageSchema = z.object({
  message: z
    .string({
      required_error: "message is required",
      invalid_type_error: "message must be a string",
    })
    .trim()
    .min(1, "message cannot be empty")
    .max(2000, "message must not exceed 2000 characters"),
});
