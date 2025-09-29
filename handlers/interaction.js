const { MessageFlags } = require("discord.js");

const {getNextAsset} = require("../utils/queue");

const { command, cooldownTime, cooldownMessage } = require("../config.json");

module.exports = (client) => {
  const cooldown = new Set();

  client.on("interactionCreate", async (interaction) => {
    if (!interaction.isChatInputCommand()) return;

    if (interaction.commandName !== command) {
      return;
    }

    // Reject if user is on cooldown
    if (cooldown.has(interaction.user.id)) {
      await interaction.reply({
        content: cooldownMessage,
        flags: MessageFlags.Ephemeral,
      });

      return;
    }

    await interaction.deferReply();
    await interaction.editReply({ files: [getNextAsset()] });

    // Add user to cooldown
    cooldown.add(interaction.user.id);
    setTimeout(() => {
      cooldown.delete(interaction.user.id);
    }, cooldownTime);
  });
};
