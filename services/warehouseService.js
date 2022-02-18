const db = require('../models')
const Customer = db.Customer
const PartNumber = db.PartNumber
const SubPartNumber = db.SubPartNumber

const warehouseService = {
  getParNumbers: (req, res, callback) => {
    if (!req.query.customerId) {
      return PartNumber.findAll({
        include: [SubPartNumber]
      })
        .then((result) => {
          const partNumbers = result.map(r => ({
            ...r.dataValues,
            subPartNumbers: r.SubPartNumbers.map(sub => ({ ...sub.dataValues }))
          }))
          Customer.findAll({
            raw: true,
            nest: true
          }).then((customers) => {
            callback({ partNumbers: partNumbers, customers: customers })
          })
        })
    }

    if (req.query.customerId) {
      return PartNumber.findAll({
        where: { customerId: Number(req.query.customerId) },
        include: [SubPartNumber]
      })
        .then((result) => {
          const partNumbers = result.map(r => ({
            ...r.dataValues,
            subPartNumbers: r.SubPartNumbers.map(sub => ({ ...sub.dataValues }))
          }))
          Customer.findAll({
            raw: true,
            nest: true
          }).then((customers) => {
            callback({ partNumbers: partNumbers, customers: customers, customerId: Number(req.query.customerId) })
          })
        })
    }
  },
}

module.exports = warehouseService