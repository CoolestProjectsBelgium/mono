'use strict';
const {
  Model
} = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Sessions extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
    }
  }
  Sessions.init({
    sid: {
      type: DataTypes.STRING,
      primaryKey: true
    },
    expires: {
      type: DataTypes.DATE
    },
    data: {
      type: DataTypes.STRING
    }
  }, {
    sequelize,
    modelName: 'Sessions', // we need plural in this case (Sessions is handled by AdminBro)
    freezeTableName: true,
    timestamps: true // https://sequelize.org/master/manual/model-basics.html#timestamps 
    // By default, Sequelize automatically adds the fields createdAt and updatedAt to every model, using the data type DataTypes.DATE
  });
  return Sessions;
};