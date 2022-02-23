const res = require('express/lib/response')
const warehouseService = require('../services/warehouseService.js')

const warehouseController = {
  getParNumbers: (req, res) => {
    warehouseService.getParNumbers(req, res, (data) => {
      return res.render('warehouse', data)
    })
  },

  getWarehousing: (req, res) => {
    return res.render('warehousing')
  },

  getShipping: (req, res) => {
    return res.render('shipping')
  },

  postWarehousing: (req, res) => {
    warehouseService.postWarehousing(req, res, (data) => {
      if (data['status'] === 'success') {
        req.flash('success_messages', data['message'])
        return res.redirect('/warehouse/partnumbers')
      }

      if (data['status'] === 'error') {
        req.flash('error_messages', data['message'])
        return res.redirect('back')
      }
    })
  },

  postShipping: (req, res) => {
    warehouseService.postShipping(req, res, (data) => {
      if (data['status'] === 'success') {
        req.flash('success_messages', data['message'])
        return res.redirect('/warehouse/partnumbers')
      }

      if (data['status'] === 'error') {
        req.flash('error_messages', data['message'])
        return res.redirect('back')
      }
    })
  }
}

module.exports = warehouseController