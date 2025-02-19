'use strict';
const {
  Model
} = require('sequelize');

const bcrypt = require('bcrypt');

module.exports = (sequelize, DataTypes) => {
  class Account extends Model {

    verifyPassword(password) {
      //console.log(bcrypt.compareSync(password, this.password));
      return bcrypt.compareSync(password, this.password);
    }

    static associate(models) {
      // define association here
    }
  }
  Account.init({
    email: {
      type: DataTypes.STRING(100),
      unique: true
    },
    password: {
      type: DataTypes.STRING,
      get() {
        return this.getDataValue('password');
      },
      set(password) {
        const salt = bcrypt.genSaltSync();
        const pwd = bcrypt.hashSync(password, salt);
        this.setDataValue('password', pwd);
      }
    },
    account_type: DataTypes.ENUM('super_admin', 'admin', 'jury')
  }, {
    sequelize,
    modelName: 'Account',
  });
  return Account;
};