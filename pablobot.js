const { Client, GatewayIntentBits, MessageAttachment } = require("discord.js");
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

  if (cooldown.has(msg.author.id)) {
    msg.channel.send(config.cooldownMessage);
    return;
  }

  cooldown.add(msg.author.id);
  setTimeout(() => {
    cooldown.delete(msg.author.id);
  }, config.cooldownTime);

  let picture = picturesQueue.shift();
  msg.reply({ files: ["./resources/" + picture] });

  if (picturesQueue.length == 0) picturesQueue = _.shuffle(files);
});

client.login(config.token);
