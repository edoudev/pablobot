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

// const files = fs
//   .readdirSync("./resources/")
//   .filter((e) => ['.png','.jpg','.mov','.mp4'].some(extension => e.endsWith(extension)));
const cooldown = new Set();

var pictures = [];
var picturesQueue = [];

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
  msg.reply({ files: [picture] });

  if (picturesQueue.length == 0) picturesQueue = _.shuffle(pictures);
});

files = _.map(fs.readdirSync('./resources'), (file) => './resources/' + file);
pictures = pictures.concat(files);

picturesQueue = _.shuffle(pictures);
client.login(config.token);
