'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('SubPartNumbers', 'usagePerUnit', {
      type: Sequelize.INTEGER,
      allowNull: false,
      defaultValue: 0
    });

    await queryInterface.addColumn('SubPartNumbers', 'unitPrice', {
      type: Sequelize.STRING,
      allowNull: false,
      defaultValue: 0
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('SubPartNumbers', 'usagePerUnit');
    await queryInterface.removeColumn('SubPartNumbers', 'unitPrice');
  }
};
