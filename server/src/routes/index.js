import express from "express";
import userRoutes from "./userRoutes.js";
import doctorProfileRoutes from "./doctorProfileRoutes.js";
import productRoutes from "./productRoutes.js";
import brandRoutes from "./brandRoutes.js";
import appointmentRoutes from "./appointmentRoutes.js";
import cartRoutes from "./cartRoutes.js";
import orderRoutes from "./orderRoutes.js";
import paymentRoutes from "./paymentRoutes.js";
import chatRoutes from "./chatRoutes.js";
import treatmentRoutes from "./treatmentRoutes.js";

const router = express.Router();

// Mount routes
router.use("/users", userRoutes);
router.use("/doctors", doctorProfileRoutes);
router.use("/products", productRoutes);
router.use("/brands", brandRoutes);
router.use("/appointments", appointmentRoutes);
router.use("/cart", cartRoutes);
router.use("/orders", orderRoutes);
router.use("/payments", paymentRoutes);
router.use("/chat", chatRoutes);
router.use("/treatments", treatmentRoutes);

export default router;
