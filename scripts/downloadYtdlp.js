const config = require("../config.json");
const path = require("path");

const currentDir = path.dirname(__filename);

const YTDlpWrap = require("yt-dlp-wrap").default;
const ytDlpWrap = new YTDlpWrap(path.join(currentDir, "../yt-dlp.exe"));

async function downloadYtdlp(clipId) {
  const clipUrl = `https://youtube.com/clip/${clipId}`;
  const metadata = await ytDlpWrap.getVideoInfo(clipUrl);

  if (
    !config.youtube.allowedChannels
      .map((channel) => `@${channel.toLowerCase()}`)
      .includes(`${metadata.uploader_id.toLowerCase()}`)
  ) {
    console.log("Não é possível baixar clipes de canales não permitidos");
    return null;
  }

  if (metadata.live_status !== "is_live") {
    return { title: metadata.fulltitle, download: downloadClip(clipId) };
  }

  return {
    title: metadata.fulltitle,
    download: downloadLiveClip(metadata, clipId),
  };
}

function downloadClip(clipId) {
  return ytDlpWrap.exec(
    [
      `https://youtube.com/clip/${clipId}`,
      "-S",
      "vcodec:h264,res:1080,acodec:m4a",
      "-o",
      `./videos/${clipId}.mp4`,
    ],
    {
      shell: true,
    }
  );
}

function downloadLiveClip(metadata, clipId) {
  const streamDuration = Date.now() / 1000 - metadata.release_timestamp;
  const clipEnd = streamDuration - metadata.section_start - 3;
  const clipStart = clipEnd + metadata.duration;

  return ytDlpWrap.exec(
    [
      `${metadata.channel_url}/live`,
      "--live-from-start",
      `--download-sections`,
      `"#-${clipStart}seconds - -${clipEnd}seconds"`,
      "-S",
      "vcodec:h264,res:1080,acodec:m4a",
      "-o",
      `./videos/${clipId}.mp4`,
    ],
    {
      shell: true,
    }
  );
}

module.exports = downloadYtdlp;
