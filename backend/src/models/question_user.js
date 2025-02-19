'use strict';
const {
  Model
} = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class QuestionUser extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      QuestionUser.belongsTo(models.Question, { optional: false });
      QuestionUser.belongsTo(models.User, { optional: false });
      QuestionUser.belongsTo(models.Event, { optional: false });
    }
  }
  QuestionUser.init({
  }, {
    sequelize,
    modelName: 'QuestionUser'
  });
  return QuestionUser;
};