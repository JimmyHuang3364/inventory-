const passport = require('passport')
const bcrypt = require('bcryptjs')
const LocalStrategy = require('passport-local')
const passportJWT = require('passport-jwt')
const JWTStrategy = passportJWT.Strategy
const ExtractJWT = passportJWT.ExtractJwt
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
    User.findOne({ where: { name: username } }).then(user => {
      if (!user) {
        req.flash('error_messages', '使用者不存在!!')
        return cb(null, false, { message: '使用者不存在!!' })
      }
      if (!bcrypt.compareSync(password, user.password)) {
        req.flash('error_messages', '使用者或密碼錯誤!!')
        return cb(null, false, { message: '使用者或密碼錯誤!!' })
      }
      return cb(null, user)
    })
  }
))

const jwtOptions = {
  jwtFromRequest: ExtractJWT.fromAuthHeaderAsBearerToken(),
  secretOrKey: process.env.JWT_SECRET
}

passport.use(new JWTStrategy(jwtOptions, (jwtPayload, cb) => {
  console.log(jwtOptions.secretOrKey)
  User.findByPk(jwtPayload.id)
    .then(user => cb(null, user))
    .catch(err => cb(err))
}))

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