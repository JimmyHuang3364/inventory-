const db = require('../models')
const User = db.User
const bcrypt = require('bcryptjs')

const userService = {
  putPassword: (req, res, callback) => { // 變更密碼function
    if (req.body.newPassword === req.body.newPasswordCheck) {
      if (Number(req.params.id) === req.user.id) {
        return User.findByPk(req.user.id)
          .then((user) => {
            if (bcrypt.compareSync(req.body.password, user.password)) { // 檢查原始密碼
              console.log(`!!!!!!!EVENT!!!!!!!`)
              console.log(`ID:${req.user.id} name:${req.body.name}, the password is changed`)
              console.log(`!!!!!!!!!!!!!!!!!!!`)
              user.update({ password: bcrypt.hashSync(req.body.newPassword, bcrypt.genSaltSync(10), null) }) //加入雜湊並更新密碼
                .then(() => {
                  callback({ status: 'success', message: '變更密碼成功!!' })
                })
            }
            else { callback({ status: 'error', message: '原始密碼錯誤!!' }) }
          })
      }
      else {
        callback({ status: 'error', message: '變更密碼失敗!!' })
      }

    }
    else {
      callback({ status: 'error', message: '密碼與確認密碼不同' })
    }
  }
}

module.exports = userService