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
      return res.json(data)
    })
  },
  //出貨
  postShipping: (req, res) => {
    warehouseServiceAPI.postShipping(req, res, (data) => {
      return res.json(data)
    })
  },

  outsourcinglist: {
    post(req, res, callback) {
      warehouseService.outsourcinglist.post(req, res, (data) => {
        return res.json(data)
      })
    },
    delete(req, res, callback) {
      warehouseService.outsourcinglist.delete(req, res, (data) => {
        return res.json(data)
      })
    },
    put(req, res, callback) {
      warehouseService.outsourcinglist.put(req, res, (data) => {
        return res.json(data)
      })
    },
    get(req, res, callback) {
      warehouseService.outsourcinglist.get(req, res, (data) => {
        return res.json(data)
      })
    },
    getAll(req, res, callback) {
      warehouseService.outsourcinglist.getAll(req, res, (data) => {
        return res.json(data)
      })
    }
  },

  partnerFactories: {
    getAll(req, res, callback) {
      warehouseService.partnerFactories.getAll(req, res, (data) => {
        return res.json(data)
      })
    }
  },

  productionprocessitems: {
    getAll(req, res, callback) {
      warehouseService.productionprocessitems.getAll(req, res, (data) => {
        return res.json(data)
      })
    }
  }
}

module.exports = warehouseController