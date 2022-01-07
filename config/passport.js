const passport = require('passport')
const bcrypt = require('bcryptjs')
const LocalStrategy = require('passport-local').Strategy
const db = require('../models')
const User = db.User

passport.use(new LocalStrategy(
  // customize user field
  {
    usernameField: 'name',
    passwordField: 'password',
    passReqToCallback: true
  },
  // authenticate user
  (req, username, password, cb) => {
    console.log(username)
    User.findOne({ where: { name: username } }).then(user => {
      if (!user) return cb(null, false, req.flash('error_messages', '使用者不存在!!'))
      if (!bcrypt.compareSync(password, user.password)) return cb(null, false, req.flash('error_messages', '使用者或密碼錯誤!!'))
      return cb(null, user)
    })
  }
))


//序列化&反序列化
passport.serializeUser((user, cb) => {
  cb(null, user.id)
})
passport.deserializeUser((id, cb) => {
  User.findByPk(id).then(user => {
    user = user.toJSON()
    return cb(null, user)
  })
})

module.exports = passport