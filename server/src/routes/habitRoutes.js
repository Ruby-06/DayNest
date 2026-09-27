import express from "express";
import Habit from "../models/Habit.js";
import auth from "../middleware/auth.js";
import {
  createHabitCompletionNotification,
  checkAndCreateStreakNotification,
  getLocalDateISO
} from "../services/notificationService.js";

const router = express.Router();
router.use(auth);

// Helper to compute habit streak on server
function calculateHabitStreak(completedDates, todayISO) {
  if (!completedDates || !completedDates.length) return 0;
  const set = new Set(completedDates);
  let streak = 0;
  let curr = new Date(todayISO);

  if (set.has(todayISO)) {
    streak++;
    curr.setDate(curr.getDate() - 1);
  } else {
    const yesterday = new Date(curr);
    yesterday.setDate(yesterday.getDate() - 1);
    const yISO = getLocalDateISO(yesterday);
    if (!set.has(yISO)) return 0;
    curr = yesterday;
  }

  while (true) {
    const iso = getLocalDateISO(curr);
    if (set.has(iso)) {
      streak++;
      curr.setDate(curr.getDate() - 1);
    } else {
      break;
    }
  }
  return streak;
}

router.get("/", async (req, res) => {
  const habits = await Habit.find({ userId: req.userId }).sort({ createdAt: 1 });
  res.json(habits);
});

router.post("/", async (req, res) => {
  try {
    const habit = await Habit.create({ ...req.body, userId: req.userId });
    res.status(201).json(habit);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

router.patch("/:id/toggle", async (req, res) => {
  try {
    const habit = await Habit.findOne({ _id: req.params.id, userId: req.userId });
    if (!habit) return res.status(404).json({ message: "Habit not found" });

    const date = req.body.date || getLocalDateISO();
    const isNowCompleted = !habit.completedDates.includes(date);

    habit.completedDates = isNowCompleted
      ? [...habit.completedDates, date]
      : habit.completedDates.filter((d) => d !== date);

    await habit.save();

    // Trigger real completion notification if habit was marked as completed
    if (isNowCompleted) {
      await createHabitCompletionNotification(req.userId, habit);

      const streak = calculateHabitStreak(habit.completedDates, date);
      await checkAndCreateStreakNotification(req.userId, habit, streak);
    }

    res.json(habit);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

router.delete("/:id", async (req, res) => {
  await Habit.deleteOne({ _id: req.params.id, userId: req.userId });
  res.json({ ok: true });
});

export default router;
