'use strict';
const bcrypt = require('bcryptjs')

const SEED_USER = {
  name: 'root',
  password: '0000'
}

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.bulkInsert('Users', [{
      name: SEED_USER.name,
      password: bcrypt.hashSync(SEED_USER.password, bcrypt.genSaltSync(10), null),
      isAdmin: 1,
      createdAt: new Date(),
      updatedAt: new Date()
    }], {})
  },

  down: async (queryInterface, Sequelize) => {
    return queryInterface.bulkDelete('Users', null, {})
  }
};
