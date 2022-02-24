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
    }
  };
  SubPartNumber.init({
    name: DataTypes.STRING,
    commonName: DataTypes.STRING,
    quantity: DataTypes.INTEGER,
    safetyStockQuantity: DataTypes.INTEGER,
    partNumberId: DataTypes.INTEGER,
    customerId: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'SubPartNumber',
  });
  return SubPartNumber;
};