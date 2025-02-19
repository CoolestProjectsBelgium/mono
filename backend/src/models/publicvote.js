'use strict';
const {
  Model
} = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class PublicVote extends Model {
    /*
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      PublicVote.belongsTo(models.Project, { as: 'project', optional: false, require: true, allowNull: false });
      PublicVote.belongsTo(models.Event, { as: 'event', optional: false });
    }
  }
  PublicVote.init({
    phone: { type: DataTypes.CHAR(100), allowNull: false, require: true }
  }, {
    sequelize,
    modelName: 'PublicVote',
    indexes: [{ unique: true, fields: ['projectId', 'phone'] }]
  });
  return PublicVote;
};