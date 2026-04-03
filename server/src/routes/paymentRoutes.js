import express from "express";
import paymentController from "../controllers/paymentController.js";
import { authenticate } from "../middlewares/authMiddleware.js";
import { authorize } from "../middlewares/authorizeMiddleware.js";
import { validate, validateParams } from "../middlewares/validateMiddleware.js";
import { orderParamsSchema } from "../validators/orderValidator.js";
import { khaltiInitiateSchema } from "../validators/paymentValidator.js";

const router = express.Router();

router.post(
  "/khalti/:orderId/initiate",
  authenticate,
  authorize("user", "doctor", "admin"),
  validateParams(orderParamsSchema),
  validate(khaltiInitiateSchema),
  paymentController.initiateKhalti,
);

export default router;
