'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Outsourcinglist extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Outsourcinglist.belongsTo(models.PartNumber)
      Outsourcinglist.belongsTo(models.SubPartNumber)
      Outsourcinglist.belongsTo(models.PartnerFactories)
      Outsourcinglist.belongsTo(models.ProductionProcessItem)
    }
  }
  Outsourcinglist.init({
    partNumberId: DataTypes.INTEGER,
    subPartNumberId: DataTypes.INTEGER,
    partnerFactoryId: DataTypes.INTEGER,
    productionProcessItemId: DataTypes.INTEGER,
    quantity: DataTypes.INTEGER,
    actionDate: DataTypes.DATE,
    estimatedReturnDate: DataTypes.DATE
  }, {
    sequelize,
    modelName: 'Outsourcinglist',
  });
  return Outsourcinglist;
};