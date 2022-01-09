const bcrypt = require('bcryptjs')
const db = require('../models')
const User = db.User
const Product = db.Product
const Customer = db.Customer

const adminService = {
  signUp: (req, res, callback) => { //新建使用者
    if (req.user.isAdmin) {
      return User.findOne({ where: { name: req.body.name } }).then((user) => {
        if (user) {
          return callback({ status: 'error', message: '使用者名稱重複!!' })
        } else {
          return User.create({
            name: req.body.name,
            password: bcrypt.hashSync(req.body.name, bcrypt.genSaltSync(10), null),
            isAdmin: false,
            permissionLevel: Number(req.body.permissionLevel)
          })
            .then((user) => {
              callback({ status: 'success', message: `使用者 ${user.name} 新增成功!!` })
            })
        }
      })
    } else {
      return callback({ status: 'error', message: '你無權限使用此操作' })
    }
  }
}

module.exports = adminService