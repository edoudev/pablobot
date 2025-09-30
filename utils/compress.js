const path = require("path");
const crypto = require("crypto");
const os = require("os");
const fs = require("fs");
const sharp = require("sharp");
const { ffmpegPath, ffprobePath } = require("ffmpeg-ffprobe-static");
const { execa } = require("execa");

const compressImage = async (inputPath, maxSize) => {
  const tempDir = path.join(os.tmpdir(), crypto.randomUUID());
  await fs.promises.mkdir(tempDir, { recursive: true });

  const outputPath = path.join(tempDir, `${crypto.randomUUID()}.jpg`);

  let quality = 100;
  while (quality > 5) {
    await sharp(inputPath).jpeg({ quality }).toFile(outputPath);

    const { size } = await fs.promises.stat(outputPath);
    if (size <= maxSize) break;

    quality -= 5;
  }

  return outputPath;
};

const compressVideo = async (inputPath, maxSize) => {
  let crf = 28;
  const outputPath = path.join(os.tmpdir(), crypto.randomUUID() + ".mp4");

  while (crf <= 35) {
    await execa(ffmpegPath, [
      "-i",
      inputPath,
      "-tag:v",
      "hvc1",
      "-c:v",
      "libx265",
      "-crf",
      crf.toString(),
      "-preset",
      "fast",
      "-c:a",
      "aac",
      "-b:a",
      "128k",
      "-movflags",
      "+faststart",
      outputPath,
      "-y",
    ]);

    const { size } = fs.statSync(outputPath);
    if (size <= maxSize) break;

    crf += 2;
  }

  return outputPath;
};

const compress = async (input, maxSize = 1_000_000) => {
  const isImage = await sharp(input)
    .metadata()
    .then(() => true)
    .catch(() => false);

  if (isImage) {
    return compressImage(input, maxSize);
  }

  const isVideo = await execa(ffprobePath, [
    "-v",
    "error",
    "-select_streams",
    "v:0",
    "-show_entries",
    "stream=codec_type",
    "-of",
    "default=noprint_wrappers=1:nokey=1",
    input,
  ])
    .then(({ stdout }) => stdout.toLowerCase().includes("video"))
    .catch(() => false);

  if (isVideo) {
    return compressVideo(input);
  }

  throw new Error("Unsupported format");
};

module.exports = { compress, compressImage, compressVideo };
