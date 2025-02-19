'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      User.hasOne(models.Project, { as: 'project', foreignKey: 'ownerId' });
      User.belongsToMany(models.Project, {
        as: 'participant',
        through: {
          model: models.Voucher,
          unique: false
        },
        foreignKey: 'participantId',
        otherKey: 'projectId'
      });
      User.belongsTo(models.TShirt, { as: 'size', optional: false });
      User.belongsTo(models.Event, { as: 'event', optional: false });
      User.hasMany(models.QuestionUser, { as: 'questions_user' });
      User.belongsToMany(models.Question, {
        as: 'questions',
        through: {
          model: models.QuestionUser,
          unique: false
        },
        foreignKey: 'UserId',
        otherKey: 'QuestionId'
      });
    }
  }
  User.init({
    language: {
      type: DataTypes.ENUM('nl', 'fr', 'en'),
      allowNull: false,
      validate: { isIn: [['nl', 'fr', 'en']] }
    },
    postalcode: {
      type: DataTypes.INTEGER,
      validate: { min: 1000, max: 9999, },
      allowNull: true
    },
    municipality_name: {
      type: DataTypes.STRING(30)
    },
    street: {
      type: DataTypes.STRING(100)
    },
    house_number: {
      type: DataTypes.STRING(20)
    },
    box_number: {
      type: DataTypes.STRING(20)
    },
    email: {
      type: DataTypes.STRING(254),
      validate: { isEmail: true },
      allowNull: false
    },
    firstname: {
      type: DataTypes.STRING,
      allowNull: false
    },
    lastname: {
      type: DataTypes.STRING,
      allowNull: false
    },
    sex: {
      type: DataTypes.ENUM('m', 'f', 'x'),
      allowNull: false,
      validate: {
        isIn: [['m', 'f', 'x']]
      }
    },
    birthmonth: {
      allowNull: false,
      type: DataTypes.DATEONLY
    },
    last_token: {
      allowNull: true,
      type: DataTypes.DATE
    },
    via: { 
      type: DataTypes.STRING(255)
    },
    medical: {
      type: DataTypes.STRING(255),
      defaultValue: null
    },
    gsm: {
      type: DataTypes.STRING(13),
      defaultValue: null
    },
    gsm_guardian: {
      type: DataTypes.STRING(13),
      defaultValue: null
    },
    internalinfo: {
      type: DataTypes.STRING(2000),
      defaultValue: null,
    },
    email_guardian: {
      type: DataTypes.STRING(254),
      isEmail: true,
      defaultValue: null,
    }
  }, {
    sequelize,
    modelName: 'User',
    indexes: [{ unique: true, fields: ['email', 'eventId'] }]
  });
  return User;
};
