const warehouseService = require('../../services/warehouseService.js')
const warehouseServiceAPI = require('../../services/api/warehouseService.js')

const warehouseController = {
  getPartNumbers: (req, res) => {
    warehouseService.getParNumbers(req, res, (data) => {
      data.partNumbers.map(partNumber => {
        delete partNumber.unitPrice
      })
      return res.json(data)
    })
  },
  // 取得子部品資料
  getSubPartNumbers: (req, res) => {
    warehouseServiceAPI.getSubPartNumbers(req, res, (data) => {
      return res.json(data)
    })
  },
  //關鍵字搜尋部品番
  getSearchPartNumbers: (req, res) => {
    warehouseService.getSearchPartNumbers(req, res, (data) => {
      return res.json(data)
    })
  },
  //入庫
  postWarehousing: (req, res) => {
    warehouseServiceAPI.postWarehousing(req, res, (data) => {
      console.log(data)
      return res.json(data)
    })
  },
  //出貨
  postShipping: (req, res) => {
    warehouseServiceAPI.postShipping(req, res, (data) => {
      console.log(data)
      return res.json(data)
    })
  },
}

module.exports = warehouseController