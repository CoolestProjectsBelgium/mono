'use strict';
const {
  Model
} = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Message extends Model {

    static associate(models) {
      Message.belongsTo(models.Event, { as: 'event', optional: false });
    }
  }
  Message.init({
    message: {
      type: DataTypes.STRING(255),
    },
    startAt: {
      type: DataTypes.DATE,
    },
    endAt: {
      type: DataTypes.DATE,
    }
  }, {
    sequelize,
    modelName: 'Message',
    timestamps: false,
  });
  return Message;
};