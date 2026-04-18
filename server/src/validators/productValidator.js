import { z } from "zod";

export const createProductSchema = z.object({
  name: z
    .string({
      required_error: "Product name is required",
    })
    .trim()
    .min(1, "Product name is required")
    .max(255, "Product name must not exceed 255 characters"),

  description: z.string().trim().optional(),

  price: z.coerce
    .number({
      required_error: "Price is required",
      invalid_type_error: "Price must be a number",
    })
    .min(0, "Price must be at least 0"),

  category: z.enum(
    [
      "cleanser",
      "moisturizer",
      "serum",
      "sunscreen",
      "toner",
      "mask",
      "eye_care",
      "lip_care",
    ],
    {
      required_error: "Category is required",
      invalid_type_error: "Invalid category",
    },
  ),

  stock_quantity: z.coerce
    .number()
    .int("Stock quantity must be an integer")
    .min(0, "Stock quantity must be at least 0")
    .default(0),

  images: z.array(z.string()).optional().default([]),

  brand_id: z.coerce
    .number()
    .int()
    .positive("Brand ID must be a positive integer")
    .optional()
    .nullable(),

  skin_type: z
    .preprocess(
      (val) => {
        if (typeof val === "string") {
          try {
            return JSON.parse(val);
          } catch {
            return val;
          }
        }
        return val;
      },
      z
        .array(
          z.enum(["normal", "oily", "dry", "combination", "sensitive"], {
            invalid_type_error: "Invalid skin type",
          }),
        )
        .optional(),
    )
    .optional(),

  skin_concern: z
    .preprocess(
      (val) => {
        if (typeof val === "string") {
          try {
            return JSON.parse(val);
          } catch {
            return val;
          }
        }
        return val;
      },
      z
        .array(
          z.enum(
            [
              "dark_spots",
              "dull_skin",
              "uneven_tone",
              "fine_lines",
              "acne",
              "redness",
              "dryness",
              "pores",
            ],
            { invalid_type_error: "Invalid skin concern" },
          ),
        )
        .optional(),
    )
    .optional(),

  ingredients: z.string().trim().optional(),

  is_active: z.boolean().default(true),
});

export const updateProductSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Product name is required")
    .max(255, "Product name must not exceed 255 characters")
    .optional(),

  description: z.string().trim().optional(),

  price: z.coerce
    .number({
      invalid_type_error: "Price must be a number",
    })
    .min(0, "Price must be at least 0")
    .optional(),

  category: z
    .enum(
      [
        "cleanser",
        "moisturizer",
        "serum",
        "sunscreen",
        "toner",
        "mask",
        "eye_care",
        "lip_care",
      ],
      {
        invalid_type_error: "Invalid category",
      },
    )
    .optional(),

  stock_quantity: z.coerce
    .number()
    .int("Stock quantity must be an integer")
    .min(0, "Stock quantity must be at least 0")
    .optional(),

  images: z.array(z.string()).optional(),

  retained_images: z
    .preprocess((val) => {
      if (typeof val === "string") {
        try {
          return JSON.parse(val);
        } catch {
          return val;
        }
      }
      return val;
    }, z.array(z.string()).optional())
    .optional(),

  brand_id: z.coerce
    .number()
    .int()
    .positive("Brand ID must be a positive integer")
    .optional()
    .nullable(),

  skin_type: z
    .preprocess(
      (val) => {
        if (typeof val === "string") {
          try {
            return JSON.parse(val);
          } catch {
            return val;
          }
        }
        return val;
      },
      z
        .array(
          z.enum(["normal", "oily", "dry", "combination", "sensitive"], {
            invalid_type_error: "Invalid skin type",
          }),
        )
        .optional(),
    )
    .optional(),

  skin_concern: z
    .preprocess(
      (val) => {
        if (typeof val === "string") {
          try {
            return JSON.parse(val);
          } catch {
            return val;
          }
        }
        return val;
      },
      z
        .array(
          z.enum(
            [
              "dark_spots",
              "dull_skin",
              "uneven_tone",
              "fine_lines",
              "acne",
              "redness",
              "dryness",
              "pores",
            ],
            { invalid_type_error: "Invalid skin concern" },
          ),
        )
        .optional(),
    )
    .optional(),

  ingredients: z.string().trim().optional(),

  is_active: z.boolean().optional(),

  rating: z.coerce
    .number()
    .min(0, "Rating must be at least 0")
    .max(5, "Rating must be at most 5")
    .optional(),
});
