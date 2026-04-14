import express from "express";
import treatmentController from "../controllers/treatmentController.js";
import { authenticate } from "../middlewares/authMiddleware.js";
import { authorize } from "../middlewares/authorizeMiddleware.js";
import { validate } from "../middlewares/validateMiddleware.js";
import {
  createTreatmentSchema,
  updateTreatmentSchema,
  createTreatmentAppointmentSchema,
  reviewTreatmentAppointmentSchema,
} from "../validators/treatmentValidator.js";
import { treatmentUpload } from "../configs/multerConfig.js";
import { handleUploadError } from "../middlewares/uploadMiddleware.js";

const router = express.Router();

router.get("/", treatmentController.listTreatments);

router.get(
  "/admin/all",
  authenticate,
  authorize("admin"),
  treatmentController.listTreatmentsForAdmin,
);

router.post(
  "/",
  authenticate,
  authorize("admin"),
  treatmentUpload.single("image"),
  handleUploadError,
  validate(createTreatmentSchema),
  treatmentController.createTreatment,
);

router.patch(
  "/:treatmentId",
  authenticate,
  authorize("admin"),
  treatmentUpload.single("image"),
  handleUploadError,
  validate(updateTreatmentSchema),
  treatmentController.updateTreatment,
);

router.delete(
  "/:treatmentId",
  authenticate,
  authorize("admin"),
  treatmentController.deleteTreatment,
);

router.post(
  "/bookings",
  authenticate,
  authorize("user"),
  validate(createTreatmentAppointmentSchema),
  treatmentController.createTreatmentAppointment,
);

router.get(
  "/bookings/my",
  authenticate,
  authorize("user"),
  treatmentController.getMyTreatmentAppointments,
);

router.get(
  "/bookings",
  authenticate,
  authorize("admin"),
  treatmentController.getAllTreatmentAppointments,
);

router.patch(
  "/bookings/:treatmentAppointmentId/review",
  authenticate,
  authorize("admin"),
  validate(reviewTreatmentAppointmentSchema),
  treatmentController.reviewTreatmentAppointment,
);

export default router;
