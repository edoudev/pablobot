const {
  Events,
  REST,
  Routes,
  SlashCommandBuilder,
} = require("discord.js");
const { clientID, token, command } = require("../config.json");

module.exports = (client) => {
  const slashCommand = new SlashCommandBuilder()
    .setName(command)
    .setDescription("meow meow meow");

  const rest = new REST({ version: "10" }).setToken(token);

  client.once(Events.ClientReady, async (client) => {
    const guild = client.guilds.cache.first();

    await rest.put(Routes.applicationGuildCommands(clientID, guild.id), {
      body: [slashCommand.toJSON()],
    });

    console.log(`Logged in as ${client.user.tag}`);
  });
};
