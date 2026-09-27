import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true },
    avatar: String,
    bio: { type: String, default: "" },
    settings: {
      theme: { type: String, default: "system" },
      notifications: {
        journalReminders: { type: Boolean, default: true },
        habitReminders: { type: Boolean, default: true },
        memoryReminders: { type: Boolean, default: true },
        moodSummaries: { type: Boolean, default: true }
      },
      journal: {
        autoSave: { type: Boolean, default: false }
      }
    },
    pushSubscription: {
      endpoint: String,
      keys: {
        p256dh: String,
        auth: String
      }
    }
  },
  { timestamps: true }
);

export default mongoose.model("User", userSchema);
