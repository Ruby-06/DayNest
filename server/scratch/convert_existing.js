import mongoose from "mongoose";
import path from "path";
import fs from "fs";
import dotenv from "dotenv";
import Entry from "../src/models/Entry.js";
import { convertToWebMP4 } from "../src/utils/videoConverter.js";

dotenv.config({ path: path.resolve(process.cwd(), ".env") });

async function run() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log("Connected to MongoDB.");

  const entries = await Entry.find({ "media.type": "video" });
  console.log(`Found ${entries.length} entries containing video.`);

  for (const entry of entries) {
    let updated = false;
    for (const item of entry.media) {
      if (item.type === "video" && item.url) {
        const filename = path.basename(item.url);
        const originalPath = path.resolve(process.cwd(), "uploads", filename);
        if (fs.existsSync(originalPath)) {
          console.log("Converting file:", filename);
          const convertedPath = await convertToWebMP4(originalPath);
          const newFilename = path.basename(convertedPath);
          const newUrl = `/uploads/${newFilename}`;
          item.url = newUrl;
          updated = true;
          console.log(`Updated video URL from ${filename} -> ${newFilename}`);
        }
      }
    }
    if (updated) {
      await entry.save();
      console.log("Saved updated entry in DB.");
    }
  }

  await mongoose.disconnect();
  console.log("Done converting existing videos.");
}

run().catch(console.error);
