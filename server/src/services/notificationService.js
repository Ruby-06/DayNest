import Notification from "../models/Notification.js";
import Habit from "../models/Habit.js";
import Entry from "../models/Entry.js";
import User from "../models/User.js";
import webPush from "web-push";

// Optional VAPID keys setup
const vapidPublicKey = process.env.VAPID_PUBLIC_KEY;
const vapidPrivateKey = process.env.VAPID_PRIVATE_KEY;
const vapidSubject = process.env.VAPID_SUBJECT || "mailto:admin@daynest.app";

if (vapidPublicKey && vapidPrivateKey) {
  try {
    webPush.setVapidDetails(vapidSubject, vapidPublicKey, vapidPrivateKey);
  } catch (e) {
    console.warn("VAPID setup warning:", e.message);
  }
}

export function getLocalDateISO(date = new Date()) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export async function sendPushNotification(user, title, message, url = "/habits") {
  if (!user || !user.pushSubscription || !user.pushSubscription.endpoint) return;
  if (!vapidPublicKey || !vapidPrivateKey) return;

  const payload = JSON.stringify({
    title,
    body: message,
    icon: "/logo.png",
    data: { url }
  });

  try {
    await webPush.sendNotification(user.pushSubscription, payload);
  } catch (err) {
    console.error("Error sending web push notification:", err.message);
  }
}

export async function checkAndGenerateUserNotifications(userId) {
  try {
    const user = await User.findById(userId);
    if (!user) return;

    const today = getLocalDateISO();
    const settings = user.settings?.notifications || {};

    // 1. Daily Habit Reminders
    if (settings.habitReminders !== false) {
      const habits = await Habit.find({ userId });
      for (const habit of habits) {
        const isCompletedToday = habit.completedDates && habit.completedDates.includes(today);
        if (!isCompletedToday) {
          const existingReminder = await Notification.findOne({
            userId,
            type: "habit",
            relatedId: habit._id.toString(),
            date: today,
            title: "Complete your habit"
          });

          if (!existingReminder) {
            const newNotif = await Notification.create({
              userId,
              type: "habit",
              title: "Complete your habit",
              message: `Don't forget to complete "${habit.name}" today.`,
              relatedId: habit._id.toString(),
              date: today,
              read: false
            });

            sendPushNotification(
              user,
              "Complete your habit",
              `Don't forget to complete "${habit.name}" today.`,
              "/habits"
            );
          }
        }
      }
    }

    // 2. Daily Journal Reminder
    if (settings.journalReminders !== false) {
      const entryToday = await Entry.findOne({ userId, date: today });
      const hasJournalEntry = entryToday && (entryToday.journalText?.trim() || entryToday.mood || entryToday.media?.length);

      if (!hasJournalEntry) {
        const existingJournalReminder = await Notification.findOne({
          userId,
          type: "journal",
          date: today,
          title: "Daily journal reminder"
        });

        if (!existingJournalReminder) {
          await Notification.create({
            userId,
            type: "journal",
            title: "Daily journal reminder",
            message: "Take a moment to reflect on today.",
            date: today,
            read: false
          });

          sendPushNotification(
            user,
            "Daily journal reminder",
            "Take a moment to reflect on today.",
            "/journal"
          );
        }
      }
    }
  } catch (err) {
    console.error("Error generating user notifications:", err.message);
  }
}

export async function checkAndGenerateAllNotifications() {
  try {
    const users = await User.find({}, "_id");
    for (const u of users) {
      await checkAndGenerateUserNotifications(u._id);
    }
  } catch (err) {
    console.error("Error in checkAndGenerateAllNotifications:", err.message);
  }
}

export async function createHabitCompletionNotification(userId, habit) {
  try {
    const today = getLocalDateISO();
    const existingCompletion = await Notification.findOne({
      userId,
      type: "habit",
      relatedId: habit._id.toString(),
      date: today,
      title: "Great job!"
    });

    if (!existingCompletion) {
      const notif = await Notification.create({
        userId,
        type: "habit",
        title: "Great job!",
        message: `You completed "${habit.name}" today.`,
        relatedId: habit._id.toString(),
        date: today,
        read: false
      });

      const user = await User.findById(userId);
      if (user) {
        sendPushNotification(
          user,
          "Great job!",
          `You completed "${habit.name}" today.`,
          "/habits"
        );
      }
      return notif;
    }
  } catch (err) {
    console.error("Error creating completion notification:", err.message);
  }
}

export async function checkAndCreateStreakNotification(userId, habit, streak) {
  try {
    const milestones = [3, 7, 14, 30];
    if (!milestones.includes(streak)) return;

    const today = getLocalDateISO();
    const existingStreak = await Notification.findOne({
      userId,
      type: "streak",
      relatedId: habit._id.toString(),
      date: today
    });

    if (!existingStreak) {
      const notif = await Notification.create({
        userId,
        type: "streak",
        title: `🔥 ${streak} day streak!`,
        message: `Awesome consistency on "${habit.name}"!`,
        relatedId: habit._id.toString(),
        date: today,
        read: false
      });

      const user = await User.findById(userId);
      if (user) {
        sendPushNotification(
          user,
          `🔥 ${streak} day streak!`,
          `Awesome consistency on "${habit.name}"!`,
          "/habits"
        );
      }
      return notif;
    }
  } catch (err) {
    console.error("Error creating streak notification:", err.message);
  }
}
