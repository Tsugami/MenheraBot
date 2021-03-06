const { MessageEmbed, MessageAttachment } = require('discord.js');
const Command = require('../../structures/command');
const Canvas = require('../../utils/Canvas');

module.exports = class ShipCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'ship',
      category: 'diversão',
      clientPermissions: ['EMBED_LINKS'],
    });
  }

  async run({ message, args }, t) {
    if (!args[0]) return message.menheraReply('error', t('commands:ship.missing-args'));
    if (!args[1]) return message.menheraReply('error', t('commands:ship.missing-args'));

    let user2;
    let user1;

    try {
      user1 = await this.client.users.fetch(args[0].replace(/[<@!>]/g, ''));
      user2 = await this.client.users.fetch(args[1].replace(/[<@!>]/g, ''));
    } catch {
      return message.menheraReply('error', t('commands:ship.unknow-user'));
    }

    if (!user1) return message.menheraReply('error', t('commands:ship.unknow-user'));
    if (!user2) return message.menheraReply('error', t('commands:ship.unknow-user'));

    const dbUserToTakeValue1 = await this.client.database.Users.findOne({ id: user1.id });
    const dbUserToTakeValue2 = await this.client.database.Users.findOne({ id: user2.id });

    const FinalValue1 = dbUserToTakeValue1?.shipValue ? dbUserToTakeValue1.shipValue : Math.floor(Math.random() * 55);
    const FinalValue2 = dbUserToTakeValue2?.shipValue ? dbUserToTakeValue2.shipValue : Math.floor(Math.random() * 55);

    let value = Number(FinalValue1) + Number(FinalValue2);
    if (Number(value) >= 100) {
      value = 100;
    }

    if (dbUserToTakeValue1?.casado && dbUserToTakeValue1?.casado === user2.id) value = 100;

    const bufferedShipImage = await Canvas.ShipImage(value, user1, user2);

    const attachment = new MessageAttachment(bufferedShipImage, 'ship.png');

    const username1 = user1.username;
    const username2 = user2.username;
    const mix = `${username1.substring(0, username1.length / 2) + username2.substring(username2.length / 2, username2.length)}`.replace(' ', '');

    const embed = new MessageEmbed()
      .attachFiles(attachment)
      .setImage('attachment://ship.png')
      .setTitle(`${username1} + ${username2} = ${mix}`)
      .setDescription(`\n${t('commands:ship.value')} **${value.toString()}%**\n\n${t('commands:ship.default')}`);

    if (Number(value) >= 25) embed.setColor('#cadf2a').setDescription(`\n${t('commands:ship.value')} **${value.toString()}%**\n\n${t('commands:ship.low')}`);
    if (Number(value) >= 50) embed.setColor('#d8937b').setDescription(`\n${t('commands:ship.value')} **${value.toString()}%**\n\n${t('commands:ship.ok')}`);
    if (Number(value) >= 75) embed.setColor('#f34a4a').setDescription(`\n${t('commands:ship.value')} **${value.toString()}%**\n\n${t('commands:ship.medium')}`);
    if (Number(value) >= 99) embed.setColor('#ec2c2c').setDescription(`\n${t('commands:ship.value')} **${value.toString()}%**\n\n${t('commands:ship.high')}`);
    if (Number(value) === 100) embed.setColor('#ff00df').setDescription(`\n${t('commands:ship.value')} **${value.toString()}%**\n\n${t('commands:ship.perfect')}`);

    message.channel.send(`${message.author}\n**${t('commands:ship.message-start')}**`, embed);
  }
};
