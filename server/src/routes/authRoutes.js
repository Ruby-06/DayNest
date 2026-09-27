import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import multer from "multer";
import path from "path";
import fs from "fs";
import User from "../models/User.js";
import auth from "../middleware/auth.js";

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || "daynest_secret_key_2026_super_secure";

const makeToken = (id) => jwt.sign({ id }, JWT_SECRET, { expiresIn: "7d" });

const uploadDir = path.resolve(process.cwd(), "uploads");
fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (_, __, cb) => cb(null, uploadDir),
  filename: (_, file, cb) => cb(null, `avatar-${Date.now()}-${file.originalname.replace(/[^a-zA-Z0-9._-]/g, "_")}`)
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_, file, cb) => {
    const allowed = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
    if (allowed.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Only JPG, JPEG, PNG, and WEBP files are allowed"));
    }
  }
});

router.post("/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) return res.status(400).json({ message: "All fields are required" });

    const exists = await User.findOne({ email });
    if (exists) return res.status(409).json({ message: "Email already registered" });

    const hash = await bcrypt.hash(password, 12);
    const user = await User.create({ name, email, password: hash });

    res.status(201).json({
      token: makeToken(user._id),
      user: { id: user._id, name: user.name, email: user.email }
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    res.json({
      token: makeToken(user._id),
      user: { id: user._id, name: user.name, email: user.email, avatar: user.avatar, bio: user.bio, settings: user.settings }
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get("/me", auth, async (req, res) => {
  try {
    const user = await User.findById(req.userId).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json({ id: user._id, name: user.name, email: user.email, avatar: user.avatar, bio: user.bio, settings: user.settings });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.put("/profile", auth, async (req, res) => {
  try {
    const { name, bio, avatar } = req.body;
    const updateData = {};
    if (name !== undefined) updateData.name = name;
    if (bio !== undefined) updateData.bio = bio;
    if (avatar !== undefined) updateData.avatar = avatar;

    const user = await User.findByIdAndUpdate(req.userId, updateData, { new: true }).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });

    res.json({ id: user._id, name: user.name, email: user.email, avatar: user.avatar, bio: user.bio, settings: user.settings });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.put("/settings", auth, async (req, res) => {
  try {
    const { settings } = req.body;
    const user = await User.findByIdAndUpdate(req.userId, { settings }, { new: true }).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });

    res.json({ id: user._id, name: user.name, email: user.email, avatar: user.avatar, bio: user.bio, settings: user.settings });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/auth/profile-image
router.post("/profile-image", auth, upload.single("avatar"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No image file uploaded" });
    }
    const avatarUrl = `/uploads/${req.file.filename}`;

    const user = await User.findByIdAndUpdate(
      req.userId,
      { avatar: avatarUrl },
      { new: true }
    ).select("-password");

    if (!user) return res.status(404).json({ message: "User not found" });

    res.json({
      message: "Profile image uploaded successfully",
      avatar: avatarUrl,
      user: { id: user._id, name: user.name, email: user.email, avatar: user.avatar, bio: user.bio, settings: user.settings }
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
