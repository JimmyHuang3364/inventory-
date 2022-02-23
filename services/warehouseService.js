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

  postWarehousing: (req, res, callback) => {
    return PartNumber.findOne({ where: { name: req.body.partNum } }) // 搜尋有無此母部品
      .then((partNumber) => {
        if (partNumber) { // 有此母部品
          return partNumber.update({ quantity: Number(partNumber.quantity) + Number(req.body.quantity) }) // 更新母部品在庫數
            .then((partNumber) => { callback({ status: 'success', message: `${partNumber.name}已入庫${req.body.quantity}pcs，在庫數 ${partNumber.quantity}pcs` }) })
        }

        if (!partNumber) { //無此部品
          return SubPartNumber.findOne({ where: { name: req.body.partNum } }) //搜尋子部品
            .then((subPartNumber) => {
              if (subPartNumber) { // 有此子部品
                return subPartNumber.update({ quantity: Number(subPartNumber.quantity) + Number(req.body.quantity) }) // 更新子部品在庫數
                  .then((subPartNumber) => { callback({ status: 'success', message: `${subPartNumber.name}已入庫${req.body.quantity}pcs，在庫數 ${subPartNumber.quantity}pcs` }) })
              }

              if (!subPartNumber) { return callback({ status: 'error', message: '找無此部品番號' }) } //全部找不到
            })
        }
      })
  },

  postShipping: (req, res, callback) => {
    PartNumber.findOne({ where: { name: req.body.partNum } })
      .then((partNumber) => {
        if (partNumber) { // 有此母部品
          if (Number(partNumber.quantity) < Number(req.body.quantity)) { return callback({ status: 'error', message: `在庫數剩餘 ${partNumber.quantity}pcs，不足出貨！！ 請確認數量！！` }) } //在庫數不足出貨

          if (Number(partNumber.quantity) >= Number(req.body.quantity)) {
            return partNumber.update({ quantity: Number(partNumber.quantity) - Number(req.body.quantity) }) // 更新母部品在庫數
              .then((partNumber) => { return callback({ status: 'success', message: `${partNumber.name}出貨${req.body.quantity}pcs，剩餘在庫數 ${partNumber.quantity}pcs` }) })
          }
        }

        if (!partNumber) { // 無此母部品
          SubPartNumber.findOne({ where: { name: req.body.partNum } }) //搜尋子部品
            .then((subPartNumber) => {
              if (subPartNumber) { // 有此子部品
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