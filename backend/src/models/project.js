'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Project extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */    
    static associate(models) {
      Project.belongsTo(models.User, { as: 'owner' });
      Project.belongsToMany(models.User, {
        as: 'participant',
        through: {
          model: models.Voucher,
          unique: false
        },
        foreignKey: 'projectId',
        otherKey: 'participantId',
        constraints: false
      });
      Project.hasMany(models.Voucher, { foreignKey: 'projectId' });
      Project.belongsTo(models.Event, { as: 'event', optional: false });
      Project.belongsToMany(models.Table, { through: models.ProjectTable });
      Project.hasMany(models.Attachment, {});
    }
  }
  Project.init({
    project_name: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    project_descr: {
      type: DataTypes.STRING(4000),
      allowNull: false
    },
    project_type: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    internalinfo: {
      type: DataTypes.STRING(2000),
      allowNull: true
    },
    project_lang: {
      type: DataTypes.ENUM('nl', 'fr', 'en'),
      validate: {
        isIn: [['nl', 'fr', 'en']]
      }
    },
    max_tokens: {
      type: DataTypes.INTEGER,
      allowNull: true
    }
  }, {
    sequelize,
    modelName: 'Project',
  });
  return Project;
};
