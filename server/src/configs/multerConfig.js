import multer from "multer";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const UPLOADS_ROOT = path.resolve(__dirname, "../../uploads");
const PROFILES_DIR = path.join(UPLOADS_ROOT, "profiles");
const PRODUCTS_DIR = path.join(UPLOADS_ROOT, "products");
const BRANDS_DIR = path.join(UPLOADS_ROOT, "brands");
const TREATMENTS_DIR = path.join(UPLOADS_ROOT, "treatments");

const ensureDir = (dirPath) => {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
};

// Profile image storage configuration
const profileStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    ensureDir(PROFILES_DIR);
    cb(null, PROFILES_DIR);
  },
  filename: (req, file, cb) => {
    const userId = req.user?.id;
    const imageName = `profile_${userId}_${Date.now()}.${file.originalname.split(".").pop()}`;
    cb(null, imageName);
  },
});

// Product images storage configuration
const productStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    ensureDir(PRODUCTS_DIR);
    cb(null, PRODUCTS_DIR);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = `${Date.now()}_${Math.round(Math.random() * 1e9)}`;
    const ext = path.extname(file.originalname);
    const imageName = `product_${uniqueSuffix}${ext}`;
    cb(null, imageName);
  },
});

// Brand logo storage configuration
const brandStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    ensureDir(BRANDS_DIR);
    cb(null, BRANDS_DIR);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = `${Date.now()}_${Math.round(Math.random() * 1e9)}`;
    const ext = path.extname(file.originalname);
    const imageName = `brand_${uniqueSuffix}${ext}`;
    cb(null, imageName);
  },
});

// Treatment image storage configuration
const treatmentStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    ensureDir(TREATMENTS_DIR);
    cb(null, TREATMENTS_DIR);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = `${Date.now()}_${Math.round(Math.random() * 1e9)}`;
    const ext = path.extname(file.originalname);
    const imageName = `treatment_${uniqueSuffix}${ext}`;
    cb(null, imageName);
  },
});

// File filter to allow only image files
const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image/")) {
    cb(null, true);
  } else {
    cb(new Error("Only image files are allowed"), false);
  }
};

// Create multer instances
export const upload = multer({
  storage: profileStorage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
});

export const productUpload = multer({
  storage: productStorage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB per image
});

export const brandUpload = multer({
  storage: brandStorage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB logo
});

export const treatmentUpload = multer({
  storage: treatmentStorage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB image
});

// Delete old profile image
export const deleteOldImage = (imagePath) => {
  if (imagePath) {
    try {
      fs.unlinkSync(imagePath);
    } catch (error) {
      console.error("Failed to delete old image:", error);
    }
  }
};

// Delete product images
export const deleteProductImages = (imagePaths) => {
  if (Array.isArray(imagePaths)) {
    imagePaths.forEach((imagePath) => {
      if (imagePath) {
        try {
          fs.unlinkSync(imagePath);
        } catch (error) {
          console.error("Failed to delete product image:", error);
        }
      }
    });
  }
};
