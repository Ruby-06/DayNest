import mongoose from "mongoose";

const entrySchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    date: { type: String, required: true },
    mood: { type: String, enum: ["awful", "low", "okay", "good", "great"], default: "okay" },
    journalText: { type: String, default: "" },
    tags: [{ type: String }],
    media: [
      {
        type: { type: String, enum: ["image", "video"] },
        url: String,
        name: String
      }
    ]
  },
  { timestamps: true }
);

entrySchema.index({ userId: 1, date: 1 }, { unique: true });

export default mongoose.model("Entry", entrySchema);
