const { AttachmentBuilder } = require("discord.js");

/**
 *
 * @param {string} path
 * @param {string} channelId
 * @returns
 */
async function sendAttachment(path, title, author, videoChannel) {
  const attachment = new AttachmentBuilder(path);
  const message = await videoChannel.send({
    content: `${title} • _feito por <@${author}>_`,
    files: [attachment],
  });

  return message;
}

module.exports = sendAttachment;
