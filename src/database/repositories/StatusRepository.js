module.exports = class StatusRepository {
  constructor(statusModal) {
    this.statusModal = statusModal;
  }

  async CreateOrUpdate(shardID, ping, lastPingAt, guilds, uptime) {
    const result = await this.statusModal.findById(shardID);
    if (result) {
      this.statusModal.updateOneById({ _id: shardID }, {
        $set: {
          ping, lastPingAt, guilds, uptime,
        },
      });
    } else {
      this.statusModal.create({
        _id: shardID, ping, lastPingAt, guilds, uptime,
      });
    }
  }

  addMaintenance(commandName) {
    this.statusModal.updateOne({ _id: 'main' }, { $push: { disabledCommands: commandName } });
  }

  removeMaintenance(commandName) {
    this.statusModal.updateOne({ _id: 'main' }, { $pull: { disabledCommands: commandName } });
  }
};
