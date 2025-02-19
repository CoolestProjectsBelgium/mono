'use strict';
const {
  Model
} = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Event extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      Event.hasMany(models.Question);
      Event.hasMany(models.Location);
    }
  }
  Event.init({
    azure_storage_container: DataTypes.STRING(200),
    minAge: DataTypes.INTEGER,
    maxAge: DataTypes.INTEGER,
    minGuardianAge: DataTypes.INTEGER,
    maxRegistration: DataTypes.INTEGER,
    maxVoucher: DataTypes.INTEGER,

    //timestamps for all the dates in the evt
    eventBeginDate: DataTypes.DATE,
    registrationOpenDate: DataTypes.DATE,
    registrationClosedDate: DataTypes.DATE,
    projectClosedDate: DataTypes.DATE,
    officialStartDate: DataTypes.DATE,
    eventEndDate: DataTypes.DATE,

    current: {
      type: new DataTypes.VIRTUAL(DataTypes.BOOLEAN, ['eventBeginDate', 'eventEndDate']),
      get: function() {
        return this.get('eventBeginDate') < Date.now() && this.get('eventEndDate') > Date.now();
      }
    },
    closed: {
      type: new DataTypes.VIRTUAL(DataTypes.BOOLEAN, ['eventBeginDate', 'eventEndDate']),
      get: function() {
        return Date.now() < this.get('eventBeginDate') || Date.now() > this.get('eventEndDate');
      }
    },
    registrationClosed: {
      type: new DataTypes.VIRTUAL(DataTypes.BOOLEAN, ['registrationClosedDate']),
      get: function() {
        return Date.now() > this.get('registrationClosedDate');
      }
    },
    registrationOpen: {
      type: new DataTypes.VIRTUAL(DataTypes.BOOLEAN, ['registrationOpenDate', 'registrationClosedDate']),
      get: function() {
        return this.get('registrationOpenDate') < Date.now()  && this.get('registrationClosedDate') > Date.now();
      }
    },
    projectClosed: {
      type: new DataTypes.VIRTUAL(DataTypes.BOOLEAN, ['projectClosedDate']),
      get: function() {
        return Date.now() > this.get('projectClosedDate');
      }
    },
    event_title: DataTypes.STRING(25),
    maxFileSize: DataTypes.BIGINT(20)
  }, {
    sequelize,
    modelName: 'Event',
  });
  return Event;
};