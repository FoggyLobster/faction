module.exports = {
  name: "ping",
  description: "Ping!",
  async execute(message) {
    message.reply("Pong!");
  },
};
