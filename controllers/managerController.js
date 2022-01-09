const managerService = require('../services/managerService.js')

const managerController = {
  getCustomers: (req, res) => {
    return res.render('manager/customers')
  },
  getCustomer: (req, res) => {
    return res.render('manager/createCustomer')
  },
  postCustomer: (req, res) => {
    managerService.postCustomer(req, res, (data) => {
      if (data['status'] === 'error') {
        return req.flash('error_messages', data['message'])
      } else {
        req.flash('success_messages', data['message'])
        return res.redirect('/manager/customers')
      }
    })
  }
}

module.exports = managerController