const managerService = require('../services/managerService.js')

const managerController = {

  getCustomers: (req, res) => {
    managerService.getCustomers(req, res, (data) => {
      return res.render('manager/customers', data)
    })
  },

  getCustomer: (req, res) => {
    managerService.getCustomer(req, res, (data) => {
      return res.render('manager/customer', data)
    })
  },

  getCreateCustomer: (req, res) => {
    res.render('manager/createCustomer')
  },

  postCustomer: (req, res) => {
    managerService.postCustomer(req, res, (data) => {
      if (data['status'] === 'error') {
        req.flash('error_messages', data['message'])
        return res.redirect('back')
      } else {
        req.flash('success_messages', data['message'])
        return res.redirect('/manager/customers')
      }
    })
  },

  editCustomer: (req, res) => {
    managerService.getCustomer(req, res, (data) => {
      return res.render('manager/createCustomer', data)
    })
  },

  putCustomer: (req, res) => {
    managerService.putCustomer(req, res, (data) => {
      req.flash('success_messages', data['message'])
      return res.redirect(`/manager/customers/${req.params.id}`)
    })
  },

  deleteCustomer: (req, res) => {
    managerService.deleteCustomer(req, res, (data) => {
      req.flash('success_messages', data['message'])
      return res.redirect('/manager/customers')
    })
  },

  getCreatePartNumber: (req, res) => {
    managerService.getCreatePartNumber(req, res, (data) => {
      return res.render('manager/createPartNumber', data)
    })
  },

  postCreatePartNumber: (req, res) => {
    managerService.postCreatePartNumber(req, res, (data) => {
      if (data['status'] === 'error') {
        req.flash('error_messages', data['message'])
        return res.redirect('back')
      } else {
        req.flash('success_messages', data['message'])
        return res.redirect('/manager/partnumbers')
      }
    })
  },

  getParNumbers: (req, res) => {
    managerService.getParNumbers(req, res, (data) => {
      return res.render('manager/partnumbers', data)
    })
  },

  // 刪除子部品資料
  deleteSubPartNumber: (req, res) => {
    managerService.deleteSubPartNumber(req, res, (data) => {
      req.flash('success_messages', data['message'])
      return res.redirect('back')
    })
  },

  // 刪除一般部品資料
  deletePartNumber: (req, res) => {
    managerService.deletePartNumber(req, res, (data) => {
      req.flash('success_messages', data['message'])
      return res.redirect('back')
    })
  },

  // 取得一般部品資料渲染編輯頁
  getPartNumber: (req, res) => {
    managerService.getPartNumber(req, res, (data) => {
      return res.render('manager/createPartNumber', data)
    })
  },

  // 取得子部品資料渲染編輯頁
  getSubPartNumber: (req, res) => {
    managerService.getSubPartNumber(req, res, (data) => {
      return res.render('manager/createPartNumber', data)
    })
  },

  // 更新一般部品資料
  putPartNumber: (req, res) => {
    managerService.putPartNumber(req, res, (data) => {
      if (data['status'] === 'error') {
        req.flash('error_messages', data['message'])
        return res.redirect('back')
      } else {
        req.flash('success_messages', data['message'])
        return res.redirect('/manager/partnumbers')
      }
    })
  },

  // 更新子部品資料
  putSubPartNumber: (req, res) => {
    managerService.putSubPartNumber(req, res, (data) => {
      if (data['status'] === 'error') {
        req.flash('error_messages', data['message'])
        return res.redirect('back')
      } else {
        req.flash('success_messages', data['message'])
        return res.redirect('/manager/partnumbers')
      }
    })
  },

  // 取得所有WarehousingHistories資料
  getWarehousingHistories: (req, res) => {
    return managerService.getWarehousingHistories(req, res, (data) => {
      return res.render('manager/warehousingHistories', data)
    })
  }
  // 取得所有WarehousingHistories資料
}

module.exports = managerController