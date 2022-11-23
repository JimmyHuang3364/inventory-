'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class PartNumbers_ProductionProcesses extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      PartNumbers_ProductionProcesses.belongsTo(models.ProductionProcessItem)
      PartNumbers_ProductionProcesses.belongsTo(models.PartNumber)
    }
  };
  PartNumbers_ProductionProcesses.init({
    partNumberId: DataTypes.INTEGER,
    productionProcessId: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'PartNumbers_ProductionProcesses',
  });
  return PartNumbers_ProductionProcesses;
};