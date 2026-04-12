import express from "express";
import { authenticate } from "../middlewares/authMiddleware.js";
import { authorize } from "../middlewares/authorizeMiddleware.js";
import brandController from "../controllers/brandController.js";
import { validate } from "../middlewares/validateMiddleware.js";
import {
  createBrandSchema,
  updateBrandSchema,
} from "../validators/brandValidator.js";
import { brandUpload } from "../configs/multerConfig.js";
import { handleUploadError } from "../middlewares/uploadMiddleware.js";

const router = express.Router();

router.get("/", brandController.getAllBrands);

router.post(
  "/",
  authenticate,
  authorize("admin"),
  brandUpload.single("logo"),
  handleUploadError,
  validate(createBrandSchema),
  brandController.createBrand,
);
router.put(
  "/:id",
  authenticate,
  authorize("admin"),
  validate(updateBrandSchema),
  brandController.updateBrand,
);
router.delete(
  "/:id",
  authenticate,
  authorize("admin"),
  brandController.deleteBrand,
);

export default router;
