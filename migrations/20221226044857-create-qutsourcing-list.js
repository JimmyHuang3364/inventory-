'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('QutsourcingLists', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      partNumberId: {
        type: Sequelize.INTEGER
      },
      subPartnumberId: {
        type: Sequelize.INTEGER
      },
      partnerFactoryId: {
        type: Sequelize.INTEGER
      },
      productionProcessItemId: {
        type: Sequelize.INTEGER
      },
      executionDate: {
        type: Sequelize.DATE
      },
      estimatedReturnDate: {
        type: Sequelize.DATE
      },
      note: {
        type: Sequelize.STRING
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
    await queryInterface.dropTable('QutsourcingLists');
  }
};