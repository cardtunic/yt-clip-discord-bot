const { AttachmentBuilder } = require("discord.js");

/**
 *
 * @param {string} path
 * @param {string} channelId
 * @returns
 */
async function sendAttachment(path, author, videoChannel) {
  const attachment = new AttachmentBuilder(path);
  const message = await videoChannel.send({
    content: `Clipe feito por <@${author}>`,
    files: [attachment],
  });

  return message;
}

module.exports = sendAttachment;
