'use strict';
const {
  Model
} = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Location extends Model {
    static associate(models) {
      Location.belongsTo(models.Event, {});
      Location.hasMany(models.Table);
    }
  }
  Location.init({
    text: {
      type: DataTypes.STRING,
    },
  }, {
    sequelize,
    modelName: 'Location',
  });
  return Location;
};