'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Outsourcinglists', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      partNumberId: {
        type: Sequelize.INTEGER
      },
      subPartNumberId: {
        type: Sequelize.INTEGER
      },
      partnerFactoryId: {
        allowNull: false,
        type: Sequelize.INTEGER
      },
      productionProcessItemId: {
        allowNull: false,
        type: Sequelize.INTEGER
      },
      quantity: {
        allowNull: false,
        type: Sequelize.INTEGER
      },
      actionDate: {
        allowNull: false,
        type: Sequelize.DATE
      },
      estimatedReturnDate: {
        type: Sequelize.DATE
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('Outsourcinglists');
  }
};