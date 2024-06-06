const responses = {
  invalidUrl: async (interaction) =>
    await interaction.reply({
      content: `❌ Esse não é um link válido. Apenas clipes do youtube são aceitos!`,
      ephemeral: true,
    }),

  alreadyDownloaded: async (interaction) =>
    await interaction.reply({
      content: `⚠ Clip já foi baixado. ${downloadedClip.discordUrl}`,
      ephemeral: true,
    }),

  processing: async (interaction) =>
    await interaction.reply({
      content: `⏬ Seu clip está sendo baixado. Quando terminar, ele vai aparecer aqui.`,
      ephemeral: true,
    }),

  queued: async (interaction) =>
    await interaction.reply({
      content: `⏱ Seu vídeo foi colocado na fila, em breve ele vai aparecer aqui.`,
      ephemeral: true,
    }),
};

/**
 *
 * @param {import("discord.js").Interaction<import("discord.js").CacheType>} interaction
 * @param {import("discord.js").Channel} videoChannel
 */
async function handleDownloadCommand(interaction, videoChannel) {
  const { addToQueue } = require("./queue")();
  const url = interaction.options.getString("url");

  const status = addToQueue(interaction.user.id, url, videoChannel);

  await responses[status](interaction);
}

module.exports = handleDownloadCommand;
