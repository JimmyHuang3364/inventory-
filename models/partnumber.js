'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class PartNumber extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      PartNumber.belongsTo(models.Customer)
      PartNumber.hasMany(models.SubPartNumber)
      PartNumber.hasMany(models.WarehousingHistory)
    }
  };
  PartNumber.init({
    commonName: DataTypes.STRING,
    customerId: DataTypes.INTEGER,
    name: DataTypes.STRING,
    quantity: DataTypes.INTEGER,
    safetyStockQuantity: DataTypes.INTEGER,
    unitPrice: DataTypes.STRING,
  }, {
    sequelize,
    modelName: 'PartNumber',
  });
  return PartNumber;
};