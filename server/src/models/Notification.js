import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true
    },
    type: {
      type: String,
      enum: ["journal", "habit", "memory", "mood", "streak", "reminder"],
      default: "reminder"
    },
    title: {
      type: String,
      required: true
    },
    message: {
      type: String,
      required: true
    },
    read: {
      type: Boolean,
      default: false
    },
    relatedId: {
      type: String,
      default: null
    },
    date: {
      type: String,
      default: null,
      index: true
    }
  },
  {
    timestamps: true
  }
);

notificationSchema.index({ userId: 1, type: 1, relatedId: 1, date: 1 });

export default mongoose.model("Notification", notificationSchema);

