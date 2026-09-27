import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import mongoose from "mongoose";
import path from "path";
import { fileURLToPath } from "url";

import authRoutes from "./routes/authRoutes.js";
import habitRoutes from "./routes/habitRoutes.js";
import entryRoutes from "./routes/entryRoutes.js";
import notificationRoutes from "./routes/notificationRoutes.js";
import searchRoutes from "./routes/searchRoutes.js";
import { checkAndGenerateAllNotifications } from "./services/notificationService.js";

dotenv.config();

const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const uploadDir = path.resolve(__dirname, "../uploads");

app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "http://localhost:5174",
      "http://127.0.0.1:5173",
      "http://127.0.0.1:5174"
    ],
    credentials: true
  })
);
app.use(express.json({ limit: "10mb" }));
app.use(
  "/uploads",
  express.static(uploadDir, {
    acceptRanges: true,
    setHeaders: (res, filePath) => {
      const ext = path.extname(filePath).toLowerCase();
      if (ext === ".mov") {
        res.setHeader("Content-Type", "video/mp4");
      } else if (ext === ".mp4") {
        res.setHeader("Content-Type", "video/mp4");
      } else if (ext === ".webm") {
        res.setHeader("Content-Type", "video/webm");
      } else if (ext === ".ogv" || ext === ".ogg") {
        res.setHeader("Content-Type", "video/ogg");
      }
      res.setHeader("Accept-Ranges", "bytes");
    }
  })
);

app.get("/api/health", (_, res) => res.json({ ok: true, message: "DayNest API is running" }));

app.use("/api/auth", authRoutes);
app.use("/api/habits", habitRoutes);
app.use("/api/entries", entryRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/search", searchRoutes);


const PORT = process.env.PORT || 5000;

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    app.listen(PORT, () => {
      console.log(`DayNest API running on http://localhost:${PORT}`);
      // Initial check on server boot
      checkAndGenerateAllNotifications();
      // Periodically check every 15 minutes
      setInterval(checkAndGenerateAllNotifications, 15 * 60 * 1000);
    });
  })
  .catch((err) => {
    console.error("MongoDB connection failed:", err.message);
    process.exit(1);
  });

