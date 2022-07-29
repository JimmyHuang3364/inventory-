const db = require('../models')
const Customer = db.Customer
const PartNumber = db.PartNumber
const SubPartNumber = db.SubPartNumber
const WarehousingHistory = db.WarehousingHistory
const { Op } = require("sequelize") //sequelize運算子

const warehouseService = {
  getParNumbers: (req, res, callback) => {  //取得所有部品資料
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
            WarehousingHistory.findAll({
              include: [PartNumber, SubPartNumber],
              limit: 50,
              raw: true,
              nest: true,
              order: [['createdAt', 'DESC']]
            }).then((warehousingHistories) => {
              if (warehousingHistories) {
                for (i = 0; i < warehousingHistories.length; i++) { warehousingHistories[i].createdAt = `${warehousingHistories[i].createdAt.getFullYear()}/${warehousingHistories[i].createdAt.getMonth()}/${warehousingHistories[i].createdAt.getDate()}` }
              }
              callback({ partNumbers: partNumbers, customers: customers, warehousingHistories: warehousingHistories })
            })
          })
        })
    }

    if (req.query.customerId) { //取得特一客戶所有部品資料
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
            nest: true,
          }).then((customers) => {
            WarehousingHistory.findAll({
              where: { customerId: Number(req.query.customerId) },
              include: [PartNumber, SubPartNumber],
              limit: 50,
              raw: true,
              nest: true,
              order: [['createdAt', 'DESC']]
            }).then((warehousingHistories) => {
              if (warehousingHistories) {
                for (i = 0; i < warehousingHistories.length; i++) { warehousingHistories[i].createdAt = `${warehousingHistories[i].createdAt.getFullYear()}/${warehousingHistories[i].createdAt.getMonth()}/${warehousingHistories[i].createdAt.getDate()}` }
              }
              callback({ partNumbers: partNumbers, customers: customers, customerId: Number(req.query.customerId), warehousingHistories: warehousingHistories })
            })
          })
        })
    }
  },

  //入庫
  postWarehousing: (req, res, callback) => {
    return PartNumber.findOne({ where: { name: req.body.partNum } }) // 搜尋有無此母部品
      .then((partNumber) => {
        if (partNumber) { // 有此母部品
          WarehousingHistory.create({  //新增出入庫歷史紀錄
            quntityOfWarehousing: Number(req.body.quantity),
            totalQuntity: Number(partNumber.quantity) + Number(req.body.quantity),
            note: req.body.note,
            customerId: Number(partNumber.customerId),
            partNumberId: Number(partNumber.id)
          })
          return partNumber.update({ quantity: Number(partNumber.quantity) + Number(req.body.quantity) }) // 更新母部品在庫數
            .then((partNumber) => {
              const toDayLastYear = new Date(new Date().setFullYear(new Date().getFullYear() - 1))
              return WarehousingHistory.findAll({
                where: { createdAt: { [Op.lt]: toDayLastYear } },
                raw: true,
                nest: true
              })
                .then((warehousingHistories) => {
                  if (warehousingHistories.length) {
                    warehousingHistories.forEach(element => {
                      WarehousingHistory.findByPk(element.id)
                        .then((warehousingHistory) => {
                          warehousingHistory.destroy()
                        })
                    })
                    return callback({ status: 'success', message: `${partNumber.name}已入庫${req.body.quantity}pcs，在庫數 ${partNumber.quantity}pcs` })
                  }
                  if (!warehousingHistories.length) {
                    return callback({ status: 'success', message: `${partNumber.name}已入庫${req.body.quantity}pcs，在庫數 ${partNumber.quantity}pcs` })
                  }
                })
            })
        }
        if (!partNumber) { //無此部品
          return SubPartNumber.findOne({ where: { name: req.body.partNum } }) //搜尋子部品
            .then((subPartNumber) => {
              if (subPartNumber) { // 有此子部品
                WarehousingHistory.create({
                  quntityOfWarehousing: Number(req.body.quantity),
                  totalQuntity: Number(subPartNumber.quantity) + Number(req.body.quantity),
                  note: req.body.note,
                  customerId: Number(subPartNumber.customerId),
                  subPartNumberId: Number(subPartNumber.id)
                })
                return subPartNumber.update({ quantity: Number(subPartNumber.quantity) + Number(req.body.quantity) }) // 更新子部品在庫數
                  .then((subPartNumber) => {
                    const toDayLastYear = new Date(new Date().setFullYear(new Date().getFullYear() - 1))
                    return WarehousingHistory.findAll({
                      where: { createdAt: { [Op.lt]: toDayLastYear } },
                      raw: true,
                      nest: true
                    })
                      .then((warehousingHistories) => {
                        if (warehousingHistories.length) {
                          warehousingHistories.forEach(element => {
                            WarehousingHistory.findByPk(element.id)
                              .then((warehousingHistory) => {
                                warehousingHistory.destroy()
                              })
                          })
                          return callback({ status: 'success', message: `${subPartNumber.name}已入庫${req.body.quantity}pcs，在庫數 ${subPartNumber.quantity}pcs` })
                        }
                        if (!warehousingHistories.length) {
                          return callback({ status: 'success', message: `${subPartNumber.name}已入庫${req.body.quantity}pcs，在庫數 ${subPartNumber.quantity}pcs` })
                        }
                      })
                  })
              }
              if (!subPartNumber) { return callback({ status: 'error', message: '找無此部品番號' }) } //全部找不到
            })
        }
      })
  },

  //出庫
  postShipping: (req, res, callback) => {
    PartNumber.findOne({ where: { name: req.body.partNum } })
      .then((partNumber) => {
        if (partNumber) { // 有此母部品
          WarehousingHistory.create({
            quntityOfShipping: Number(req.body.quantity),
            totalQuntity: Number(partNumber.quantity) - Number(req.body.quantity),
            note: req.body.note,
            customerId: Number(partNumber.customerId),
            partNumberId: Number(partNumber.id)
          })
          if (Number(partNumber.quantity) < Number(req.body.quantity)) { return callback({ status: 'error', message: `在庫數剩餘 ${partNumber.quantity}pcs，不足出貨！！ 請確認數量！！` }) } //在庫數不足出貨

          if (Number(partNumber.quantity) >= Number(req.body.quantity)) {
            return partNumber.update({ quantity: Number(partNumber.quantity) - Number(req.body.quantity) }) // 更新母部品在庫數
              .then((partNumber) => {
                const toDayLastYear = new Date(new Date().setFullYear(new Date().getFullYear() - 1))
                return WarehousingHistory.findAll({
                  where: { createdAt: { [Op.lt]: toDayLastYear } },
                  raw: true,
                  nest: true
                })
                  .then((warehousingHistories) => {
                    if (warehousingHistories.length) {
                      warehousingHistories.forEach(element => {
                        WarehousingHistory.findByPk(element.id)
                          .then((warehousingHistory) => {
                            warehousingHistory.destroy()
                          })
                      })
                      return callback({ status: 'success', message: `${partNumber.name}已入庫${req.body.quantity}pcs，在庫數 ${partNumber.quantity}pcs` })
                    }
                    if (!warehousingHistories.length) {
                      return callback({ status: 'success', message: `${partNumber.name}已入庫${req.body.quantity}pcs，在庫數 ${partNumber.quantity}pcs` })
                    }
                  })
              })
          }
        }

        if (!partNumber) { // 無此母部品轉找子部品
          SubPartNumber.findOne({ where: { name: req.body.partNum } }) //搜尋子部品
            .then((subPartNumber) => {
              if (subPartNumber) { // 有此子部品
                WarehousingHistory.create({
                  quntityOfShipping: Number(req.body.quantity),
                  totalQuntity: Number(subPartNumber.quantity) - Number(req.body.quantity),
                  note: req.body.note,
                  customerId: Number(subPartNumber.customerId),
                  subPartNumberId: Number(subPartNumber.id)
                })
                if (Number(subPartNumber.quantity) < Number(req.body.quantity)) { return callback({ status: 'error', message: `在庫數剩餘 ${subPartNumber.quantity}pcs，不足出貨！！ 請確認數量！！` }) } //在庫數不足出貨

                if (Number(subPartNumber.quantity) >= Number(req.body.quantity)) {
                  subPartNumber.update({ quantity: Number(subPartNumber.quantity) - Number(req.body.quantity) }) // 更新子部品在庫數
                    .then((subPartNumber) => {
                      const toDayLastYear = new Date(new Date().setFullYear(new Date().getFullYear() - 1))
                      return WarehousingHistory.findAll({
                        where: { createdAt: { [Op.lt]: toDayLastYear } },
                        raw: true,
                        nest: true
                      })
                        .then((warehousingHistories) => {
                          if (warehousingHistories.length) {
                            warehousingHistories.forEach(element => {
                              WarehousingHistory.findByPk(element.id)
                                .then((warehousingHistory) => {
                                  warehousingHistory.destroy()
                                })
                            })
                            return callback({ status: 'success', message: `${subPartNumber.name}已入庫${req.body.quantity}pcs，在庫數 ${subPartNumber.quantity}pcs` })
                          }
                          if (!warehousingHistories.length) {
                            return callback({ status: 'success', message: `${subPartNumber.name}已入庫${req.body.quantity}pcs，在庫數 ${subPartNumber.quantity}pcs` })
                          }
                        })
                    })
                }
              }

              if (!subPartNumber) { return callback({ status: 'error', message: '找無此部品番號' }) } //全部找不到
            })
        }
      })
  },

  //關鍵字搜尋部品番
  getSearchPartNumbers: (req, res, callback) => {
    if (!req.body.startDate && !req.body.endDate) {  //無日期區間搜尋
      PartNumber.findAll({
        where: { name: { [Op.like]: `%${req.body.searchText}%` } },
        include: [SubPartNumber],
        order: [['name', 'ASC']]
      })
        .then((result) => {
          if (result.length) {
            const partNumbers = result.map(r => ({
              ...r.dataValues,
              subPartNumbers: r.SubPartNumbers.map(sub => ({ ...sub.dataValues }))
            }))
            const searchPartNumberId = partNumbers.map(r => r.id)  //要依partNumberId搜尋歷史紀錄的ID
            const searchSubPartNumberId = []
            partNumbers.forEach(element => { element.subPartNumbers.map(r => searchSubPartNumberId.push(r.id)) }) //要依subPartNumberId搜尋歷史紀錄的ID
            WarehousingHistory.findAll({
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
              .then((warehousingHistories) => {
                if (warehousingHistories) {
                  for (i = 0; i < warehousingHistories.length; i++) { warehousingHistories[i].createdAt = `${warehousingHistories[i].createdAt.getFullYear()}/${warehousingHistories[i].createdAt.getMonth()}/${warehousingHistories[i].createdAt.getDate()}` }
                }
                return callback({ partNumbers: partNumbers, warehousingHistories: warehousingHistories })
              })
          }

          if (!result.length) {
            SubPartNumber.findAll({
              where: { name: { [Op.like]: `%${req.body.searchText}%` } },
              include: [WarehousingHistory],
              order: [['name', 'ASC']]
            })
              .then(async (result) => {
                const subPartNumbers = await result.map(r => ({
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
                  for (i = 0; i < warehousingHistories.length; i++) { warehousingHistories[i].createdAt = `${warehousingHistories[i].createdAt.getFullYear()}/${warehousingHistories[i].createdAt.getMonth()}/${warehousingHistories[i].createdAt.getDate()}` }
                }
                return callback({ partNumbers: subPartNumbers, warehousingHistories: warehousingHistories })
              })
          }
        })
    }

    if (req.body.startDate || req.body.endDate) {  //有日期區間搜尋

      let startDate = null
      if (req.body.startDate) { startDate = new Date(new Date(req.body.startDate).setHours(new Date(req.body.startDate).getHours() - 8)) }
      if (!req.body.startDate) {
        startDate = new Date(new Date(req.body.endDate).setDate(new Date(req.body.endDate).getDate() - 30))
        startDate = new Date(new Date(startDate).setHours(new Date(startDate).getHours() - 8))
      }
      const endDate = new Date(new Date(req.body.endDate).setHours(new Date(req.body.endDate).getHours() + 16))
      PartNumber.findAll({
        where: { name: { [Op.like]: `%${req.body.searchText}%` } },
        include: [SubPartNumber],
        order: [['name', 'ASC']]
      })
        .then((result) => {
          if (result.length) {
            const partNumbers = result.map(r => ({
              ...r.dataValues,
              subPartNumbers: r.SubPartNumbers.map(sub => ({ ...sub.dataValues }))
            }))
            const searchPartNumberId = partNumbers.map(r => r.id)  //要依partNumberId搜尋歷史紀錄的ID
            const searchSubPartNumberId = []
            partNumbers.forEach(element => { element.subPartNumbers.map(r => searchSubPartNumberId.push(r.id)) }) //要依subPartNumberId搜尋歷史紀錄的ID
            WarehousingHistory.findAll({
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
              .then((warehousingHistories) => {
                if (warehousingHistories) {
                  for (i = 0; i < warehousingHistories.length; i++) { warehousingHistories[i].createdAt = `${warehousingHistories[i].createdAt.getFullYear()}/${warehousingHistories[i].createdAt.getMonth()}/${warehousingHistories[i].createdAt.getDate()}` }
                }
                return callback({ partNumbers: partNumbers, warehousingHistories: warehousingHistories, searchText: req.body.searchText })
              })
          }

          if (!result.length) {
            SubPartNumber.findAll({
              where: { name: { [Op.like]: `%${req.body.searchText}%` } },
              include: [WarehousingHistory],
              order: [['name', 'ASC']]
            })
              .then(async (result) => {
                const subPartNumbers = await result.map(r => ({
                  ...r.dataValues,
                }))
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
                  for (i = 0; i < warehousingHistories.length; i++) { warehousingHistories[i].createdAt = `${warehousingHistories[i].createdAt.getFullYear()}/${warehousingHistories[i].createdAt.getMonth()}/${warehousingHistories[i].createdAt.getDate()}` }
                }
                return callback({ partNumbers: subPartNumbers, warehousingHistories: warehousingHistories, searchText: req.body.searchText })
              })
          }
        })
    }
  }
}

module.exports = warehouseService