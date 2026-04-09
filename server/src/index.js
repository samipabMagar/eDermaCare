import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import helmet from "helmet";
import cors from "cors";
import rateLimit from "express-rate-limit";
import http from "http";
import path from "path";
import { fileURLToPath } from "url";
import connection from "./configs/db.js";
import "./models/index.js";
import routes from "./routes/index.js";
import { setupChatSocket } from "./sockets/chatSocket.js";

// Load environment variables
dotenv.config();

const app = express();
const server = http.createServer(app);
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadsDir = path.resolve(__dirname, "../uploads");

// Security Middleware
// Allow frontend (different origin/port) to load uploaded images safely.
app.use(
  helmet({
    crossOriginResourcePolicy: false,
  }),
);

// CORS Configuration
const corsOptions = {
  origin: process.env.CLIENT_URL || "http://localhost:3000",
  credentials: true,
  optionsSuccessStatus: 200,
};
app.use(cors(corsOptions));

// Rate Limiting
const isProduction = process.env.NODE_ENV === "production";

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: isProduction ? 100 : Number.MAX_SAFE_INTEGER,
  message: "Too many requests from this IP, please try again later.",
  standardHeaders: true,
  legacyHeaders: false,
  // React Strict Mode and HMR can trigger duplicate requests in development.
  skip: () => !isProduction,
});
app.use(limiter);

// Body Parser Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Serve static files from server/uploads
app.use(
  "/uploads",
  express.static(uploadsDir, {
    setHeaders: (res) => {
      res.setHeader("Cross-Origin-Resource-Policy", "cross-origin");
    },
  }),
);

const PORT = process.env.PORT || 8001;

// Routes
app.get("/", (req, res) => {
  res.send("eDermaCare API - Server is running");
});

// Mount all API routes
app.use("/api", routes);

// Initialize Socket.IO chat server
setupChatSocket(server, corsOptions);

// Test database connection and start the server
connection
  .authenticate()
  .then(() => {
    console.log("Database connection has been established successfully.");
    return connection.sync();
  })
  .then(() => {
    console.log("Database synced successfully.");
    server.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.error("Unable to connect to the database:", error);
  });
