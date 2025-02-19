'use strict';
const {
  Model
} = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Registration extends Model {
    static associate(models) {
      Registration.belongsTo(models.TShirt, { as: 'size', optional: false });
      Registration.belongsTo(models.Event, { as: 'event', optional: false });
      Registration.hasMany(models.QuestionRegistration, { as: 'questions' });
    }
  }
  Registration.init({
    language: {
      type: DataTypes.ENUM('nl', 'fr', 'en'),
      allowNull: false,
      validate: {
        isIn: [['nl', 'fr', 'en']]
      }
    },
    email: {
      type: DataTypes.STRING(254),
      validate: {
        isEmail: true
      },
      defaultValue: null
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
    via: DataTypes.STRING,
    medical: {
      type: DataTypes.STRING(255),
      defaultValue: null
    },
    project_code: {
      type: DataTypes.UUID,
      defaultValue: null
    },
    waiting_list: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    internalinfo: {
      type: DataTypes.STRING(2000),
      allowNull: true
    },
    project_name: {
      type: DataTypes.STRING(100),
      defaultValue: null
    },
    project_descr: {
      type: DataTypes.STRING(4000),
      defaultValue: null
    },
    project_type: {
      type: DataTypes.STRING(100),
      defaultValue: null
    },
    project_lang: {
      type: DataTypes.ENUM('nl', 'fr', 'en'),
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
    email_guardian: {
      type: DataTypes.STRING(254),
      isEmail: true,
      defaultValue: null,
    },
    // address info
    postalcode: {
      type: DataTypes.INTEGER,
      /*validate: {
        min: 1000,
        max: 9999,
      },*/
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
    max_tokens: {
      type: DataTypes.INTEGER,
      allowNull: true
    }
  }, {
    sequelize,
    modelName: 'Registration',
    indexes: [{ unique: true, fields: ['email', 'eventId'] }]
  });
  return Registration;
};