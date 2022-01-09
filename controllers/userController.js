const userService = require('../services/userService.js')

const userContorller = {
  signInPage: (req, res) => {
    return res.render('signin')
  },
  signIn: (req, res) => {
    req.flash('success_messages', '登入成功')
    return res.redirect('/inventory')
  },
  logOut: (req, res) => {
    req.flash('success_messages', '登出成功')
    req.logOut()
    return res.redirect('/signin')
  },
  putPassword: (req, res) => {
    userService.putPassword(req, res, (data) => {
      if (data['status'] === 'error') {
        req.flash('error_messages', data['message'])
        return res.redirect('back')
      }
      else if (data['status'] === 'success') {
        req.flash('success_messages', data['message'])
        req.logOut()
        return res.redirect('/signin')
      }
    })
  },
  changePasswordPage: (req, res) => {
    return res.render('password')
  }
}

module.exports = userContorller