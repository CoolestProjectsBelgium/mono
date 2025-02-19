'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class TShirtGroup extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      TShirtGroup.belongsTo(models.Event, { as: 'event', optional: false });
      TShirtGroup.hasMany(models.TShirtGroupTranslation);
      TShirtGroup.hasOne(models.TShirt, { as: 'group' });
    }
  }
  TShirtGroup.init({
    name: { type: DataTypes.CHAR(15) },
    EventId: DataTypes.INTEGER,
  }, {
    sequelize,
    modelName: 'TShirtGroup',
    indexes: [{ unique: true, fields: ['name', 'eventId'] }]
  });
  return TShirtGroup;
};