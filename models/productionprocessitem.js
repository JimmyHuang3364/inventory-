'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class ProductionProcessItem extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      ProductionProcessItem.hasMany(models.PartNumbers_ProductionProcesses)
      ProductionProcessItem.hasMany(models.SubPartNumbers_ProductionProcesses)
    }
  };
  ProductionProcessItem.init({
    processName: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'ProductionProcessItem',
  });
  return ProductionProcessItem;
};