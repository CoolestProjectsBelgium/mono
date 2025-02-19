'use strict';
module.exports = (sequelize, DataTypes) => {
  const Videoload = sequelize.define('userprojectvideo', {
 
    project_descr: {
      type: DataTypes.STRING,
    },
    Youtube: {
      type: DataTypes.STRING
    },
    EventID: {
      type: DataTypes.STRING
    },
    ProjectID: {
      type: DataTypes.STRING,
      primaryKey: true
    },
    participants: {
      type: DataTypes.STRING
    },
    Length: {
      type: DataTypes.STRING
    },
    Language: {
      type: DataTypes.STRING,
    },
    Project_name: {
      type: DataTypes.STRING,
    },


  }, {
    freezeTableName: true,
    timestamps: false
  });
  // disable creation
  Videoload.sync = () => {};
  return Videoload;
};