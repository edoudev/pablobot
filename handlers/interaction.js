const { MessageFlags } = require("discord.js");
const crypto = require("crypto");
const https = require("https");
const os = require("os");
const fs = require("fs");
const path = require("path");

const { getNextAsset, addAsset } = require("../utils/queue");
const { compress } = require("../utils/compress");

const {
  command,
  cooldownTime,
  cooldownMessage,
  addNewResources,
} = require("../config.json");

const downloadAttachment = (url, dest) =>
  new Promise((resolve, reject) => {
    const file = fs.createWriteStream(dest);
    https
      .get(url, (res) => {
        res.pipe(file);
        file.on("finish", () => {
          file.close(resolve);
        });
      })
      .on("error", (err) => {
        fs.unlink(dest, () => reject(err));
      });
  });

const handleNewResource = async (interaction) => {
  await interaction.deferReply({ flags: MessageFlags.Ephemeral });

  const attachment = interaction.options.getAttachment("attachment");
  const tempPath = path.join(
    os.tmpdir(),
    crypto.randomUUID() + path.extname(attachment.name)
  );

  try {
    await downloadAttachment(attachment.url, tempPath);

    const { size } = await fs.promises.stat(tempPath);

    let fileToCopy = tempPath;

    // Compress file only if larger than 1MB
    if (size > 1_000_000) {
      fileToCopy = await compress(tempPath, 1_000_000);
    }

    fs.copyFileSync(
      fileToCopy,
      path.join(__dirname, "../resources", path.basename(fileToCopy))
    );

    addAsset(path.basename(fileToCopy));

    await interaction.editReply({
      content: "Attachment added to resources!",
    });
  } catch (e) {
    console.error(e);
    await interaction.editReply({ content: e.message });
    return;
  }
};

module.exports = (client) => {
  const cooldown = new Set();

  client.on("interactionCreate", async (interaction) => {
    if (!interaction.isChatInputCommand()) return;

    if (interaction.commandName !== command) {
      return;
    }

    // Reject if user is on cooldown
    if (cooldown.has(interaction.user.id)) {
      await interaction.deferReply({ flags: MessageFlags.Ephemeral });
      await interaction.editReply({
        content: cooldownMessage,
      });

      return;
    }

    // Check if interaction has attachment and if user can add new resources
    if (
      interaction.options.getAttachment("attachment") &&
      (addNewResources.userIDS.includes(interaction.user.id) ||
        addNewResources.roleIDS.some((roleId) =>
          interaction.member.roles.cache.has(roleId)
        ))
    ) {
      handleNewResource(interaction);

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
