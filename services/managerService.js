const db = require('../models')
const Customer = db.Customer
const PartNumber = db.PartNumber
const SubPartNumber = db.SubPartNumber

const managerService = {
  // 取得所有客戶
  getCustomers: (req, res, callback) => {
    return Customer.findAll({
      raw: true,
      nest: true
    }).then(customers => {
      callback({ customers: customers })
    })
  },

  // 取得單個客戶詳細資料
  getCustomer: (req, res, callback) => {
    return Customer.findByPk(req.params.id).then((customer) => {
      callback({ customer: customer.toJSON() })
    })
  },

  // 新增客戶資料
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

  // 更新客戶資料
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

  // 刪除客戶資料
  deleteCustomer: (req, res, callback) => {
    return Customer.findByPk(req.params.id)
      .then((customer) => {
        customer.destroy()
          .then(() => {
            callback({ status: 'success', message: `発注人${customer.name}資料已成功刪除!!` })
          })
      })
  },

  // 取得所有客戶及一般部品後渲染新增部品頁
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

  // 新增部品番或子部品
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
              // 係為子部品
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
              // 係為一般部品
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
  },

  // 取得所有部品資料
  getParNumbers: (req, res, callback) => {
    console.log(req.query)
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
    } else {
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
            callback({ partNumbers: partNumbers, customers: customers })
          })
        })
    }
  },

  // 刪除子部品資料
  deleteSubPartNumber: (req, res, callback) => {
    return SubPartNumber.findByPk(req.params.id)
      .then((subPartNumber) => {
        subPartNumber.destroy()
          .then(() => {
            callback({ status: 'success', message: `子部品${subPartNumber.name}已成功刪除` })
          })
      })
  },

  // 刪除一般部品資料(連同子部品一起刪)
  deletePartNumber: (req, res, callback) => {
    // 刪除部品
    return PartNumber.findOne({
      where: { id: req.params.id },
      include: SubPartNumber
    })
      .then((partNumber) => {
        partNumber.destroy()
          .then((partNumber) => {
            partNumber = partNumber.toJSON()
            // 找出所有該部品之子部品
            return SubPartNumber.findAll({
              where: { PartNumberId: partNumber.id },
              raw: true,
              nest: true
            })
              .then((subPartNumbers) => {
                // 刪除子部品
                return subPartNumbers.forEach(element => {
                  SubPartNumber.findByPk(element.id)
                    .then((subPartNumber) => {
                      subPartNumber.destroy()
                        .then(() => {
                          callback({ status: 'success', message: `部品${partNumber.name}連同子部品已成功摻除` })
                        })
                    })
                })
              })
          })
      })
  }
}

module.exports = managerService