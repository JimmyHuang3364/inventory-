'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class PartnerFactories extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      PartnerFactories.hasMany(models.Outsourcinglist)
    }
  }
  PartnerFactories.init({
    name: DataTypes.STRING,
    address: DataTypes.STRING,
    tel: DataTypes.STRING,
    fax: DataTypes.STRING,
    photoLink: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'PartnerFactories',
  });
  return PartnerFactories;
};