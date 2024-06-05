const { AttachmentBuilder } = require("discord.js");

/**
 *
 * @param {string} path
 * @param {string} channelId
 * @returns
 */
async function sendAttachment(path, videoChannel) {
  const attachment = new AttachmentBuilder(path);
  const message = await videoChannel.send({ files: [attachment] });

  return message;
}

module.exports = sendAttachment;
