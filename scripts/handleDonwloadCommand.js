const queueModule = require("./queue");

async function handleDownloadCommand(interaction, videoChannel) {
  let [youtubeUrl] =
    String(interaction.options.getString("url")).match(
      /^https?:\/\/(www\.)?youtube\.com\/clip\/[A-Za-z0-9_-]+(\?.*)?$/
    ) ?? [];

  if (!youtubeUrl) {
    await interaction.reply({
      content: `❌ Esse não é um link válido. Apenas clipes do youtube são aceitos!`,
      ephemeral: true,
    });

    return;
  }

  const clipId = youtubeUrl.split("/").slice(-1)[0].split("?")[0];
  const queue = queueModule();
  const downloadedClip = queue.hasBeenDownloaded(clipId);

  if (downloadedClip) {
    await interaction.reply({
      content: `⚠ Clip já foi baixado. ${downloadedClip.discordUrl}`,
      ephemeral: true,
    });

    return;
  }

  if (queue.isProcessing(clipId)) {
    await interaction.reply({
      content: `⏬ Seu clip está sendo baixado. Quando terminar, ele vai aparecer aqui.`,
      ephemeral: true,
    });

    return;
  }

  queue.addToQueue(clipId);

  await interaction.reply({
    content: `⏱ Seu vídeo foi colocado na fila, em breve ele vai aparecer aqui.`,
    ephemeral: true,
  });

  await queue.downloadLast(videoChannel);
}

module.exports = handleDownloadCommand;
