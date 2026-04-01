import { z } from "zod";

export const addCartItemSchema = z.object({
  product_id: z.coerce
    .number({
      required_error: "Product id is required",
      invalid_type_error: "Product id must be a number",
    })
    .int("Product id must be an integer")
    .positive("Product id must be a positive integer"),

  quantity: z.coerce
    .number({
      invalid_type_error: "Quantity must be a number",
    })
    .int("Quantity must be an integer")
    .min(1, "Quantity must be at least 1")
    .max(20, "Quantity must not exceed 20")
    .default(1),
});

export const updateCartItemSchema = z.object({
  quantity: z.coerce
    .number({
      required_error: "Quantity is required",
      invalid_type_error: "Quantity must be a number",
    })
    .int("Quantity must be an integer")
    .min(1, "Quantity must be at least 1")
    .max(20, "Quantity must not exceed 20"),
});

export const cartItemParamsSchema = z.object({
  itemId: z.coerce
    .number({
      required_error: "Cart item id is required",
      invalid_type_error: "Cart item id must be a number",
    })
    .int("Cart item id must be an integer")
    .positive("Cart item id must be a positive integer"),
});
