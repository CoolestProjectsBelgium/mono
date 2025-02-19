'use strict';
const {
  Model
} = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Question extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      Question.belongsTo(models.Event);
      Question.belongsToMany(models.User, { through: models.QuestionUser, as: 'users' });
      Question.belongsToMany(models.Registration, { through: models.QuestionRegistration, as: 'registration' });
      Question.hasMany(models.QuestionTranslation);
    }
  }
  Question.init({
    name: { type: DataTypes.CHAR(30)},
    mandatory: DataTypes.BOOLEAN,
  }, {
    sequelize,
    modelName: 'Question',
    indexes: [{ unique: true, fields: ['eventId', 'name'] }]
  });
  return Question;
};