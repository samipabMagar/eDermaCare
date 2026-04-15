import express from "express";
import productController from "../controllers/productController.js";
import { authenticate } from "../middlewares/authMiddleware.js";
import { authorize } from "../middlewares/authorizeMiddleware.js";
import { createProductSchema , updateProductSchema } from "../validators/productValidator.js";
import { validate } from "../middlewares/validateMiddleware.js";
import { productUpload } from "../configs/multerConfig.js";

const router = express.Router();

// PUBLIC ROUTES - Anyone can view products
router.get("/", productController.getAllProducts);
router.get("/:id/related", productController.getRelatedProducts);
router.get("/:id", productController.getProductById);

// ADMIN ROUTES - Only admins can manage products
router.post(
  "/",
  authenticate,
  authorize("admin"),
  productUpload.array("images", 5),
  validate(createProductSchema),
  productController.createProduct
);
router.put("/:id", authenticate, authorize("admin"), validate(updateProductSchema), productController.updateProduct)
router.delete("/:id", authenticate, authorize("admin"), productController.deleteProduct)

export default router;