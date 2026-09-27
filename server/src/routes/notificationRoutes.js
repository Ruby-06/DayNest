import express from "express";
import Notification from "../models/Notification.js";
import User from "../models/User.js";
import auth from "../middleware/auth.js";
import { checkAndGenerateUserNotifications } from "../services/notificationService.js";

const router = express.Router();
router.use(auth);

// GET /api/notifications - Fetch user's real notifications (triggers check for daily reminders)
router.get("/", async (req, res) => {
  try {
    // Generate any pending daily habit / journal reminders for today first
    await checkAndGenerateUserNotifications(req.userId);

    const notifications = await Notification.find({ userId: req.userId }).sort({ createdAt: -1 });
    const unreadCount = notifications.filter((n) => !n.read).length;

    res.json({
      notifications,
      unreadCount
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/notifications/unread-count - Fetch unread count only
router.get("/unread-count", async (req, res) => {
  try {
    const unreadCount = await Notification.countDocuments({ userId: req.userId, read: false });
    res.json({ unreadCount });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PATCH /api/notifications/:id/read - Mark single notification as read
router.patch("/:id/read", async (req, res) => {
  try {
    const notification = await Notification.findOneAndUpdate(
      { _id: req.params.id, userId: req.userId },
      { read: true },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({ message: "Notification not found" });
    }

    const unreadCount = await Notification.countDocuments({ userId: req.userId, read: false });

    res.json({ notification, unreadCount });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PATCH /api/notifications/read-all - Mark all user notifications as read
router.patch("/read-all", async (req, res) => {
  try {
    await Notification.updateMany({ userId: req.userId, read: false }, { read: true });

    const notifications = await Notification.find({ userId: req.userId }).sort({ createdAt: -1 });

    res.json({
      ok: true,
      notifications,
      unreadCount: 0
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/notifications - Create custom notification
router.post("/", async (req, res) => {
  try {
    const { type, title, message, relatedId, date } = req.body;
    if (!title || !message) {
      return res.status(400).json({ message: "Title and message are required" });
    }

    const notification = await Notification.create({
      userId: req.userId,
      type: type || "reminder",
      title,
      message,
      relatedId,
      date
    });

    const unreadCount = await Notification.countDocuments({ userId: req.userId, read: false });

    res.status(201).json({ notification, unreadCount });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/notifications/vapid-key
router.get("/vapid-key", (req, res) => {
  res.json({ publicKey: process.env.VAPID_PUBLIC_KEY || "" });
});

// POST /api/notifications/subscribe - Save browser Web Push subscription
router.post("/subscribe", async (req, res) => {
  try {
    const { subscription } = req.body;
    if (!subscription) {
      return res.status(400).json({ message: "Subscription payload required" });
    }

    await User.findByIdAndUpdate(req.userId, { pushSubscription: subscription });
    res.json({ ok: true, message: "Push subscription saved" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
