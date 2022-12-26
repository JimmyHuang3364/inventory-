'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class QutsourcingList extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  QutsourcingList.init({
    partNumberId: DataTypes.INTEGER,
    subPartnumberId: DataTypes.INTEGER,
    partnerFactoryId: DataTypes.INTEGER,
    productionProcessItemId: DataTypes.INTEGER,
    executionDate: DataTypes.DATE,
    estimatedReturnDate: DataTypes.DATE,
    note: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'QutsourcingList',
  });
  return QutsourcingList;
};