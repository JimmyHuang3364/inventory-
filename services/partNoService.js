const db = require('../models')
const Customer = db.Customer
const PartNumber = db.PartNumber
const SubPartNumber = db.SubPartNumber

const partNoService = {
  getParNumbers: (req, res, callback) => {
    return PartNumber.findAll({
      include: [SubPartNumber, Customer],
    })
      .then((result) => {
        const partNumbers = result.map(r => ({
          ...r.dataValues,
          subPartNumbers: r.SubPartNumbers.map(sub => ({ ...sub.dataValues })),
          customerName: r.Customer.name
        }))
        Customer.findAll({
          raw: true,
          nest: true
        }).then((customers) => {
          callback({ partNumbers: partNumbers, customers: customers })
        })
      })
  }
}

module.exports = partNoService