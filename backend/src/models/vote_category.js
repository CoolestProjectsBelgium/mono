'use strict';
const {
  Model
} = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class VoteCategory extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      VoteCategory.belongsTo(models.Event, { as: 'event', optional: false, require: true, allowNull: false });
    }
  }
  VoteCategory.init({
    name: { type: DataTypes.CHAR(50), optional: false, require: true, allowNull: false },
    min: { type: DataTypes.INTEGER, optional: false, require: true, allowNull: false },
    max: { type: DataTypes.INTEGER, optional: false, require: true, allowNull: false },
    public: { type: DataTypes.BOOLEAN },
    optional: { type: DataTypes.BOOLEAN },
  }, {
    sequelize,
    modelName: 'VoteCategory',
    indexes: [{ unique: true, fields: ['eventId', 'name'] }]
  });
  return VoteCategory;
};