const db = require('../models')
const User = db.User
const Customer = db.Customer
const Product = db.Product

const inventoryController = {
  getInventory: (req, res) => {
    return res.render('inventory')
  }
}

module.exports = inventoryController