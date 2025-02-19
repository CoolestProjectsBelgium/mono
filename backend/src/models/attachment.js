'use strict';
const {
  Model
} = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Attachment extends Model {

    static associate(models) {
      Attachment.belongsTo(models.Project, {});
      Attachment.hasOne(models.AzureBlob, {});
      Attachment.hasOne(models.Hyperlink, {});
      Attachment.belongsTo(models.Event, { as: 'Event', optional: false });
    }
  }
  Attachment.init({
    confirmed: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    internal: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    filename: DataTypes.STRING(255),
    name: DataTypes.STRING(50)
  }, {
    sequelize,
    modelName: 'Attachment',
    onDelete: 'CASCADE'
  });
  return Attachment;
};