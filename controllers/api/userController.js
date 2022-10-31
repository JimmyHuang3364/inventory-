const userService = require('../../services/userService.js')
const bcrypt = require('bcryptjs')
const db = require('../../models')
const User = db.User

// JWT
const jwt = require('jsonwebtoken')

let userController = {
  signIn: (req, res, next) => {
    try {
      const userData = req.user.toJSON()
      delete userData.password
      const token = jwt.sign(userData, process.env.JWT_SECRET, { expiresIn: '7d' }) // 簽發 JWT，效期為 30 天
      res.json({
        status: 'success',
        token,
        user: userData
      })
    } catch (err) {
      next(err)
    }
  },
  putPassword: (req, res) => {
    userService.putPassword(req, res, (data) => {
      return res.json(data)
    })
  },
  getCurrentUser: (req, res) => {
    return res.json({
      id: req.user.id,
      name: req.user.name,
      permissionLevel: req.user.permissionLevel,
      isAdmin: req.user.isAdmin,
    })
  }
}

module.exports = userController