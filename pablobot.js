const { Client, MessageAttachment } = require("discord.js");
const client = new Client();
const config = require("./config.json");
const fs = require("fs");
const pictures = fs.readdirSync("./resources/");
const cooldown = new Set();

var lastPictures = [];

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

  while (lastPictures.includes(chosenPic)) {
    chosenPic = pictures[Math.floor(Math.random() * pictures.length)];
  }

  if (lastPictures.length >= 5) lastPictures.shift();
  lastPictures.push(chosenPic);

  let pic = new MessageAttachment("./resources/" + chosenPic);
  msg.channel.send(pic);
});

client.login(config.token);
