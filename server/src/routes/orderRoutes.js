import express from "express";
import orderController from "../controllers/orderController.js";
import { authenticate } from "../middlewares/authMiddleware.js";
import { authorize } from "../middlewares/authorizeMiddleware.js";
import { validate, validateParams } from "../middlewares/validateMiddleware.js";
import { createOrderSchema, orderParamsSchema, cancelOrderSchema } from "../validators/orderValidator.js";

const router = express.Router();

router.post(
  "/checkout",
  authenticate,
  authorize("user", "doctor", "admin"),
  validate(createOrderSchema),
  orderController.checkout,
);

router.get(
  "/my",
  authenticate,
  authorize("user", "doctor", "admin"),
  orderController.getMyOrders,
);

router.get(
  "/:orderId",
  authenticate,
  authorize("user", "doctor", "admin"),
  validateParams(orderParamsSchema),
  orderController.getOrderById,
);

router.patch(
  "/:orderId/cancel",
  authenticate,
  authorize("user", "doctor","admin"),
  validateParams(orderParamsSchema),
  validate(cancelOrderSchema),
  orderController.cancelOrder,
);

export default router;
