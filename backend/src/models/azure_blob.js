'use strict';
const {
  Model
} = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class AzureBlob extends Model {
    static associate(models) {
      AzureBlob.belongsTo(models.Attachment, {});
    }
  }
  AzureBlob.init({
    container_name: {
      type: DataTypes.STRING(100)
    },
    blob_name: {
      type: DataTypes.STRING(100)
    },
    size: DataTypes.BIGINT(20),
    EventId: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'AzureBlob',
    indexes: [
      {
        unique: true,
        fields: ['container_name', 'blob_name']
      }
    ]
  });
  return AzureBlob;
};