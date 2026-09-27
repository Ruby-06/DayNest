import express from "express";
import Entry from "../models/Entry.js";
import Habit from "../models/Habit.js";
import auth from "../middleware/auth.js";

const router = express.Router();
router.use(auth);

function escapeRegex(text) {
  return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
}

router.get("/", async (req, res) => {
  try {
    const q = req.query.q ? req.query.q.trim() : "";
    if (!q) {
      return res.json({ journals: [], memories: [], habits: [], dates: [] });
    }

    const regex = new RegExp(escapeRegex(q), "i");

    // 1. Search Entries (Journals & Memories)
    const entries = await Entry.find({
      userId: req.userId,
      $or: [
        { journalText: regex },
        { tags: regex },
        { date: regex },
        { mood: regex }
      ]
    }).sort({ date: -1 }).limit(10);

    const journals = [];
    const memories = [];

    entries.forEach((entry) => {
      const hasText = entry.journalText && entry.journalText.trim().length > 0;
      const hasMedia = entry.media && entry.media.length > 0;

      if (hasText) {
        journals.push({
          id: entry._id,
          type: "journal",
          date: entry.date,
          text: entry.journalText,
          snippet: entry.journalText.length > 80 ? entry.journalText.substring(0, 80) + "..." : entry.journalText,
          tags: entry.tags || [],
          targetPath: `/journal?date=${entry.date}`
        });
      }

      if (hasMedia) {
        const photoCount = entry.media.filter(m => m.type === "image").length;
        const videoCount = entry.media.filter(m => m.type === "video").length;
        let mediaDesc = [];
        if (photoCount > 0) mediaDesc.push(`${photoCount} photo${photoCount > 1 ? "s" : ""}`);
        if (videoCount > 0) mediaDesc.push(`${videoCount} video${videoCount > 1 ? "s" : ""}`);

        memories.push({
          id: entry._id,
          type: "memory",
          date: entry.date,
          mediaCount: entry.media.length,
          snippet: mediaDesc.join(", ") || `${entry.media.length} items`,
          tags: entry.tags || [],
          targetPath: `/memories`
        });
      }
    });

    // 2. Search Habits
    const habitsList = await Habit.find({
      userId: req.userId,
      name: regex
    }).sort({ createdAt: -1 }).limit(10);

    const habits = habitsList.map((h) => ({
      id: h._id,
      type: "habit",
      name: h.name,
      icon: h.icon || "✓",
      completedCount: h.completedDates?.length || 0,
      targetPath: "/habits"
    }));

    // 3. Search Dates matching
    const dates = [];
    const dateEntries = await Entry.find({
      userId: req.userId,
      date: regex
    }).sort({ date: -1 }).limit(5);

    dateEntries.forEach((de) => {
      // Check if not already added to avoid duplication
      if (!dates.some(d => d.date === de.date)) {
        dates.push({
          id: de._id,
          type: "date",
          date: de.date,
          targetPath: `/calendar?date=${de.date}`
        });
      }
    });

    res.json({
      journals,
      memories,
      habits,
      dates
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
