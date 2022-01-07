const db = require('../models')
const User = db.User

const userContorller = {
  signInPage: (req, res) => {
    return res.render('signin')
  },
  signIn: (req, res) => {
    req.flash('success_messages', '登入成功')
    res.redirect('/inventory')
  },
  logOut: (req, res) => {
    req.flash('success_messages', '登出成功')
    req.logOut()
    res.redirect('/signin')
  }
}

module.exports = userContorller