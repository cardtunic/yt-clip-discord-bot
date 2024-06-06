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
      JSON.stringify(
        {
          downloading: [],
          queue: [],
          downloaded: [],
        },
        null,
        4
      )
    );
  }

  /**
   *
   * @returns {{
   *   downloading: Array<{authorId: number, clipId: string}>,
   *   queue: Array<{authorId: number, clipId: string}>,
   *   downloaded: Array<{clipId: string, discordUrl: string}>
   * }}
   */

  function database() {
    return JSON.parse(fs.readFileSync("db.json"));
  }

  /**
   * Checks if a clip is currently being processed (downloading or in queue).
   * @param {string} clipId - The ID of the clip to check.
   * @returns {boolean} True if the clip is being processed, otherwise false.
   */
  function isProcessing(clipId) {
    const db = database();
    return db.downloading.includes(clipId) || db.queue.includes(clipId);
  }

  /**
   * Checks if a clip has been downloaded.
   * @param {string} clipId - The ID of the clip to check.
   * @returns {null|{clipId: string, discordUrl: string}} The downloaded clip object if found, otherwise false.
   */
  function hasBeenDownloaded(clipId) {
    const db = database();
    return db.downloaded.find((download) => download.clipId === clipId);
  }

  function queuePosition(clipId) {
    const db = database();
    return {
      position: db.queue.findIndex((queueItem) => queueItem === clipId),
      total: db.queue.length,
    };
  }

  /**
   *
   * @param {number} authorId
   * @param {string} url
   * @param {import("discord.js").Channel} videoChannel
   * @returns {"queued"|"alreadyDownloaded"|"invalidUrl"}
   */
  function addToQueue(authorId, url, videoChannel) {
    const [youtubeUrl] =
      String(url).match(
        /^https?:\/\/(www\.)?youtube\.com\/clip\/[A-Za-z0-9_-]+(\?.*)?$/
      ) ?? [];

    if (!youtubeUrl) return "invalidUrl";

    const clipId = youtubeUrl.split("/").slice(-1)[0].split("?")[0];

    if (hasBeenDownloaded(clipId)) return "alreadyDownloaded";

    const db = database();

    db.queue.push({
      authorId: authorId,
      clipId: clipId,
    });

    fs.writeFileSync("db.json", JSON.stringify(db, null, 4));
    downloadLast(videoChannel);

    return "queued";
  }

  function isDownloading() {
    const db = database();
    return db.downloading.length > 0;
  }

  /**
   * Downloads the last clip in the queue.
   */
  async function downloadLast(videoChannel) {
    const db = database();

    db.downloading.pop();

    if (db.queue.length === 0) {
      fs.writeFileSync("db.json", JSON.stringify(db, null, 4));
      return;
    }

    db.downloading.push(db.queue.slice(-1)[0]);
    db.queue.pop();

    fs.writeFileSync("db.json", JSON.stringify(db, null, 4));

    const { clipId, author } = db.downloading[0];
    const { title, download: ytDlpWrap } = await downloadYtdlp(clipId);

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
        const message = await sendAttachment(path, title, author, videoChannel);

        db.downloaded.push({ clipId: clipId, discordUrl: message.url });
        fs.writeFileSync("db.json", JSON.stringify(db, null, 4));

        downloadLast(videoChannel);
      });
  }

  return {
    isProcessing,
    queuePosition,
    isDownloading,
    hasBeenDownloaded,
    addToQueue,
    downloadLast,
  };
}

module.exports = queue;
