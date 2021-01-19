const { MessageAttachment } = require('discord.js');
const Command = require('../../structures/command');
const { FiloBuilder } = require('../../utils/Canvas');

module.exports = class TestCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'test',
      description: 'Arquivo destinado para testes',
      devsOnly: true,
      category: 'Dev',
    });
  }

  async run({ message, args }) {
    const image = await FiloBuilder(args.join(' '));

    message.channel.send(message.author, new MessageAttachment(image, 'filosófico.png'));
  }
};
