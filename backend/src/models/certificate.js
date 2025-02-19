'use strict';
const {
  Model
} = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Certificate extends Model {
    static associate(models) {
      Certificate.belongsTo(models.Project, { optional: false});
      Certificate.belongsTo(models.Event, { optional: false });
    }
  }
  Certificate.init({
    text: {type: DataTypes.STRING(4000), },
    
  }, {
    sequelize,
    modelName: 'Certificate',
  });
  return Certificate;
};