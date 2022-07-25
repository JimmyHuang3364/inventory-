const db = require('../models')
const Customer = db.Customer
const PartNumber = db.PartNumber
const SubPartNumber = db.SubPartNumber
const WarehousingHistory = db.WarehousingHistory

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
              raw: true,
              nest: true,
              order: [['createdAt', 'DESC']]
            }).then((warehousingHistory) => {
              if (warehousingHistory) {
                for (i = 0; i < warehousingHistory.length; i++) { warehousingHistory[i].createdAt = `${warehousingHistory[i].createdAt.getFullYear()}/${warehousingHistory[i].createdAt.getMonth()}/${warehousingHistory[i].createdAt.getDate()}` }
              }
              callback({ partNumbers: partNumbers, customers: customers, customerId: Number(req.query.customerId), warehousingHistory: warehousingHistory })
            })
          })
        })
    }
  },

  //入庫
  postWarehousing: (req, res, callback) => {
    return PartNumber.findOne({ where: { name: req.body.partNum } }) // 搜尋有無此母部品
      .then((partNumber) => {
        // console.log(partNumber.customerId)
        if (partNumber) { // 有此母部品
          WarehousingHistory.create({  //新增出入庫歷史紀錄
            name: req.body.partNum,
            quntityOfWarehousing: Number(req.body.quantity),
            totalQuntity: Number(partNumber.quantity) + Number(req.body.quantity),
            note: req.body.note,
            customerId: Number(partNumber.customerId)
          })
          return partNumber.update({ quantity: Number(partNumber.quantity) + Number(req.body.quantity) }) // 更新母部品在庫數
            .then((partNumber) => { callback({ status: 'success', message: `${partNumber.name}已入庫${req.body.quantity}pcs，在庫數 ${partNumber.quantity}pcs` }) })
        }
        if (!partNumber) { //無此部品
          return SubPartNumber.findOne({ where: { name: req.body.partNum } }) //搜尋子部品
            .then((subPartNumber) => {
              if (subPartNumber) { // 有此子部品
                WarehousingHistory.create({
                  name: req.body.partNum,
                  quntityOfWarehousing: Number(req.body.quantity),
                  totalQuntity: Number(subPartNumber.quantity) + Number(req.body.quantity),
                  note: req.body.note,
                  customerId: Number(subPartNumber.customerId)
                })
                return subPartNumber.update({ quantity: Number(subPartNumber.quantity) + Number(req.body.quantity) }) // 更新子部品在庫數
                  .then((subPartNumber) => { callback({ status: 'success', message: `${subPartNumber.name}已入庫${req.body.quantity}pcs，在庫數 ${subPartNumber.quantity}pcs` }) })
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
            name: req.body.partNum,
            quntityOfShipping: Number(req.body.quantity),
            totalQuntity: Number(partNumber.quantity) - Number(req.body.quantity),
            note: req.body.note,
            customerId: Number(partNumber.customerId)
          })
          if (Number(partNumber.quantity) < Number(req.body.quantity)) { return callback({ status: 'error', message: `在庫數剩餘 ${partNumber.quantity}pcs，不足出貨！！ 請確認數量！！` }) } //在庫數不足出貨

          if (Number(partNumber.quantity) >= Number(req.body.quantity)) {
            return partNumber.update({ quantity: Number(partNumber.quantity) - Number(req.body.quantity) }) // 更新母部品在庫數
              .then((partNumber) => { return callback({ status: 'success', message: `${partNumber.name}出貨${req.body.quantity}pcs，剩餘在庫數 ${partNumber.quantity}pcs` }) })
          }
        }

        if (!partNumber) { // 無此母部品轉找子部品
          SubPartNumber.findOne({ where: { name: req.body.partNum } }) //搜尋子部品
            .then((subPartNumber) => {
              if (subPartNumber) { // 有此子部品
                WarehousingHistory.create({
                  name: req.body.partNum,
                  quntityOfShipping: Number(req.body.quantity),
                  totalQuntity: Number(subPartNumber.quantity) - Number(req.body.quantity),
                  note: req.body.note,
                  customerId: Number(subPartNumber.customerId)
                })
                if (Number(subPartNumber.quantity) < Number(req.body.quantity)) { return callback({ status: 'error', message: `在庫數剩餘 ${subPartNumber.quantity}pcs，不足出貨！！ 請確認數量！！` }) } //在庫數不足出貨

                if (Number(subPartNumber.quantity) >= Number(req.body.quantity)) {
                  subPartNumber.update({ quantity: Number(subPartNumber.quantity) - Number(req.body.quantity) }) // 更新子部品在庫數
                    .then((subPartNumber) => { return callback({ status: 'success', message: `${subPartNumber.name}已減少${req.body.quantity}pcs，在庫數 ${subPartNumber.quantity}pcs` }) })
                }
              }

              if (!subPartNumber) { return callback({ status: 'error', message: '找無此部品番號' }) } //全部找不到
            })
        }
      })
  }
}

module.exports = warehouseService