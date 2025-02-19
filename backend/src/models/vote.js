'use strict';
const {
  Model
} = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Vote extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      Vote.belongsTo(models.Event, { as: 'event', optional: false });
      Vote.belongsTo(models.VoteCategory, { as: 'category', optional: false });
      Vote.belongsTo(models.Project, { as: 'project', optional: false });
      Vote.belongsTo(models.Account, { as: 'account' });
    }
  }
  Vote.init({
    amount: { type: DataTypes.INTEGER }
  }, {
    sequelize,
    modelName: 'Vote',
  });
  return Vote;
};