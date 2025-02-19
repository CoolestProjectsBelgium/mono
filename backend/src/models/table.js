'use strict';
const {
  Model
} = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Table extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */  
    static associate(models) {
      Table.belongsTo(models.Event);
      Table.belongsToMany(models.Project, { through: models.ProjectTable });
    }  
  }
  Table.init({
    name: { type: DataTypes.CHAR(15), unique: true },
    maxPlaces: DataTypes.INTEGER,
    requirements: DataTypes.JSON,
    EventId: DataTypes.INTEGER,
  }, {
    sequelize,
    modelName: 'Table',
  });
  return Table;
};
