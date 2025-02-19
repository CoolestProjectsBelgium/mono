'use strict';
module.exports = (sequelize, DataTypes) => {
  const AttachmentLoaded = sequelize.define('ShowAttachmentLoaded', {

    ProjectId: {
      type: DataTypes.STRING,
      primaryKey: true
    },
    ownerId: {
      type: DataTypes.STRING
    },
    FileName: {
      type: DataTypes.STRING
    },
    firstname: {
      type: DataTypes.STRING
    },
    lastname: {
      type: DataTypes.STRING
    },
    VideoName: {
      type: DataTypes.STRING
    },
    EventId: {
      type: DataTypes.STRING
    },
    project_name: {
      type: DataTypes.STRING,
    },
    
  }, {
    freezeTableName: true,
    timestamps: false
  });
  return AttachmentLoaded ;
};