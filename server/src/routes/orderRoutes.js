import express from "express";
import orderController from "../controllers/orderController.js";
import { authenticate } from "../middlewares/authMiddleware.js";
import { authorize } from "../middlewares/authorizeMiddleware.js";
import { validate } from "../middlewares/validateMiddleware.js";
import { createOrderSchema } from "../validators/orderValidator.js";

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

export default router;
