'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class SubPartNumber extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      SubPartNumber.belongsTo(models.PartNumber)
      SubPartNumber.belongsTo(models.Customer)
      SubPartNumber.hasMany(models.WarehousingHistory)
      SubPartNumber.hasMany(models.Outsourcinglist)
    }
  };
  SubPartNumber.init({
    customerId: DataTypes.INTEGER,
    commonName: DataTypes.STRING,
    name: DataTypes.STRING,
    partNumberId: DataTypes.INTEGER,
    quantity: DataTypes.INTEGER,
    safetyStockQuantity: DataTypes.INTEGER,
    usagePerUnit: DataTypes.INTEGER,
    unitPrice: DataTypes.STRING,
  }, {
    sequelize,
    modelName: 'SubPartNumber',
  });
  return SubPartNumber;
};