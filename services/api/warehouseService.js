const db = require('../../models')
const Customer = db.Customer
const PartNumber = db.PartNumber
const SubPartNumber = db.SubPartNumber
const WarehousingHistory = db.WarehousingHistory
const { Op } = require("sequelize") //sequelize運算子

const warehouseServiceAPI = {
  getSubPartNumbers: async (req, res, callback) => {  //取得所有部品資料
    const subPartNumbers = await SubPartNumber.findAll({ raw: true, nest: true })
    callback({ subPartNumbers: subPartNumbers })
  },

  //入庫
  postWarehousing: async (req, res, callback) => {
    try {
      const warehousingList = JSON.parse(req.body.warehousingList)
      const partNumbers = warehousingList.filter(item => !item.isSubPart)
      const subPartNumbers = warehousingList.filter(item => item.isSubPart)
      // 子部品先入庫
      if (subPartNumbers.length) {
        for (const item of subPartNumbers) {
          const subPartNumber = await SubPartNumber.findByPk(item.productId)
          await subPartNumber.update({ quantity: Number(subPartNumber.quantity) + Number(item.quantity) })
        }
      }
      // 再檢查要入庫的一般部品之子部品數量夠一般部品使用
      if (partNumbers.length) {
        for (const item of partNumbers) {
          const partNumber = await PartNumber.findByPk(item.productId, { include: SubPartNumber })
          //先檢查要入庫的一般部品之子部品數量夠一般部品使用
          for (const subPartNumber of partNumber.SubPartNumbers) {
            const newQuantity = Number(subPartNumber.quantity) - Number(subPartNumber.usagePerUnit) * Number(item.quantity)
            if (newQuantity < 0) {
              for (const subItem of subPartNumbers) {
                const recoverSubPartNumber = await SubPartNumber.findByPk(subItem.productId)
                await recoverSubPartNumber.update({ quantity: Number(recoverSubPartNumber.quantity) - Number(subItem.quantity) })
              }
              throw new Error(`入庫錯誤，子部品 ${subPartNumber.name} 數量不足以提供 ${partNumber.name} 使用，請確認在庫數量。`)
            }
          }
        }

        for (const item of partNumbers) {
          const partNumber = await PartNumber.findByPk(item.productId, { include: SubPartNumber })
          await partNumber.update({ quantity: Number(partNumber.quantity) + Number(item.quantity) })
          for (const item of subPartNumbers) { //紀錄子部品入庫數量
            const subPartNumber = await SubPartNumber.findByPk(item.productId)
            await WarehousingHistory.create({  //新增出入庫歷史紀錄
              quntityOfWarehousing: Number(item.quantity),
              totalQuntity: Number(subPartNumber.quantity),
              note: item.note,
              customerId: Number(subPartNumber.customerId),
              subPartNumberId: Number(subPartNumber.id),
              createdAt: new Date(item.date)
            })
          }
          await WarehousingHistory.create({  //新增出入庫歷史紀錄
            quntityOfWarehousing: Number(item.quantity),
            totalQuntity: Number(partNumber.quantity),
            note: item.note,
            customerId: Number(partNumber.customerId),
            partNumberId: Number(partNumber.id),
            createdAt: new Date(item.date)
          })
          for (const subPartNumber of partNumber.SubPartNumbers) {
            const newQuantity = Number(subPartNumber.quantity) - Number(subPartNumber.usagePerUnit) * Number(item.quantity)
            await subPartNumber.update({ quantity: newQuantity })
          }
        }
        return callback({ status: 'success', message: '完成入庫紀錄' })
      }

      if (!subPartNumbers.length && !partNumbers.length) { throw new Error('無任何資料') }

      // 紀錄子部品入庫數量
      for (const item of subPartNumbers) { //紀錄子部品入庫數量
        const subPartNumber = await SubPartNumber.findByPk(item.productId)
        await WarehousingHistory.create({  //新增出入庫歷史紀錄
          quntityOfWarehousing: Number(item.quantity),
          totalQuntity: Number(subPartNumber.quantity),
          note: item.note,
          customerId: Number(subPartNumber.customerId),
          subPartNumberId: Number(subPartNumber.id),
          createdAt: new Date(item.date)
        })
      }
      return callback({ status: 'success', message: '完成入庫紀錄' })
    } catch (error) {
      return callback({ status: 'error', message: error.message })
    }
  },

  // 出庫
  postShipping: async (req, res, callback) => {
    try {
      const shippingList = JSON.parse(req.body.shipmentList)
      const partNumbers = shippingList.filter(item => !item.isSubPart)
      const subPartNumbers = shippingList.filter(item => item.isSubPart)
      //先檢查一般部品數量夠出貨
      for (const item of partNumbers) {
        const partNumber = await PartNumber.findByPk(item.productId)
        const newQuantity = Number(partNumber.quantity) - Number(item.quantity)
        if (newQuantity < 0) { throw new Error(`出貨錯誤，部品 ${partNumber.name} 數量不足以提供出貨，請確認在庫數量`) }
      }

      //檢查子部品數量夠出貨
      for (const item of subPartNumbers) {
        const subPartNumber = await SubPartNumber.findByPk(item.productId)
        const newQuantity = Number(subPartNumber.quantity) - Number(item.quantity)
        if (newQuantity < 0) { throw new Error(`出貨錯誤，子部品 ${subPartNumber.name} 數量不足以提供出貨，請確認在庫數量`) }
      }


      // 再進行扣除出貨數量
      //一般部品
      for (const item of partNumbers) {
        const partNumber = await PartNumber.findByPk(item.productId)
        const newQuantity = Number(partNumber.quantity) - Number(item.quantity)
        partNumber.update({ quantity: newQuantity })
        await WarehousingHistory.create({  //新增出入庫歷史紀錄
          quntityOfShipping: Number(item.quantity),
          totalQuntity: Number(partNumber.quantity),
          note: item.note,
          customerId: Number(partNumber.customerId),
          partNumberId: Number(partNumber.id),
          createdAt: new Date(item.date)
        })
      }

      //子部品
      for (const item of subPartNumbers) {
        const subPartNumber = await SubPartNumber.findByPk(item.productId)
        const newQuantity = Number(subPartNumber.quantity) - Number(item.quantity)
        subPartNumber.update({ quantity: newQuantity })
        await WarehousingHistory.create({  //新增出入庫歷史紀錄
          quntityOfShipping: Number(item.quantity),
          totalQuntity: Number(subPartNumber.quantity),
          note: item.note,
          customerId: Number(subPartNumber.customerId),
          subPartNumberId: Number(subPartNumber.id),
          createdAt: new Date(item.date)
        })
      }

      return callback({ status: 'success', message: '完成出貨紀錄' })

    } catch (error) {
      return callback({ status: 'error', message: error.message })
    }
  }
}

module.exports = warehouseServiceAPI