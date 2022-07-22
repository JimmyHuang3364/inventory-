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
    }
  };
  WarehousingHistory.init({
    name: DataTypes.STRING,
    quntityOfWarehousing: DataTypes.INTEGER,
    quntityOfShipping: DataTypes.INTEGER,
    totalQuntity: DataTypes.INTEGER,
    note: DataTypes.STRING,
    customerId: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'WarehousingHistory',
  });
  return WarehousingHistory;
};