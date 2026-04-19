import express from "express";
import transactionController from "../controllers/transactionController.js";
import { authenticate } from "../middlewares/authMiddleware.js";
import { authorize } from "../middlewares/authorizeMiddleware.js";

const router = express.Router();

router.get(
  "/stats/overview",
  authenticate,
  authorize("admin"),
  transactionController.getTransactionStats,
);

router.get(
  "/",
  authenticate,
  authorize("admin"),
  transactionController.getAllTransactions,
);

export default router;
