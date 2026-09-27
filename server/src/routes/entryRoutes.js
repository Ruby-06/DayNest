import express from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import Entry from "../models/Entry.js";
import auth from "../middleware/auth.js";
import { convertToWebMP4 } from "../utils/videoConverter.js";

const router = express.Router();
router.use(auth);

const uploadDir = path.resolve(process.cwd(), "uploads");
fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (_, __, cb) => cb(null, uploadDir),
  filename: (_, file, cb) => cb(null, `${Date.now()}-${file.originalname.replace(/[^a-zA-Z0-9._-]/g, "_")}`)
});
const upload = multer({ storage });

router.get("/", async (req, res) => {
  try {
    const entries = await Entry.find({ userId: req.userId }).sort({ date: -1 });
    res.json(entries);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post("/", async (req, res) => {
  try {
    const { date, mood, journalText, tags } = req.body;
    const cleanTags = Array.isArray(tags)
      ? tags.map((t) => String(t).trim()).filter(Boolean)
      : typeof tags === "string"
      ? tags.split(",").map((t) => t.trim()).filter(Boolean)
      : [];

    const entry = await Entry.findOneAndUpdate(
      { userId: req.userId, date },
      { date, mood, journalText, tags: cleanTags, userId: req.userId },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );
    res.json(entry);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

router.post("/:id/media", upload.array("media", 12), async (req, res) => {
  try {
    const entry = await Entry.findOne({ _id: req.params.id, userId: req.userId });
    if (!entry) return res.status(404).json({ message: "Entry not found" });

    const processedFiles = [];
    for (const file of req.files || []) {
      const isVideo = file.mimetype.startsWith("video") || /\.(mp4|webm|ogg|mov|m4v|mkv|avi)$/i.test(file.originalname);
      let finalFilename = file.filename;

      if (isVideo) {
        try {
          const originalPath = path.resolve(uploadDir, file.filename);
          const convertedPath = await convertToWebMP4(originalPath);
          finalFilename = path.basename(convertedPath);
        } catch (e) {
          console.error("Video conversion error:", e);
        }
      }

      processedFiles.push({
        type: isVideo ? "video" : "image",
        url: `/uploads/${finalFilename}`,
        name: file.originalname
      });
    }

    entry.media.push(...processedFiles);
    await entry.save();
    res.json(entry);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

router.delete("/:id/media/:mediaId", async (req, res) => {
  try {
    const entry = await Entry.findOne({ _id: req.params.id, userId: req.userId });
    if (!entry) return res.status(404).json({ message: "Entry not found" });

    const mediaId = req.params.mediaId;
    const mediaItem = entry.media.id(mediaId) || entry.media.find((m) => String(m._id) === mediaId);

    if (mediaItem) {
      if (mediaItem.url) {
        const filename = path.basename(mediaItem.url);
        const filePath = path.join(uploadDir, filename);
        if (fs.existsSync(filePath)) {
          try { fs.unlinkSync(filePath); } catch (e) { console.error("Could not delete file:", e); }
        }
      }
      entry.media.pull({ _id: mediaItem._id });
    }

    await entry.save();
    res.json(entry);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

router.delete("/:id/media", async (req, res) => {
  try {
    const entry = await Entry.findOne({ _id: req.params.id, userId: req.userId });
    if (!entry) return res.status(404).json({ message: "Entry not found" });

    const { mediaId, url } = req.query;
    let target = null;
    if (mediaId) {
      target = entry.media.id(mediaId) || entry.media.find((m) => String(m._id) === mediaId);
    } else if (url) {
      target = entry.media.find((m) => m.url === url);
    }

    if (target) {
      if (target.url) {
        const filename = path.basename(target.url);
        const filePath = path.join(uploadDir, filename);
        if (fs.existsSync(filePath)) {
          try { fs.unlinkSync(filePath); } catch (e) {}
        }
      }
      entry.media.pull({ _id: target._id });
    } else if (url) {
      entry.media = entry.media.filter((m) => m.url !== url);
    }

    await entry.save();
    res.json(entry);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

router.delete("/:id", async (req, res) => {
  await Entry.deleteOne({ _id: req.params.id, userId: req.userId });
  res.json({ ok: true });
});

export default router;
