'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('SubPartNumbers_ProductionProcesses', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      subPartNumberId: {
        allowNull: false,
        type: Sequelize.INTEGER
      },
      productionProcessId: {
        allowNull: false,
        type: Sequelize.INTEGER
      },
      engineeringSequence: {
        type: Sequelize.INTEGER,
        defaultValue: 99
      },
      semiFinishedProductQuantity: {
        type: Sequelize.INTEGER,
        defaultValue: 0
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
  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('SubPartNumbers_ProductionProcesses');
  }
};