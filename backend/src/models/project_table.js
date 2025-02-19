'use strict';
const {
  Model
} = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class ProjectTable extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      ProjectTable.belongsTo(models.Project, { as: 'project', optional: false }); 
      ProjectTable.belongsTo(models.Table, { as: 'table', optional: true });
      ProjectTable.belongsTo(models.Event, { as: 'event', optional: false });
    }
  }
  ProjectTable.init({
    id:{
      type:DataTypes.INTEGER,
      autoincrement:true,
      primaryKey:true
    },
    usedPlaces: DataTypes.INTEGER,
    /*projectId: DataTypes.INTEGER,
    tableId: DataTypes.INTEGER,*/
    startTime: DataTypes.DATE,
    endTime: DataTypes.DATE,
    //eventId: DataTypes.INTEGER,
  }, {
    sequelize,
    modelName: 'ProjectTable'
    //indexes: [{ fields: [ 'eventId','tableId','projectId']    }]
  });

  return ProjectTable;
};