const db = require('../models')
const Customer = db.Customer
const PartNumber = db.PartNumber
const SubPartNumber = db.SubPartNumber

const managerService = {
  getCustomers: (req, res, callback) => {
    return Customer.findAll({
      raw: true,
      nest: true
    }).then(customers => {
      callback({ customers: customers })
    })
  },
  getCustomer: (req, res, callback) => {
    return Customer.findByPk(req.params.id).then((customer) => {
      callback({ customer: customer.toJSON() })
    })
  },
  postCustomer: (req, res, callback) => {
    return Customer.findOne({ where: { name: req.body.name } }).then((customer) => {
      if (customer) {
        return callback({ status: 'error', message: `此発注人${customer.name}已存在資料庫內!!` })
      } else {
        return Customer.create({
          name: req.body.name,
          address: req.body.address,
          tel: req.body.tel,
          fax: req.body.fax,
          photo: req.body.photo
        })
          .then((customer) => {
            callback({ status: 'success', message: `発注人 ${customer.name} 新增成功!!` })
          })
      }
    })
  },
  putCustomer: (req, res, callback) => {
    return Customer.findByPk(req.params.id)
      .then((customer) => {
        customer.update({
          name: req.body.name,
          address: req.body.address,
          tel: req.body.tel,
          fax: req.body.fax,
          photo: req.body.photo
        })
          .then((customer) => {
            callback({ status: 'success', message: `発注人${customer.name}資料已成功修改!!` })
          })
      })
  },
  deleteCustomer: (req, res, callback) => {
    return Customer.findByPk(req.params.id)
      .then((customer) => {
        customer.destroy()
          .then(() => {
            callback({ status: 'success', message: `発注人${customer.name}資料已成功刪除!!` })
          })
      })
  },
  getCreatePartNumber: (req, res, callback) => {
    return Customer.findAll({
      raw: true,
      nest: true
    })
      .then((customers) => {
        return PartNumber.findAll({
          raw: true,
          nest: true
        })
          .then((partNumbers) => {
            callback({ customers: customers, partNumbers: partNumbers })
          })
      })
  },
  postCreatePartNumber: (req, res, callback) => {
    return PartNumber.findOne({ where: { name: req.body.name } }).then((partNumber => {
      if (partNumber) {
        return callback({ status: 'error', message: `此部品番${partNumber.name}已存在資料庫內!!` })
      } else {
        SubPartNumber.findOne({ where: { name: req.body.name } }).then((subPartNumber) => {
          if (subPartNumber) {
            return callback({ status: 'error', message: `此子部品番${subPartNumber.name}已存在資料庫內!!` })
          } else {
            if (Number(req.body.affiliatedPartNumber)) {
              return SubPartNumber.create({
                name: req.body.name,
                commonName: req.body.commonName,
                quantity: 0,
                partNumberId: req.body.affiliatedPartNumber,
                customerId: req.body.customer
              })
                .then((subPartNumber) => {
                  callback({ status: 'success', message: `子部品番(${subPartNumber.name})新增成功!` })
                })
            } else {
              return PartNumber.create({
                name: req.body.name,
                commonName: req.body.commonName,
                quantity: 0,
                customerId: req.body.customer
              })
                .then((partNumber => {
                  callback({ status: 'success', message: `部品番(${partNumber.name})新增成功!!` })
                }))
            }
          }
        })
      }
    }))
  }
}

module.exports = managerService