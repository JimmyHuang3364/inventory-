'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Customer extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Customer.hasMany(models.PartNumber)
      Customer.hasMany(models.SubPartNumber)
      Customer.hasMany(models.WarehousingHistory)
    }
  };
  Customer.init({
    name: DataTypes.STRING,
    address: DataTypes.STRING,
    tel: DataTypes.STRING,
    fax: DataTypes.STRING,
    photo: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'Customer',
  });
  return Customer;
};