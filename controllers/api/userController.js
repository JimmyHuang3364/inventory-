const bcrypt = require('bcryptjs')
const db = require('../../models')
const User = db.User

// JWT
const jwt = require('jsonwebtoken')

let userController = {
  signIn: (req, res) => {
    console.log('送出登入資料')
    // 檢查必要資料
    if (!req.body.name || !req.body.password) {
      return res.json({ status: 'error', message: "required fields didn't exist" })
    }
    // 檢查 user 是否存在與密碼是否正確
    let username = req.body.name
    let password = req.body.password

    User.findOne({ where: { name: username } }).then(user => {
      if (!user) return res.status(401).json({ status: 'error', message: '無此使用者' })
      if (!bcrypt.compareSync(password, user.password)) {
        return res.status(401).json({ status: 'error', message: '密碼錯誤' })
      }
      // 簽發 token
      var payload = { id: user.id }
      var token = jwt.sign(payload, process.env.JWT_SECRET)
      return res.json({
        status: 'success',
        message: 'ok',
        token: token,
        user: {
          id: user.id, name: user.name, permissionLevel: user.permissionLevel, isAdmin: user.isAdmin
        },
        statusText: 'ok'
      })
    })
  }
}

module.exports = userController