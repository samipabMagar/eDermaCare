import express from "express";
import userController from "../controllers/userController.js";
import { validate } from "../middlewares/validateMiddleware.js";
import {
  changePasswordSchema,
  loginSchema,
  registerSchema,
  userIdParamsSchema,
  updateProfileSchema,
} from "../validators/userValidator.js";
import { authenticate } from "../middlewares/authMiddleware.js";
import { upload } from "../configs/multerConfig.js";
import { handleUploadError } from "../middlewares/uploadMiddleware.js";
import { authorize } from "../middlewares/authorizeMiddleware.js";
import { validateParams } from "../middlewares/validateMiddleware.js";

const router = express.Router();

// PUBLIC ROUTES
router.post("/register", validate(registerSchema), userController.register);
router.post("/login", validate(loginSchema), userController.login);

// USER ROUTES (Authenticated)
router.get("/profile", authenticate, userController.getCurrentUser);
router.post("/logout", authenticate, userController.logout);
router.put(
  "/profile",
  authenticate,
  validate(updateProfileSchema),
  userController.updateProfile,
);
router.put(
  "/profile/change-password",
  authenticate,
  validate(changePasswordSchema),
  userController.changePassword,
);

// Profile image routes
router.put(
  "/profile/image",
  authenticate,
  upload.single("profile_image"),
  handleUploadError,
  userController.uploadProfileImage,
);

// ADMIN ROUTES (Authenticated + Admin only)
router.get("/", authenticate, authorize("admin"), userController.getAllUsers);
router.delete(
  "/:userId",
  authenticate,
  authorize("admin"),
  validateParams(userIdParamsSchema),
  userController.deleteUser,
);

export default router;
