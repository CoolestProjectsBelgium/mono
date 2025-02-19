'use strict';
const {
  Model
} = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class QuestionTranslation extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) { }
  }
  QuestionTranslation.init({
    language: DataTypes.ENUM('nl', 'fr', 'en'),
    description: { type: DataTypes.CHAR(255) },
    positive: { type: DataTypes.CHAR(120) },
    negative: { type: DataTypes.CHAR(120) },
    EventId: DataTypes.INTEGER,
  }, {
    sequelize,
    modelName: 'QuestionTranslation',
    indexes: [{ unique: true, fields: ['questionId', 'language'] }]
  });
  return QuestionTranslation;
};