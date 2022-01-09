const managerService = require('../services/managerService.js')

const managerController = {
  getCustomers: (req, res) => {
    managerService.getCustomers(req, res, (data) => {
      return res.render('manager/customers', data)
    })
  },
  getCustomer: (req, res) => {
    managerService.getCustomer(req, res, (data) => {
      console.log(data)
      return res.render('manager/customer', data)
    })
  },
  getCreateCustomer: (req, res) => {
    return res.render('manager/createCustomer')
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
  }
}

module.exports = managerController