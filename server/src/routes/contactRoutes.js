import express from "express";
import contactController from "../controllers/contactController.js";
import { validate } from "../middlewares/validateMiddleware.js";
import { submitContactSchema } from "../validators/contactValidator.js";

const router = express.Router();

router.post(
  "/",
  validate(submitContactSchema),
  contactController.submitContactForm,
);

export default router;
