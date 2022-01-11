const db = require('../models')
const Customer = db.Customer

const managerService = {
  getCustomers: (req, res, callback) => {
    return Customer.findAll({
      raw: true,
      next: true
    }).then((customers => {
      callback({ customers: customers })
    }))
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
  }
}

module.exports = managerService