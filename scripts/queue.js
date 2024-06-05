const downloadYtdlp = require("./downloadYtdlp");
const sendAttachment = require("./sendAttatchment");
const fs = require("fs");

/**
 * @module queue
 * @returns {
 *   isProcessing: (clipId: string) => boolean,
 *   hasBeenDownloaded: (clipId: string) => null|{clipId: string, discordUrl: string},
 *   downloadLast: () => void
 * }
 */
function queue() {
  if (!fs.existsSync("db.json")) {
    fs.writeFileSync(
      "db.json",
      JSON.stringify({
        downloading: [],
        queue: [],
        downloaded: [],
      })
    );
  }

  /**
   * Checks if a clip is currently being processed (downloading or in queue).
   * @param {string} clipId - The ID of the clip to check.
   * @returns {boolean} True if the clip is being processed, otherwise false.
   */
  function isProcessing(clipId) {
    const db = JSON.parse(fs.readFileSync("db.json"));
    return db.downloading.includes(clipId) || db.queue.includes(clipId);
  }

  /**
   * Checks if a clip has been downloaded.
   * @param {string} clipId - The ID of the clip to check.
   * @returns {null|{clipId: string, discordUrl: string}} The downloaded clip object if found, otherwise false.
   */
  function hasBeenDownloaded(clipId) {
    const db = JSON.parse(fs.readFileSync("db.json"));
    return db.downloaded.find((download) => download.clipId === clipId);
  }

  function queuePosition(clipId) {
    const db = JSON.parse(fs.readFileSync("db.json"));
    return {
      position: db.queue.findIndex((queueItem) => queueItem === clipId),
      total: db.queue.length,
    };
  }

  function addToQueue(clipId) {
    const db = JSON.parse(fs.readFileSync("db.json"));
    db.queue.push(clipId);

    fs.writeFileSync("db.json", JSON.stringify(db));
  }

  /**
   * Downloads the last clip in the queue.
   */
  async function downloadLast(videoChannel) {
    const db = JSON.parse(fs.readFileSync("db.json"));

    db.downloading.pop();

    if (db.queue.length === 0) {
      fs.writeFileSync("db.json", JSON.stringify(db));
      return;
    }

    db.downloading.push(db.queue.slice(-1)[0]);
    db.queue.pop();

    fs.writeFileSync("db.json", JSON.stringify(db));

    const clipId = db.downloading[0];
    const ytDlpWrap = await downloadYtdlp(clipId);

    if (!ytDlpWrap) {
      downloadLast(videoChannel);
      return;
    }

    ytDlpWrap
      .on("progress", (progress) =>
        console.log(
          progress.percent,
          progress.totalSize,
          progress.currentSpeed,
          progress.eta
        )
      )
      .on("ytDlpEvent", (eventType, eventData) =>
        console.log(`Evento (${eventType}): ${eventData}`)
      )
      .on("error", (error) => {
        console.error(error);
      })
      .on("close", async () => {
        const path = `./videos/${clipId}.mp4`;
        const message = await sendAttachment(path, videoChannel);

        db.downloaded.push({ clipId: clipId, discordUrl: message.url });
        fs.writeFileSync("db.json", JSON.stringify(db));

        downloadLast(videoChannel);
      });
  }

  return {
    isProcessing,
    queuePosition,
    hasBeenDownloaded,
    addToQueue,
    downloadLast,
  };
}

module.exports = queue;
