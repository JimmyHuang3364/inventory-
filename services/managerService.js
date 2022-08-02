const db = require('../models')
const Customer = db.Customer
const PartNumber = db.PartNumber
const SubPartNumber = db.SubPartNumber
const WarehousingHistory = db.WarehousingHistory
const { Op } = require("sequelize")

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
            //找出所有部品
            return PartNumber.findAll({
              where: { customerId: customer.id },
              raw: true,
              nest: true
            })
              .then((partNumbers) => {
                //一個個刪除部品
                if (partNumbers.length) {
                  return partNumbers.forEach(element => {
                    PartNumber.findByPk(element.id)
                      .then((partNumber) => {
                        partNumber.destroy()
                          .then((partNumber) => {
                            partNumber = partNumber.toJSON()
                            // 找出所有該部品之子部品
                            return SubPartNumber.findAll({
                              where: { partNumberId: partNumber.id },
                              raw: true,
                              nest: true
                            })
                              .then((subPartNumbers) => {
                                // 一個個刪除子部品
                                if (subPartNumbers.length) {
                                  return subPartNumbers.forEach(element => {
                                    SubPartNumber.findByPk(element.id)
                                      .then((subPartNumber) => {
                                        subPartNumber.destroy()
                                          .then(() => { callback({ status: 'success', message: `発注人${customer.name}連同相關資料已成功刪除!!` }) })
                                      })
                                  })
                                }

                                if (subPartNumbers.length) { return callback({ status: 'success', message: `発注人${customer.name}連同相關資料已成功刪除!!` }) }
                              })
                          })
                      })
                  })
                }
              })
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
          nest: true,
          order: [['name', 'ASC']]
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
                quantity: Number(req.body.quantity),
                safetyStockQuantity: Number(req.body.safetyStockQuantity),
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
                quantity: Number(req.body.quantity),
                safetyStockQuantity: Number(req.body.safetyStockQuantity),
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
    if (!req.query.customerId) {
      return PartNumber.findAll({
        include: [SubPartNumber],
        order: [['name', 'ASC']]
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
    } else { // 取得特一Customer所有部品資料
      return PartNumber.findAll({
        where: { customerId: Number(req.query.customerId) },
        include: [SubPartNumber],
        order: [['name', 'ASC']]
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
                if (subPartNumbers.length) {
                  subPartNumbers.forEach(element => {
                    SubPartNumber.findByPk(element.id)
                      .then((subPartNumber) => {
                        subPartNumber.destroy()
                      })
                  })
                  return callback({ status: 'success', message: `部品${partNumber.name}連同子部品已成功摻除` })
                } else {
                  return callback({ status: 'success', message: `部品${partNumber.name}連同子部品已成功摻除` })
                }
              })
          })
      })
  },

  // 取得一般部品資料渲染編輯頁
  getPartNumber: (req, res, callback) => {
    return PartNumber.findByPk(req.params.id)
      .then((partNumber) => {
        return PartNumber.findAll({
          raw: true,
          nest: true
        })
          .then((partNumbers) => {
            return Customer.findAll({
              raw: true,
              nest: true
            })
              .then((customers) => {
                callback({ partNumber: partNumber.toJSON(), partNumbers: partNumbers, customers: customers })
              })
          })
      })
  },

  // 取得子部品資料渲染編輯頁
  getSubPartNumber: (req, res, callback) => {
    return SubPartNumber.findByPk(req.params.id)
      .then((subPartNumber) => {
        return PartNumber.findAll({
          raw: true,
          nest: true
        })
          .then((partNumbers) => {
            return Customer.findAll({
              raw: true,
              nest: true
            })
              .then((customers) => {
                callback({ subPartNumber: subPartNumber.toJSON(), partNumbers: partNumbers, customers: customers })
              })
          })
      })
  },

  // 變更一般部品資料
  putPartNumber: (req, res, callback) => {
    if (Number(req.body.affiliatedPartNumber)) {
      // 狀況一、變成子部品(變更性質)
      //  1.檢查是否擁有子部品
      return SubPartNumber.findAll({ where: { partNumberId: req.params.id } }).then((subPartNumbers => {
        if (subPartNumbers.length) {
          callback({ status: 'error', message: `此部品擁有子部品，在尚未清除所擁有之子部品前無法使用此操作!!` })
        } else {
          //   2.找出一般部品資料findByPk
          return PartNumber.findByPk(req.params.id)
            .then((partNumber) => {
              partNumber.destroy() //   3.刪除一般部品資料
                .then(() => {
                  SubPartNumber.create({ //   4.新建子部品資料
                    name: req.body.name,
                    commonName: req.body.commonName,
                    quantity: Number(req.body.quantity),
                    safetyStockQuantity: Number(req.body.safetyStockQuantity),
                    partNumberId: req.body.affiliatedPartNumber,
                    customerId: req.body.customer
                  })
                    .then((subPartNumber) => {
                      callback({ status: 'success', message: `部品番${subPartNumber.name}成功轉移至子部品番` }) //   5.回傳結果
                    })
                })
            })
        }
      }))
    } else {
      // 狀況二、單純變更資料(變更內容)
      //   1.找出資料findByPk 
      return PartNumber.findByPk(req.params.id).then((partNumber) => {
        partNumber.update({ //   2.更新資料庫
          name: req.body.name,
          commonName: req.body.commonName,
          quantity: Number(req.body.quantity),
          safetyStockQuantity: Number(req.body.safetyStockQuantity),
          customerId: req.body.customer
        })
          .then((partNumber) => {
            callback({ status: 'success', message: `部品番${partNumber.name}更新資料成功` }) //   3.回傳結果
          })
      })
    }
  },

  // 變更子部品資料
  putSubPartNumber: (req, res, callback) => {
    if (!Number(req.body.affiliatedPartNumber)) {
      // 狀況一、變成一般部品(變更性質)
      // 1.找出子部品資料findByPk
      return SubPartNumber.findByPk(req.params.id).then((subPartNumber) => {
        subPartNumber.destroy().then(() => {  // 3.刪除子部品
          PartNumber.create({  // 4.新增一般部品
            name: req.body.name,
            commonName: req.body.commonName,
            quantity: Number(req.body.quantity),
            safetyStockQuantity: Number(req.body.safetyStockQuantity),
            customerId: req.body.customer
          })
            .then((partNumber) => { callback({ status: 'success', message: `子部品番${partNumber.name}成功轉移至一般部品` }) })  // 5.回傳結果

        })
      })
    } else {
      // 狀況二、單純變更資料(變更內容)
      // 1.找出子部品資料findByPk
      return SubPartNumber.findByPk(req.params.id).then((subPartNumber) => {
        subPartNumber.update({  // 2.更新資料
          name: req.body.name,
          commonName: req.body.commonName,
          quantity: Number(req.body.quantity),
          safetyStockQuantity: Number(req.body.safetyStockQuantity),
          partNumberId: req.body.affiliatedPartNumber,
          customerId: req.body.customer
        })
          .then((subPartNumber) => { callback({ status: 'srccess', message: `子部品番${subPartNumber.name}更新資料成功` }) })
        // 3.回傳結果
      })
    }
  },

  // 取得所有Warehousing Histories資料
  getWarehousingHistories: (req, res, callback) => {
    if (!req.query.customerId) {
      return WarehousingHistory.findAll({
        include: [PartNumber, SubPartNumber],
        raw: true,
        nest: true,
        order: [['createdAt', 'DESC']]
      }).then((warehousingHistories) => {
        if (warehousingHistories) {
          for (i = 0; i < warehousingHistories.length; i++) { warehousingHistories[i].textCreatedAt = `${warehousingHistories[i].createdAt.getFullYear()}/${warehousingHistories[i].createdAt.getMonth() + 1}/${warehousingHistories[i].createdAt.getDate()}` }
        }
        Customer.findAll({
          raw: true,
          nest: true
        })
          .then((customers) => {
            callback({ warehousingHistories: warehousingHistories, customers: customers })
          })
      })
    }

    // 取得特一Customer Warehousing Histories資料
    if (req.query.customerId) {
      return WarehousingHistory.findAll({
        where: { customerId: Number(req.query.customerId) },
        include: [PartNumber, SubPartNumber],
        raw: true,
        nest: true,
        order: [['createdAt', 'DESC']]
      })
        .then((warehousingHistories) => {
          if (warehousingHistories) {
            for (i = 0; i < warehousingHistories.length; i++) { warehousingHistories[i].textCreatedAt = `${warehousingHistories[i].createdAt.getFullYear()}/${warehousingHistories[i].createdAt.getMonth() + 1}/${warehousingHistories[i].createdAt.getDate()}` }
          }
          Customer.findAll({ raw: true, nest: true })
            .then((customers) => {
              callback({ warehousingHistories: warehousingHistories, customers: customers, customerId: Number(req.query.customerId) })
            })
        })
    }
  },

  // 刪除單一個WarehousingHistory資料
  deleteWarehousingHistories: (req, res, callback) => {
    return WarehousingHistory.findByPk(req.params.id)
      .then((warehousingHistory) => {
        warehousingHistory.destroy()
          .then(() => {
            callback({ status: 'success', message: `紀錄#${warehousingHistory.id}已刪除` })
          })
      })
  },

  // 搜尋品番頁
  getSearchPartNumbers: async (req, res, callback) => {
    const result = await PartNumber.findAll({
      where: { name: { [Op.like]: `%${req.body.searchText}%` } },
      include: [SubPartNumber],
      order: [['name', 'ASC']]
    })
    if (result.length) {
      const partNumbers = await result.map(r => ({
        ...r.dataValues,
        subPartNumbers: r.SubPartNumbers.map(sub => ({ ...sub.dataValues }))
      }))
      return callback({ partNumbers: partNumbers, searchText: req.body.searchText })
    }

    if (!result.length) {
      const subPartNumbers = await SubPartNumber.findAll({
        where: { name: { [Op.like]: `%${req.body.searchText}%` } },
        order: [['name', 'ASC']],
        raw: true,
        nest: true
      })
      console.log(subPartNumbers)
      return callback({ partNumbers: subPartNumbers, searchText: req.body.searchText })
    }
  },

  // 搜尋歷史紀錄
  getSearchWarehousingHistories: async (req, res, callback) => {
    if (!req.body.startDate && !req.body.endDate) {  //無日期區間搜尋
      const partResult = await PartNumber.findAll({
        where: { name: { [Op.like]: `%${req.body.searchText}%` } },
        include: [SubPartNumber],
        order: [['name', 'ASC']]
      })

      if (partResult.length) { //搜尋母部品&子部品
        const partNumbers = partResult.map(r => ({
          ...r.dataValues,
          subPartNumbers: r.SubPartNumbers.map(sub => ({ ...sub.dataValues }))
        }))
        const searchPartNumberId = partNumbers.map(r => r.id)  //要依partNumberId搜尋歷史紀錄的ID
        const searchSubPartNumberId = []
        partNumbers.forEach(element => { element.subPartNumbers.map(r => searchSubPartNumberId.push(r.id)) }) //要依subPartNumberId搜尋歷史紀錄的ID
        const warehousingHistories = await WarehousingHistory.findAll({
          include: [PartNumber, SubPartNumber],
          where: {
            [Op.or]: [
              { subPartNumberId: searchSubPartNumberId },
              { partNumberId: searchPartNumberId },
            ]
          },
          order: [['createdAt', 'DESC']],
          raw: true,
          nest: true
        })
        if (warehousingHistories) {
          for (i = 0; i < warehousingHistories.length; i++) { warehousingHistories[i].textCreatedAt = `${warehousingHistories[i].createdAt.getFullYear()}/${warehousingHistories[i].createdAt.getMonth() + 1}/${warehousingHistories[i].createdAt.getDate()}` }
        }
        return callback({ partNumbers: partNumbers, warehousingHistories: warehousingHistories })
      }

      if (!partResult.length) {  //單搜尋子部品
        const subPartResult = await SubPartNumber.findAll({
          where: { name: { [Op.like]: `%${req.body.searchText}%` } },
          include: [WarehousingHistory],
          order: [['name', 'ASC']]
        })
        const subPartNumbers = await subPartResult.map(r => ({
          ...r.dataValues,
        }))
        const searchSubPartNumberId = await subPartNumbers.map(r => r.id)  //要依subPartNumberId搜尋歷史紀錄的ID
        const warehousingHistories = await WarehousingHistory.findAll({
          include: [SubPartNumber],
          where: { subPartNumberId: searchSubPartNumberId, },
          order: [['createdAt', 'DESC']],
          raw: true,
          nest: true
        })
        if (warehousingHistories) {
          for (i = 0; i < warehousingHistories.length; i++) { warehousingHistories[i].textCreatedAt = `${warehousingHistories[i].createdAt.getFullYear()}/${warehousingHistories[i].createdAt.getMonth() + 1}/${warehousingHistories[i].createdAt.getDate()}` }
        }
        return callback({ partNumbers: subPartNumbers, warehousingHistories: warehousingHistories })
      }
    }

    if (req.body.startDate || req.body.endDate) {  //有日期區間搜尋
      let startDate = null
      if (req.body.startDate) { startDate = new Date(new Date(req.body.startDate).setHours(new Date(req.body.startDate).getHours() - 8)) }
      if (!req.body.startDate) {
        startDate = new Date(new Date(req.body.endDate).setDate(new Date(req.body.endDate).getDate() - 30))
        startDate = new Date(new Date(startDate).setHours(new Date(startDate).getHours() - 8))
      }
      const endDate = new Date(new Date(req.body.endDate).setHours(new Date(req.body.endDate).getHours() + 16))
      const partResult = await PartNumber.findAll({
        where: { name: { [Op.like]: `%${req.body.searchText}%` } },
        include: [SubPartNumber],
        order: [['name', 'ASC']]
      })
      if (partResult.length) {
        const partNumbers = partResult.map(r => ({
          ...r.dataValues,
          subPartNumbers: r.SubPartNumbers.map(sub => ({ ...sub.dataValues }))
        }))
        const searchPartNumberId = partNumbers.map(r => r.id)  //要依partNumberId搜尋歷史紀錄的ID
        const searchSubPartNumberId = []
        partNumbers.forEach(element => { element.subPartNumbers.map(r => searchSubPartNumberId.push(r.id)) }) //要依subPartNumberId搜尋歷史紀錄的ID
        const warehousingHistories = await WarehousingHistory.findAll({
          include: [PartNumber, SubPartNumber],
          where: {
            [Op.or]: [
              { subPartNumberId: searchSubPartNumberId },
              { partNumberId: searchPartNumberId },
            ],
            createdAt: {
              [Op.lt]: new Date(endDate),
              [Op.gte]: new Date(startDate)
            }
          },
          order: [['createdAt', 'DESC']],
          raw: true,
          nest: true
        })
        if (warehousingHistories) {
          for (i = 0; i < warehousingHistories.length; i++) { warehousingHistories[i].textCreatedAt = `${warehousingHistories[i].createdAt.getFullYear()}/${warehousingHistories[i].createdAt.getMonth() + 1}/${warehousingHistories[i].createdAt.getDate()}` }
        }
        return callback({ partNumbers: partNumbers, warehousingHistories: warehousingHistories, searchText: req.body.searchText })
      }

      if (!partResult.length) {
        const subPartResult = await SubPartNumber.findAll({
          where: { name: { [Op.like]: `%${req.body.searchText}%` } },
          include: [WarehousingHistory],
          order: [['name', 'ASC']]
        })
        const subPartNumbers = await subPartResult.map(r => ({ ...r.dataValues, }))
        const searchSubPartNumberId = await subPartNumbers.map(r => r.id)  //要依subPartNumberId搜尋歷史紀錄的ID
        const warehousingHistories = await WarehousingHistory.findAll({
          include: [SubPartNumber],
          where: {
            subPartNumberId: searchSubPartNumberId,
            createdAt: {
              [Op.lt]: new Date(endDate),
              [Op.gte]: new Date(startDate)
            },
          },
          order: [['createdAt', 'DESC']],
          raw: true,
          nest: true
        })
        if (warehousingHistories) {
          for (i = 0; i < warehousingHistories.length; i++) { warehousingHistories[i].textCreatedAt = `${warehousingHistories[i].createdAt.getFullYear()}/${warehousingHistories[i].createdAt.getMonth() + 1}/${warehousingHistories[i].createdAt.getDate()}` }
        }
        return callback({ partNumbers: subPartNumbers, warehousingHistories: warehousingHistories, searchText: req.body.searchText })
      }
    }
  }
}

module.exports = managerService