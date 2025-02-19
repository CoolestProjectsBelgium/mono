'use strict';
const {
  Model
} = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Hyperlink extends Model {
    static associate(models) {
      Hyperlink.belongsTo(models.Attachment,  {limit: 100, order: [[ 'AttachmentId', 'DESC' ]] }
      );
    }
  }
  Hyperlink.init({
    EventId: DataTypes.INTEGER,
    href: {
      type: DataTypes.STRING(250),
      unique: true
    }
  }, {
    sequelize,
    modelName: 'Hyperlink',
  });
  return Hyperlink;
};