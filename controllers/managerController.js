const { redirect } = require('express/lib/response')
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
  }
}

module.exports = managerController