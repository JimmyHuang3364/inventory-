const db = require('../models')
const Customer = db.Customer
const PartNumber = db.PartNumber
const SubPartNumber = db.SubPartNumber
const WarehousingHistory = db.WarehousingHistory
const PartnerFactories = db.PartnerFactories
const ProductionProcessItem = db.ProductionProcessItem
const Outsourcinglist = db.Outsourcinglist
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
              order: [['createdAt', 'DESC'], ['updatedAt', 'DESC']]
            }).then((warehousingHistories) => {
              if (warehousingHistories) {
                for (i = 0; i < warehousingHistories.length; i++) {
                  warehousingHistories[i].textCreatedAt = `${warehousingHistories[i].createdAt.getFullYear()}/${warehousingHistories[i].createdAt.getMonth() + 1}/${warehousingHistories[i].createdAt.getDate()}`
                }
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
              order: [['createdAt', 'DESC'], ['updatedAt', 'DESC']]
            }).then((warehousingHistories) => {
              if (warehousingHistories) {
                for (i = 0; i < warehousingHistories.length; i++) { warehousingHistories[i].textCreatedAt = `${warehousingHistories[i].createdAt.getFullYear()}/${warehousingHistories[i].createdAt.getMonth() + 1}/${warehousingHistories[i].createdAt.getDate()}` }
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
            partNumberId: Number(partNumber.id),
            createdAt: new Date(req.body.warehousingDate)
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
                  subPartNumberId: Number(subPartNumber.id),
                  createdAt: new Date(req.body.warehousingDate)
                })
                return subPartNumber.update({ quantity: Number(subPartNumber.quantity) + Number(req.body.quantity) }) // 更新子部品在庫數
                  .then((subPartNumber) => {
                    const toDayLastYear = new Date(new Date().setFullYear(new Date().getFullYear() - 1)) //1月=0
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
            partNumberId: Number(partNumber.id),
            createdAt: new Date(req.body.shippingDate)
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
                  subPartNumberId: Number(subPartNumber.id),
                  createdAt: new Date(req.body.shippingDate)
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
    if (!req.query.startDate && !req.query.endDate) {  //無日期區間搜尋
      PartNumber.findAll({
        where: { name: { [Op.like]: `%${req.query.searchText}%` } },
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
              order: [['createdAt', 'DESC'], ['updatedAt', 'DESC']],
              raw: true,
              nest: true
            })
              .then((warehousingHistories) => {
                if (warehousingHistories) {
                  for (i = 0; i < warehousingHistories.length; i++) { warehousingHistories[i].textCreatedAt = `${warehousingHistories[i].createdAt.getFullYear()}/${warehousingHistories[i].createdAt.getMonth() + 1}/${warehousingHistories[i].createdAt.getDate()}` }
                }
                return callback({ partNumbers: partNumbers, warehousingHistories: warehousingHistories })
              })
          }

          if (!result.length) {
            SubPartNumber.findAll({
              where: { name: { [Op.like]: `%${req.query.searchText}%` } },
              include: [WarehousingHistory],
              order: [['createdAt', 'DESC'], ['name', 'ASC']]
            })
              .then(async (result) => {
                const subPartNumbers = await result.map(r => ({
                  ...r.dataValues,
                }))
                const searchSubPartNumberId = await subPartNumbers.map(r => r.id)  //要依subPartNumberId搜尋歷史紀錄的ID
                const warehousingHistories = await WarehousingHistory.findAll({
                  include: [SubPartNumber],
                  where: { subPartNumberId: searchSubPartNumberId, },
                  order: [['createdAt', 'DESC'], ['updatedAt', 'DESC']],
                  raw: true,
                  nest: true
                })
                if (warehousingHistories) {
                  for (i = 0; i < warehousingHistories.length; i++) { warehousingHistories[i].textCreatedAt = `${warehousingHistories[i].createdAt.getFullYear()}/${warehousingHistories[i].createdAt.getMonth() + 1}/${warehousingHistories[i].createdAt.getDate()}` }
                }
                return callback({ partNumbers: subPartNumbers, warehousingHistories: warehousingHistories })
              })
          }
        })
    }

    if (req.query.startDate || req.query.endDate) {  //有日期區間搜尋
      let startDate = null
      if (req.query.startDate) { startDate = new Date(new Date(req.query.startDate).setHours(new Date(req.query.startDate).getHours() - 8)) }
      if (!req.query.startDate) {
        startDate = new Date(new Date(req.query.endDate).setDate(new Date(req.query.endDate).getDate() - 30))
        startDate = new Date(new Date(startDate).setHours(new Date(startDate).getHours() - 8))
      }
      const endDate = new Date(new Date(req.query.endDate).setHours(new Date(req.query.endDate).getHours() + 16))
      PartNumber.findAll({
        where: { name: { [Op.like]: `%${req.query.searchText}%` } },
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
              order: [['createdAt', 'DESC'], ['updatedAt', 'DESC']],
              raw: true,
              nest: true
            })
              .then((warehousingHistories) => {
                searchStartDate = req.query.startDate
                searchEndDate = req.query.endDate
                if (warehousingHistories) {
                  for (i = 0; i < warehousingHistories.length; i++) { warehousingHistories[i].textCreatedAt = `${warehousingHistories[i].createdAt.getFullYear()}/${warehousingHistories[i].createdAt.getMonth() + 1}/${warehousingHistories[i].createdAt.getDate()}` }
                }
                return callback({ partNumbers: partNumbers, warehousingHistories: warehousingHistories, searchText: req.query.searchText, searchStartDate, searchEndDate })
              })
          }

          if (!result.length) {
            SubPartNumber.findAll({
              where: { name: { [Op.like]: `%${req.query.searchText}%` } },
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
                  order: [['createdAt', 'DESC'], ['updatedAt', 'DESC']],
                  raw: true,
                  nest: true
                })
                searchStartDate = req.query.startDate
                searchEndDate = req.query.endDate
                if (warehousingHistories) {
                  for (i = 0; i < warehousingHistories.length; i++) { warehousingHistories[i].textCreatedAt = `${warehousingHistories[i].createdAt.getFullYear()}/${warehousingHistories[i].createdAt.getMonth() + 1}/${warehousingHistories[i].createdAt.getDate()}` }
                }
                return callback({ partNumbers: subPartNumbers, warehousingHistories: warehousingHistories, searchText: req.query.searchText, searchStartDate, searchEndDate })
              })
          }
        })
    }
  },

  //取得今天日期並渲染入庫&出庫頁面
  getWarehousingAndShipping: (req, res, callback) => {
    const todayYear = new Date().getFullYear()
    if ((new Date().getMonth() + 1) <= 9) { todayMonth = `0${new Date().getMonth() + 1}` } else { todayMonth = `${new Date().getMonth() + 1}` }
    if ((new Date().getDate() + 1) <= 9) { todayDate = `0${new Date().getDate()}` } else { todayDate = `${new Date().getDate()}` }
    const today = `${todayYear}-${todayMonth}-${todayDate}`
    return callback({ today })
  },


  outsourcinglist: {
    async post(req, res, callback) {  // 新增一項外包
      try {
        const outsourcingFormDataList = JSON.parse(req.body.outsourcinglist)
        console.log(outsourcingFormDataList)
        if (!outsourcingFormDataList.partNumberId) { throw new Error('品番號不可空白') }
        if (!outsourcingFormDataList.partnerFactoryId) { throw new Error('協力商不可空白') }
        if (!outsourcingFormDataList.productionProcessItemId) { throw new Error('製程項目不可空白') }
        if (!outsourcingFormDataList.quantity) { throw new Error('發包數量空白') }
        if (!outsourcingFormDataList.actionDate) { throw new Error('發包時間空白') }
        const outsourcinglist = await Outsourcinglist.create({
          partNumberId: Number(outsourcingFormDataList.partNumberId) ? Number(outsourcingFormDataList.partNumberId) : null,
          subPartNumberId: Number(outsourcingFormDataList.subPartNumberId) ? Number(outsourcingFormDataList.subPartNumberId) : null,
          partnerFactoryId: Number(outsourcingFormDataList.partnerFactoryId),
          productionProcessItemId: Number(outsourcingFormDataList.productionProcessItemId),
          quantity: Number(outsourcingFormDataList.quantity),
          actionDate: new Date(outsourcingFormDataList.actionDate),
          estimatedReturnDate: outsourcingFormDataList.estimatedReturnDate ? new Date(outsourcingFormDataList.estimatedReturnDate) : null
        })
        return callback({ status: 'success', message: `成功新增外包清單`, outsourcinglists: outsourcinglist })
      }
      catch (error) {
        return callback({ status: 'error', message: `${error}` })
      }
    },

    async delete(req, res, callback) {  // 刪除一項外包
      try {
        const outsourcinglist = await Outsourcinglist.findByPk(req.params.id)
        outsourcinglist.destroy()
        return callback({ status: 'success', message: `成功刪除`, outsourcinglists: outsourcinglist })
      }
      catch (error) {
        return callback({ status: 'error', message: `${error}` })
      }
    },

    async put(req, res, callback) {  // 修改一項外包
      try {
        const outsourcinglist = await Outsourcinglist.findByPk(req.params.id)
        outsourcinglist.update({
          partNumberId: Number(req.body.partNumberId) ? Number(req.body.partNumberId) : null,
          subPartNumberId: Number(req.body.subPartNumberId) ? Number(req.body.subPartNumberId) : null,
          partnerFactoryId: Number(req.body.partnerFactoryId),
          productionProcessItemId: Number(req.body.productionProcessItemId),
          quantity: Number(req.body.quantity),
          actionDate: new Date(req.body.actionDate),
          estimatedReturnDate: req.body.estimatedReturnDate ? new Date(req.body.estimatedReturnDate) : null
        })
        return callback({ status: 'success', message: `成功修改`, outsourcinglists: outsourcinglist })
      }
      catch (error) {
        return callback({ status: 'error', message: `${error}` })
      }
    },

    async get(req, res, callback) {  // 取得All外包清單
      try {
        const outsourcinglist = await Outsourcinglist.findByPk(req.params.id, {
          attributes: ['id', 'quantity', 'actionDate', 'estimatedReturnDate'],
          include: [
            { model: PartNumber, attributes: ['id', 'name'] },
            { model: SubPartNumber, attributes: ['id', 'name'] },
            { model: PartnerFactories, attributes: ['id', 'name'] },
            { model: ProductionProcessItem, attributes: ['id', 'processname'] },
          ],
          raw: true,
          nest: true
        })

        if (!outsourcinglist.PartNumber.id) { delete outsourcinglist.PartNumber }
        if (!outsourcinglist.SubPartNumber.id) { delete outsourcinglist.SubPartNumber }

        return callback({ status: 'success', outsourcinglist: outsourcinglist })
      }
      catch (error) {
        return callback({ status: 'error', message: '取得資料錯誤' })
      }
    },

    async getAll(req, res, callback) {  // 取得All外包清單
      try {
        let outsourcinglists = await Outsourcinglist.findAll({
          attributes: ['id', 'quantity', 'actionDate', 'estimatedReturnDate'],
          include: [
            { model: PartNumber, attributes: ['id', 'name'] },
            { model: SubPartNumber, attributes: ['id', 'name'] },
            { model: PartnerFactories, attributes: ['id', 'name'] },
            { model: ProductionProcessItem, attributes: ['id', 'processName'] },
          ],
          raw: true,
          nest: true
        })

        outsourcinglists.map(outsourcinglist => {
          if (!outsourcinglist.PartNumber.id) { delete outsourcinglist.PartNumber }
          if (!outsourcinglist.SubPartNumber.id) { delete outsourcinglist.SubPartNumber }
        })

        return callback({ status: 'success', outsourcinglists: outsourcinglists })
      }
      catch (error) {
        return callback({ status: 'error', message: '取得資料錯誤' })
      }
    },
  },

  partnerFactories: {  // 關於協力廠商
    async getAll(req, res, callback) { // 取得全部協力廠商
      try {
        const partnerFactories = await PartnerFactories.findAll({ raw: true, nest: true })
        return callback({ status: 'success', partnerFactories: partnerFactories })
      }
      catch (error) {
        return callback({ status: 'error', message: '取得資料錯誤' })
      }
    },
  },

  productionprocessitems: {  // 關於製程
    async getAll(req, res, callback) {  // 取得All製程項目
      try {
        const productionProcessItems = await ProductionProcessItem.findAll({ raw: true, nest: true })
        return callback({ status: 'success', productionProcessItems: productionProcessItems })
      }
      catch (error) {
        return callback({ status: 'error', message: '取得製程項目資料錯誤' })
      }
    },
  }
}


module.exports = warehouseService