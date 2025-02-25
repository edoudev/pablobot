const { Client, GatewayIntentBits } = require("discord.js");
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers,
  ],
});
const config = require("./config.json");
const fs = require("fs");
const https = require("https");
const _ = require("lodash");

const cooldown = new Set();

const files = fs
  .readdirSync("./resources/")
  .filter((e) =>
    [".png", ".jpg", ".mov", ".mp4"].some((extension) =>
      e.toLowerCase().endsWith(extension)
    )
  );

let picturesQueue = _.shuffle(files);

client.on("ready", () => {
  console.log(`Logged in as ${client.user.tag}!`);
});

client.on("messageCreate", (msg) => {
  if (!msg.content.startsWith(config.command) || msg.author.bot) return;

  // skip user if has cooldown
  if (cooldown.has(msg.author.id)) {
    msg.channel.send(config.cooldownMessage);
    return;
  }

  // Add attachments to resources if user is allowed from his id or role
  if (
    msg.attachments.size > 0 &&
    (config.addNewResources.userIDS.includes(msg.author.id) ||
      msg.member.roles.cache.some((role) =>
        config.addNewResources.roleIDS.includes(role.id)
      ))
  ) {
    const filteredAttachements = msg.attachments.filter((attachment) =>
      [".png", ".jpg", ".mov", ".mp4"].some((extension) =>
        attachment.name.toLowerCase().endsWith(extension)
      )
    );

    filteredAttachements.forEach((attachment) => {
      let writeStream = fs.createWriteStream("./resources/" + attachment.name);
      https.get(attachment.url, (r) => {
        r.on("end", () => writeStream.end());

        r.pipe(writeStream);
      });
    });

    files.push(...filteredAttachements.map((attachment) => attachment.name));

    picturesQueue = _.shuffle(
      _.concat(
        picturesQueue,
        filteredAttachements.map((attachment) => attachment.name)
      )
    );

    msg.react("👍");

    return;
  }

  // cooldown user
  cooldown.add(msg.author.id);
  setTimeout(() => {
    cooldown.delete(msg.author.id);
  }, config.cooldownTime);

  let picture = picturesQueue.shift();
  msg.reply({ files: ["./resources/" + picture] });

  if (picturesQueue.length == 0) picturesQueue = _.shuffle(files);
});

client.login(config.token);
