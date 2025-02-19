'use strict';
const {
  Model
} = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Award extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      Award.belongsTo(models.Event, { optional: false });
      Award.belongsTo(models.Project, { optional: false });
      Award.belongsTo(models.VoteCategory, { optional: false });
      Award.belongsTo(models.Account, { as: 'juror', optional: true})
    }
  }
  Award.init({
  }, {
    sequelize,
    modelName: 'Award',
  });
  return Award;
};