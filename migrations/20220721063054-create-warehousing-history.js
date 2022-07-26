'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('WarehousingHistories', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      receiptNumber: {
        type: Sequelize.INTEGER
      },
      quntityOfWarehousing: {
        type: Sequelize.INTEGER
      },
      quntityOfShipping: {
        type: Sequelize.INTEGER
      },
      totalQuntity: {
        type: Sequelize.INTEGER
      },
      note: {
        type: Sequelize.STRING
      },
      customerId: {
        allowNull: false,
        type: Sequelize.INTEGER
      },
      partNumberId: {
        type: Sequelize.INTEGER
      },
      subPartNumberId: {
        type: Sequelize.INTEGER
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
    await queryInterface.dropTable('WarehousingHistories');
  }
};