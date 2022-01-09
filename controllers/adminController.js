const adminService = require('../services/adminService.js')

const adminContorller = {
  signUpPage: (req, res) => { //渲染使用者注冊頁
    return res.render('admin/signup')
  },
  signUp: (req, res) => {
    adminService.signUp(req, res, (data) => {
      if (data['status'] === 'error') {
        req.flash('error_messages', data['message'])
        return res.redirect('back')
      }
      else {
        req.flash('success_messages', data['message'])
        return res.redirect('back')
      }
    })
  }
}

module.exports = adminContorller