const managerService = require('../../services/managerService.js')



const managerController = {
  //取得所有使用者
  getUsers: (req, res) => {
    managerService.getUsers(req, res, (data) => {
      return res.json(data)
    })
  },
  deleteUser: (req, res) => {
    managerService.deleteUser(req, res, (data) => {
      return res.json(data)
    })
  },
  getParNumbers: (req, res) => {
    managerService.getParNumbers(req, res, (data) => {
      return res.json(data)
    })
  },
  // 取得特一一般部品資料
  getPartNumber: (req, res) => {
    managerService.getPartNumber(req, res, (data) => {
      return res.json(data)
    })
  },
  putPartNumber: (req, res) => {
    managerService.putPartNumber(req, res, (data) => {
      return res.json(data)
    })
  },
  postCreatePartNumber: (req, res) => {
    managerService.postCreatePartNumber(req, res, (data) => {
      return res.json(data)
    })
  },
  // 刪除子部品資料
  deleteSubPartNumber: (req, res) => {
    managerService.deleteSubPartNumber(req, res, (data) => {
      return res.json(data)
    })
  },

  // 刪除一般部品資料
  deletePartNumber: (req, res) => {
    managerService.deletePartNumber(req, res, (data) => {
      return res.json(data)
    })
  },
  // 取得子部品資料
  getSubPartNumber: (req, res) => {
    managerService.getSubPartNumber(req, res, (data) => {
      return res.json(data)
    })
  },
  // 更新子部品資料
  putSubPartNumber: (req, res) => {
    managerService.putSubPartNumber(req, res, (data) => {
      return res.json(data)
    })
  },
  getCustomer: (req, res) => {
    managerService.getCustomer(req, res, (data) => {
      return res.json(data)
    })
  },
  // 搜尋品番
  getSearchPartNumbers: (req, res) => {
    return managerService.getSearchPartNumbers(req, res, (data) => {
      return res.json(data)
    })
  },
  getCustomers: (req, res) => {
    managerService.getCustomers(req, res, (data) => {
      return res.json(data)
    })
  },
  postCustomer: (req, res) => {  //新增客戶
    managerService.postCustomer(req, res, (data) => {
      return res.json(data)
    })
  },
  putCustomer: (req, res) => {  //修改客戶
    managerService.putCustomer(req, res, (data) => {
      return res.json(data)
    })
  },
  deleteCustomer: (req, res) => {  //刪除客戶
    managerService.deleteCustomer(req, res, (data) => {
      return res.json(data)
    })
  },
  getWarehousingHistories: (req, res) => {
    return managerService.getWarehousingHistories(req, res, (data) => {
      return res.json(data)
    })
  },
  // 搜尋歷史紀錄
  getSearchWarehousingHistories: (req, res) => {
    return managerService.getSearchWarehousingHistories(req, res, (data) => {
      return res.json(data)
    })
  },
  // 刪除其中一WarehousingHistories資料
  deleteWarehousingHistories: (req, res) => {
    return managerService.deleteWarehousingHistories(req, res, (data) => {
      return res.json(data)
    })
  },
  signUp: (req, res) => {  //渲染新增使用者後注冊頁狀態
    return managerService.signUp(req, res, (data) => {
      return res.json(data)
    })
  },

  partnerFactories: {
    post(req, res, callback) {
      managerService.partnerFactories.post(req, res, (data) => {
        return res.json(data)
      })
    },
    delete(req, res, callback) {
      managerService.partnerFactories.delete(req, res, (data) => {
        return res.json(data)
      })
    },
    put(req, res, callback) {
      managerService.partnerFactories.put(req, res, (data) => {
        return res.json(data)
      })
    },
    get(req, res, callback) {
      managerService.partnerFactories.get(req, res, (data) => {
        return res.json(data)
      })
    }
  }
}

module.exports = managerController