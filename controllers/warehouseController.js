const warehouseService = require('../services/warehouseService.js')

const warehouseController = {
  getParNumbers: (req, res) => {
    warehouseService.getParNumbers(req, res, (data) => {
      return res.render('warehouse', data)
    })
  },

  getWarehousing: (req, res) => {
    return res.render('warehousing')
  },

  getShipping: (req, res) => {
    return res.render('shipping')
  }
}

module.exports = warehouseController