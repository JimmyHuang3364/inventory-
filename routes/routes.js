const express = require('express')
const router = express.Router()
const userContorller = require('../controllers/userController.js')
const adminContorller = require('../controllers/adminController.js')
const inventoryController = require('../controllers/inventoryController.js')
const passport = require('passport')

const authenticated = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next()
  }
  res.redirect('/signin')
}

const authenticateAdmin = (req, res, next) => {
  if (req.isAuthenticated()) {
    if (req.user.isAdmin) { return next() }
    return res.redirect('/')
  }
  res.redirect('/signin')
}

router.get('/signin', userContorller.signInPage) //瀏覽登入頁面
router.post('/signin', passport.authenticate('local', { failureRedirect: '/signin', failureFlash: true }), userContorller.signIn) //發出登入請求
router.get('/signup', authenticateAdmin, adminContorller.signUpPage) //瀏覽使用者註冊頁面
router.post('/signup', authenticateAdmin, adminContorller.signUp) //發出新使用者註冊請求
router.get('/logout', userContorller.logOut) //發出登出請求

router.get('/', authenticated, (req, res) => { res.redirect('/inventory') }) //轉入瀏覽主頁面
router.get('/inventory', authenticated, inventoryController.getInventory) //瀏覽主頁面

router.get('/password', authenticated, userContorller.changePasswordPage) //瀏覽變更密碼頁面
router.put('/password/:id', authenticated, userContorller.putPassword) //發出更新密碼請求

router.get('/products', (req, res) => { res.send(`OOPS!!  施工中...`) }) //瀏覽所有產品頁面(尚未完成)

router.get('/customers', (req, res) => { res.render('customers') }) //瀏覽所有客戶頁面

router.get('/warehouse', (req, res) => { res.render('warehouse') }) //瀏覽在庫查詢頁面

router.get('/Warehousing', (req, res) => { res.render('Warehousing') }) //瀏覽入庫頁面

router.get('/Shipment', (req, res) => { res.render('Shipment') }) //瀏覽出貨頁面

module.exports = router