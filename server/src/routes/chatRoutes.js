import express from "express";
import chatController from "../controllers/chatController.js";
import { authenticate } from "../middlewares/authMiddleware.js";
import { authorize } from "../middlewares/authorizeMiddleware.js";
import { validate, validateParams } from "../middlewares/validateMiddleware.js";
import {
  appointmentChatParamsSchema,
  sendMessageSchema,
} from "../validators/chatValidator.js";

const router = express.Router();

router.get(
  "/appointments/:appointmentId/messages",
  authenticate,
  authorize("user", "doctor"),
  validateParams(appointmentChatParamsSchema),
  chatController.getMessages,
);

router.post(
  "/appointments/:appointmentId/messages",
  authenticate,
  authorize("user", "doctor"),
  validateParams(appointmentChatParamsSchema),
  validate(sendMessageSchema),
  chatController.sendMessage,
);

router.patch(
  "/appointments/:appointmentId/read",
  authenticate,
  authorize("user", "doctor"),
  validateParams(appointmentChatParamsSchema),
  chatController.markAsRead,
);

export default router;
