import ffmpeg from "fluent-ffmpeg";
import ffmpegInstaller from "@ffmpeg-installer/ffmpeg";
import path from "path";
import fs from "fs";

ffmpeg.setFfmpegPath(ffmpegInstaller.path);

export function convertToWebMP4(inputPath) {
  return new Promise((resolve, reject) => {
    const ext = path.extname(inputPath);
    const targetPath = inputPath.replace(new RegExp(`${ext}$`, "i"), "_h264.mp4");

    ffmpeg(inputPath)
      .outputOptions([
        "-c:v libx264",
        "-pix_fmt yuv420p",
        "-preset fast",
        "-crf 24",
        "-c:a aac",
        "-b:a 128k",
        "-movflags +faststart"
      ])
      .on("start", (cmd) => {
        console.log("Transcoding video for browser compatibility:", cmd);
      })
      .on("end", () => {
        console.log("Video transcode complete:", targetPath);
        if (fs.existsSync(inputPath) && inputPath !== targetPath) {
          try {
            fs.unlinkSync(inputPath);
          } catch (e) {
            console.error("Failed to remove original pre-converted video file:", e);
          }
        }
        resolve(targetPath);
      })
      .on("error", (err) => {
        console.error("Video transcode failed, fallback to original:", err.message);
        // Fallback to original file if transcode fails
        resolve(inputPath);
      })
      .save(targetPath);
  });
}
