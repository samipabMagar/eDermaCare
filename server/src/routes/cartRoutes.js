import express from "express";
import cartController from "../controllers/cartController.js";
import { authenticate } from "../middlewares/authMiddleware.js";
import { validate, validateParams } from "../middlewares/validateMiddleware.js";
import {
  addCartItemSchema,
  cartItemParamsSchema,
  updateCartItemSchema,
} from "../validators/cartValidator.js";

const router = express.Router();

// All cart routes require logged-in user
router.get("/", authenticate, cartController.getCart);
router.post(
  "/items",
  authenticate,
  validate(addCartItemSchema),
  cartController.addItem,
);
router.patch(
  "/items/:itemId",
  authenticate,
  validateParams(cartItemParamsSchema),
  validate(updateCartItemSchema),
  cartController.updateItem,
);
router.delete(
  "/items/:itemId",
  authenticate,
  validateParams(cartItemParamsSchema),
  cartController.removeItem,
);
router.delete("/", authenticate, cartController.clearCart);

export default router;
