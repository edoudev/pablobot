const {
  Client,
  GatewayIntentBits,
} = require("discord.js");
const config = require("./config.json");

const client = new Client({ intents: [GatewayIntentBits.Guilds] });

require("./handlers/ready")(client);
require("./handlers/interaction")(client, config);

client.login(config.token);
