import { z } from "zod";

const PAYMENT_METHODS = ["cod", "khalti", "esewa", "stripe"];

export const createOrderSchema = z.object({
  shipping_address: z
    .string({
      required_error: "Shipping address is required",
      invalid_type_error: "Shipping address must be a string",
    })
    .trim()
    .min(5, "Shipping address must be at least 5 characters")
    .max(500, "Shipping address must not exceed 500 characters"),

  contact_phone: z
    .string({
      invalid_type_error: "Contact phone must be a string",
    })
    .trim()
    .min(7, "Contact phone must be at least 7 characters")
    .max(40, "Contact phone must not exceed 40 characters")
    .optional(),

  notes: z
    .string({
      invalid_type_error: "Notes must be a string",
    })
    .trim()
    .max(500, "Notes must not exceed 500 characters")
    .optional(),

  payment_method: z
    .enum(PAYMENT_METHODS, {
      invalid_type_error: "Payment method is invalid",
    })
    .default("cod"),
});

export const orderParamsSchema = z.object({
  orderId: z.coerce
    .number({
      required_error: "Order id is required",
      invalid_type_error: "Order id must be a number",
    })
    .int("Order id must be an integer")
    .positive("Order id must be a positive integer"),
});

export const cancelOrderSchema = z.object({
  reason: z
    .string({
      invalid_type_error: "Reason must be a string",
    })
    .trim()
    .min(3, "Reason must be at least 3 characters")
    .max(500, "Reason must not exceed 500 characters")
    .optional(),
});
