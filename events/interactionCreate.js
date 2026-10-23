module.exports = {
  name: "interactionCreate",

  async execute(client, interaction) {
    try {
      if (interaction.isChatInputCommand()) {
        const cmd = client.slashCommands.get(interaction.commandName);
        if (cmd) await cmd.execute(client, interaction);
      }

      if (interaction.isButton()) {
        const btn = client.buttons.get(interaction.customId);
        if (btn) await btn.execute(client, interaction);
      }

      if (interaction.isStringSelectMenu()) {
        console.log("MENU CLICK:", interaction.customId, interaction.values);

        const menu = client.menus.get(interaction.customId);

        if (menu) {
          await menu.execute(client, interaction);
        }
      }

      if (interaction.isModalSubmit()) {
        const modal = client.modals.get(interaction.customId);
        if (modal) await modal.execute(client, interaction);
      }
    } catch (err) {
      console.error(err);

      if (!interaction.replied && !interaction.deferred) {
        await interaction.reply({
          content: "Error occurred.",
          flags: 64,
        });
      }
    }
  },
};
