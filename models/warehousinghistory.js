'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class WarehousingHistory extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      WarehousingHistory.belongsTo(models.Customer)
      WarehousingHistory.belongsTo(models.PartNumber)
      WarehousingHistory.belongsTo(models.SubPartNumber)
    }
  };
  WarehousingHistory.init({
    receiptNumber: DataTypes.INTEGER,
    quntityOfWarehousing: DataTypes.INTEGER,
    quntityOfShipping: DataTypes.INTEGER,
    totalQuntity: DataTypes.INTEGER,
    note: DataTypes.STRING,
    customerId: DataTypes.INTEGER,
    partNumberId: DataTypes.INTEGER,
    subPartNumberId: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'WarehousingHistory',
  });
  return WarehousingHistory;
};