'use strict';
module.exports = (sequelize, DataTypes) => {
  const projectusersemail= sequelize.define('showprojectusersemail', {
 
    ProjectID: {
      type: DataTypes.STRING,
      primaryKey: true
    },

    email: {
      type: DataTypes.STRING
    },

    participants: {
      type: DataTypes.STRING
    },

    Project_Name: {
      type: DataTypes.STRING,
    },

    project_descr: {
      type: DataTypes.STRING,
    },

    Language: {
      type: DataTypes.STRING,
    },

    eventId: {
      type: DataTypes.STRING
    },

  }, {
    freezeTableName: true,
    timestamps: false
  });
  // disable creation
  projectusersemail.sync = () => {};
  return projectusersemail;
};