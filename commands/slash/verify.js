const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const { bloxlink, getUsernameById } = require("../../utils/bloxlink.js");
const Verification = require("../../database/models/verification.js");
const log = require("../../utils/Logs.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("verify")
    .setDescription("Verify your Roblox account through Bloxlink."),

  async execute(client, interaction) {
    if (!interaction.guild) {
      return interaction.reply({
        content: "You must run this command inside a server.",
        ephemeral: true,
      });
    }

    await interaction.deferReply({ ephemeral: true });

    try {
      const discordId = interaction.user.id;
      const guildId = interaction.guildId;

      const robloxId = await bloxlink(discordId);

      if (robloxId === "not_linked") {
        log.warn(
          `Verification failed: ${discordId} is not linked through Bloxlink.`,
        );

        return interaction.editReply({
          content:
            "You are not linked through Bloxlink. Link your Roblox account first, then run `/verify` again.",
        });
      }

      const robloxUsername = await getUsernameById(robloxId);

      if (!robloxUsername) {
        return interaction.editReply({
          content:
            "I couldn't retrieve your Roblox username. Please try again later.",
        });
      }

      const existingRobloxAccount = await Verification.findOne({
        robloxId: String(robloxId),
        discordId: { $ne: discordId },
      });

      if (existingRobloxAccount) {
        log.warn(
          `Verification blocked: Roblox account ${robloxId} is already registered.`,
        );

        return interaction.editReply({
          content:
            "This Roblox account is already registered to another Discord account. Please contact staff if you believe this is a mistake.",
        });
      }

      const verification = await Verification.findOneAndUpdate(
        { discordId },
        {
          $set: {
            robloxId: String(robloxId),
            robloxUsername,
            guildId,
            verifiedAt: new Date(),
          },
        },
        {
          upsert: true,
          new: true,
          runValidators: true,
          setDefaultsOnInsert: true,
        },
      );

      const embed = new EmbedBuilder()
        .setColor(0x57f287)
        .setTitle("Verification Successful")
        .setDescription("Your Roblox account has been successfully verified.")
        .addFields(
          {
            name: "Roblox Username",
            value: robloxUsername,
            inline: true,
          },
          {
            name: "Roblox ID",
            value: String(robloxId),
            inline: true,
          },
          {
            name: "Discord Account",
            value: `<@${discordId}>`,
            inline: true,
          },
        )
        .setFooter({
          text: "Bloxlink Verification",
        })
        .setTimestamp(verification.verifiedAt);

      log.success(
        `Verified Discord user ${discordId} as Roblox user ${robloxUsername} (${robloxId}).`,
      );

      return interaction.editReply({
        embeds: [embed],
      });
    } catch (error) {
      log.error(`Verification command failed: ${error.stack || error}`);

      if (interaction.deferred || interaction.replied) {
        return interaction.editReply({
          content:
            "An error occurred while verifying your account. Please try again later.",
        });
      }

      return interaction.reply({
        content:
          "An error occurred while verifying your account. Please try again later.",
        ephemeral: true,
      });
    }
  },
};
