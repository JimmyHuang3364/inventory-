const warehouseService = require('../../services/warehouseService.js')

const warehouseController = {
  getParNumbers: (req, res) => {
    warehouseService.getParNumbers(req, res, (data) => {
      return res.json(data)
    })
  },
}

module.exports = warehouseController