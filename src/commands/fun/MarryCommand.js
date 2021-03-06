const moment = require('moment');
const Command = require('../../structures/command');

module.exports = class MarryCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'marry',
      aliases: ['casar'],
      category: 'diversão',
      clientPermission: ['EMBED_LINKS', 'ADD_REACTIONS', 'MANAGE_MESSAGES'],
    });
  }

  async run({ message, authorData: selfData }, t) {
    const authorData = selfData ?? new this.client.database.Users({ id: message.author.id });

    const mencionado = message.mentions.users.first();

    if (!mencionado) return message.menheraReply('error', t('commands:marry.no-mention'));
    if (mencionado.bot) return message.menheraReply('error', t('commands:marry.bot'));
    if (mencionado.id === message.author.id) return message.menheraReply('error', t('commands:marry.self-mention'));

    if (authorData.casado && authorData.casado !== 'false') return message.menheraReply('error', t('commands:marry.married'));

    const user2 = await this.client.database.Users.findOne({ id: mencionado.id });

    if (!user2) return message.menheraReply('warm', t('commands:marry.no-dbuser'));

    if (user2.casado && user2.casado !== 'false') return message.menheraReply('error', t('commands:marry.mention-married'));

    message.channel.send(`${mencionado} ${t('commands:marry.confirmation_start')} ${message.author}? ${t('commands:marry.confirmation_end')}`).then((msg) => {
      msg.react('✅');
      msg.react('❌');

      const filterYes = (reaction, usuario) => reaction.emoji.name === '✅' && usuario.id === mencionado.id;
      const filterNo = (reação, user) => reação.emoji.name === '❌' && user.id === mencionado.id;

      const yesColetor = msg.createReactionCollector(filterYes, { max: 1, time: 14500 });
      const noColetor = msg.createReactionCollector(filterNo, { max: 1, time: 14500 });

      noColetor.on('collect', async () => {
        await msg.reactions.removeAll().catch();
        return message.channel.send(`${mencionado} ${t('commands:marry.negated')} ${message.author}`);
      });

      yesColetor.on('collect', async () => {
        await msg.reactions.removeAll().catch();
        message.channel.send(`💍${message.author} ${t('commands:marry.acepted')} ${mencionado}💍`);

        moment.locale('pt-br');

        const dataFormated = moment(Date.now()).format('l LTS');

        authorData.casado = mencionado.id;
        authorData.data = dataFormated;

        user2.casado = message.author.id;
        user2.data = dataFormated;

        await authorData.save();
        await user2.save();
      });
    });
  }
};
