const { Client, MessageAttachment } = require("discord.js");
const client = new Client();
const config = require("./config.json");
const fs = require("fs");

const files = fs
  .readdirSync("./resources/")
  .filter((e) => e.endsWith(".jpg") || e.endsWith(".png"));
const cooldown = new Set();

let pictures = files;

client.on("ready", () => {
  console.log(`Logged in as ${client.user.tag}!`);
});

client.on("message", (msg) => {
  if (msg.content != config.command) return;

  if (cooldown.has(msg.author.id)) {
    msg.channel.send(config.cooldownMessage);
    return;
  }

  cooldown.add(msg.author.id);
  setTimeout(() => {
    cooldown.delete(msg.author.id);
  }, config.cooldownTime);

  let chosenPic = pictures[Math.floor(Math.random() * pictures.length)];

  pictures = pictures.filter((e) => e !== chosenPic);
  if (pictures.length <= 0) pictures = files;

  let pic = new MessageAttachment("./resources/" + chosenPic);
  msg.channel.send(pic);
});

client.login(config.token);
