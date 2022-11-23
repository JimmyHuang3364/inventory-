'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class SubPartNumbers_ProductionProcesses extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      SubPartNumbers_ProductionProcesses.belongsTo(models.ProductionProcessItem)
      SubPartNumbers_ProductionProcesses.belongsTo(models.PartNumber)
    }
  };
  SubPartNumbers_ProductionProcesses.init({
    subPartNumberId: DataTypes.INTEGER,
    productionProcessId: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'SubPartNumbers_ProductionProcesses',
  });
  return SubPartNumbers_ProductionProcesses;
};