const {
  Client,
  Events,
  GatewayIntentBits,
  SlashCommandBuilder,
} = require("discord.js");

const { REST, Routes } = require("discord.js");
const handleDownloadCommand = require("./scripts/handleDonwloadCommand");

const config = require("./config.json");

// Client
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

// Handle interactions
client.on(Events.InteractionCreate, async (interaction) => {
  if (!interaction.isCommand()) return;

  const { commandName } = interaction;

  if (commandName === "download") {
    handleDownloadCommand(
      interaction,
      client.channels.cache.get(
        config.discord.clipsChannelsIds[interaction.guild.id]
      )
    );
  }
});

// Show a message when the client is ready
client.once(Events.ClientReady, (readyClient) => {
  console.log(`Ready! Logged in as ${readyClient.user.tag}`);
});

const rest = new REST().setToken(config.discord.token);

// Reload application slash commands
(async () => {
  try {
    console.log("Started refreshing application (/) commands.");

    // Commands declaration
    const commands = [
      new SlashCommandBuilder()
        .setName("download")
        .setDescription("Baixa um clip do youtube")
        .addStringOption((option) =>
          option
            .setName("url")
            .setDescription("O URL do clip do youtube")
            .setRequired(true)
        )
        .toJSON(),
    ];

    // Request to reload commands
    const requests = config.discord.guildsIds.map((guildId) => {
      return rest.put(
        Routes.applicationGuildCommands(config.discord.appId, guildId),
        {
          body: commands,
        }
      );
    });

    await Promise.all(requests);

    console.log("Successfully reloaded application (/) commands.");
  } catch (error) {
    console.error(error);
  }
})();

// Login to discord
client.login(config.discord.token);
