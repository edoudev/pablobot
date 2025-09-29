const fs = require("fs");
const path = require("path");

const resourcesPath = path.join(__dirname, "../resources");

let files = fs
  .readdirSync(resourcesPath)
  .filter((e) =>
    [".png", ".jpg", ".mov", ".mp4"].some((ext) => e.toLowerCase().endsWith(ext))
  );

function shuffle(array) {
  const arr = [...array];
  let m = arr.length, t, i;

  while (m) {
    i = Math.floor(Math.random() * m--);

    t = arr[m];
    arr[m] = arr[i];
    arr[i] = t;
  }

  return arr;
}

let assetsQueue = shuffle(files);

function getNextAsset() {
  const asset = assetsQueue.shift();
  if (assetsQueue.length === 0) assetsQueue = shuffle(files);

  return path.join(resourcesPath, asset);
}

module.exports = { getNextAsset };
