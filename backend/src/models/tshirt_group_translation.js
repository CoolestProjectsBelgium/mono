'use strict';
const {
  Model
} = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class TShirtGroupTranslation extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) { }
  }
  TShirtGroupTranslation.init({
    language: DataTypes.ENUM('nl', 'fr', 'en'),
    description: { type: DataTypes.CHAR(250) },
    EventId: DataTypes.INTEGER,
  }, {
    sequelize,
    modelName: 'TShirtGroupTranslation',
    indexes: [{ unique: true, fields: ['tShirtGroupId', 'language'] }]
  });
  return TShirtGroupTranslation;
};