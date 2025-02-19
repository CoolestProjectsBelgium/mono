'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class TShirt extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      TShirt.belongsTo(models.Event, { as: 'event', optional: false });
      TShirt.belongsTo(models.TShirtGroup, { as: 'group', optional: false });
      TShirt.hasMany(models.TShirtTranslation);
    }
  }
  TShirt.init({
    name: { type: DataTypes.CHAR(15) }
  }, {
    sequelize,
    modelName: 'TShirt',
    indexes: [{ unique: true, fields: ['name', 'eventId'] }]
  });
  return TShirt;
};