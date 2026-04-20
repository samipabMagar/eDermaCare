import express from "express";
import productController from "../controllers/productController.js";
import { authenticate } from "../middlewares/authMiddleware.js";
import { authorize } from "../middlewares/authorizeMiddleware.js";
import {
  createProductSchema,
  updateProductSchema,
} from "../validators/productValidator.js";
import { validate } from "../middlewares/validateMiddleware.js";
import { productUpload } from "../configs/multerConfig.js";
import { handleUploadError } from "../middlewares/uploadMiddleware.js";

const router = express.Router();

const optionalProductImagesUpload = (req, res, next) => {
  if (!req.is("multipart/form-data")) {
    return next();
  }

  return productUpload.array("images", 5)(req, res, (err) => {
    if (err) {
      return handleUploadError(err, req, res, next);
    }

    return next();
  });
};

// PUBLIC ROUTES - Anyone can view products
router.get("/", productController.getAllProducts);
router.get("/brands", productController.getAllBrands);
router.get("/:id/related", productController.getRelatedProducts);
router.get("/:id", productController.getProductById);

// ADMIN ROUTES - Only admins can manage products
router.post(
  "/",
  authenticate,
  authorize("admin"),
  optionalProductImagesUpload,
  validate(createProductSchema),
  productController.createProduct,
);
router.put(
  "/:id",
  authenticate,
  authorize("admin"),
  optionalProductImagesUpload,
  validate(updateProductSchema),
  productController.updateProduct,
);
router.delete(
  "/:id",
  authenticate,
  authorize("admin"),
  productController.deleteProduct,
);

export default router;
