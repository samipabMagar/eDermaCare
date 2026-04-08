import express from "express";
import paymentController from "../controllers/paymentController.js";
import { authenticate } from "../middlewares/authMiddleware.js";
import { authorize } from "../middlewares/authorizeMiddleware.js";
import { validate, validateParams } from "../middlewares/validateMiddleware.js";
import { orderParamsSchema } from "../validators/orderValidator.js";
import {
  esewaInitiateSchema,
  esewaVerifySchema,
  khaltiInitiateSchema,
  khaltiVerifySchema,
} from "../validators/paymentValidator.js";

const router = express.Router();

router.get(
  "/:orderId/history",
  authenticate,
  authorize("user", "doctor", "admin"),
  validateParams(orderParamsSchema),
  paymentController.getOrderPaymentHistory,
);

router.post(
  "/khalti/:orderId/initiate",
  authenticate,
  authorize("user", "doctor", "admin"),
  validateParams(orderParamsSchema),
  validate(khaltiInitiateSchema),
  paymentController.initiateKhalti,
);

router.post(
  "/khalti/:orderId/verify",
  authenticate,
  authorize("user", "doctor", "admin"),
  validateParams(orderParamsSchema),
  validate(khaltiVerifySchema),
  paymentController.verifyKhalti,
);

router.post(
  "/esewa/:orderId/initiate",
  authenticate,
  authorize("user", "doctor", "admin"),
  validateParams(orderParamsSchema),
  validate(esewaInitiateSchema),
  paymentController.initiateEsewa,
);

router.post(
  "/esewa/:orderId/verify",
  authenticate,
  authorize("user", "doctor", "admin"),
  validateParams(orderParamsSchema),
  validate(esewaVerifySchema),
  paymentController.verifyEsewa,
);

export default router;
