import mongoose from "mongoose";

const habitSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    name: { type: String, required: true, trim: true },
    icon: { type: String, default: "✓" },
    color: { type: String, default: "#63b3ed" },
    completedDates: [{ type: String }]
  },
  { timestamps: true }
);

export default mongoose.model("Habit", habitSchema);
