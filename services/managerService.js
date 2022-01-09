const db = require('../models')
const Customer = db.Customer

const managerService = {
  getCustomers: (req, res, callback) => {
    return console.log('sda')
  },
  postCustomer: (req, res, callback) => {
    return Customer.findOne({ where: { name: req.body.name } }).then((customer) => {
      if (customer) {
        return callback({ status: 'error', message: '此発注人已存在資料庫內!!' })
      } else {
        return Customer.create({
          name: req.body.name,
          address: req.body.address,
          tel: req.body.tel,
          fax: req.body.fax
        })
          .then((customer) => {
            callback({ status: 'success', message: `発注人 ${customer} 新增成功!!` })
          })
      }
    })
  }
}

module.exports = managerService