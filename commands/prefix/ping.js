module.exports = {
  name: "ping",
  description: "Ping!",
  async execute(message) {
    message.channel.reply("Pong!");
  },
};