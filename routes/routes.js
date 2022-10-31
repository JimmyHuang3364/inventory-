const express = require('express')
const router = express.Router()
const adminContorller = require('../controllers/adminController.js')
const managerController = require('../controllers/managerController.js')
const userContorller = require('../controllers/userController.js')
const inventoryController = require('../controllers/inventoryController.js')
const warehouseController = require('../controllers/warehouseController.js')
const passport = require('passport')
const partNoController = require('../controllers/partNoController.js')

const authenticated = (req, res, next) => { //確認登入狀態
  if (req.isAuthenticated()) {
    return next()
  }
  res.redirect('/signin')
}

const authenticateAdmin = (req, res, next) => { //確認是否為admin
  if (req.isAuthenticated()) {
    if (req.user.isAdmin) { return next() }
    return res.redirect('/')
  }
  res.redirect('/signin')
}

const authenticateManager = (req, res, next) => { //確認是否為manager
  if (req.isAuthenticated()) {
    if (req.user.permissionLevel <= 2 & req.user.permissionLevel > 0) { return next() }
    req.flash('error_messages', '你無權進入発注人頁面')
    return res.redirect('/warehouse')
  }
  res.redirect('/signin')
}

router.get('/signin', userContorller.signInPage) //瀏覽登入頁面
router.post('/signin', passport.authenticate('local', { failureRedirect: '/signin', failureFlash: true }), userContorller.signIn) //發出登入請求
router.get('/admin/signup', authenticateAdmin, adminContorller.signUpPage) //瀏覽使用者註冊頁面
router.post('/admin/signup', authenticateAdmin, adminContorller.signUp) //發出新使用者註冊請求
router.get('/logout', userContorller.logOut) //發出登出請求

router.get('/', authenticated, (req, res) => { res.redirect('/warehouse') }) //轉入瀏覽主頁面
// router.get('/inventory', authenticated, inventoryController.getInventory) //瀏覽主頁面

// about personal password
router.get('/user/password', authenticated, userContorller.changePasswordPage) //瀏覽變更密碼頁面
router.put('/user/password/:id', authenticated, userContorller.putPassword) //發出更新密碼請求
////

// about Customer
router.get('/manager/customers', authenticateManager, managerController.getCustomers) //瀏覽所有客戶頁面
router.get('/manager/customers/create', authenticateManager, managerController.getCreateCustomer) //瀏覽新增客戶頁面
router.post('/manager/customers/create', authenticateManager, managerController.postCustomer) //發出新增客戶請求
router.get('/manager/customers/:id', authenticateManager, managerController.getCustomer) //瀏覽其一客戶頁面
router.put('/manager/customers/:id', authenticateManager, managerController.putCustomer) //發出修改客戶資料請求
router.delete('/manager/customers/:id', authenticateManager, managerController.deleteCustomer) //發出刪除客戶資料請求
router.get('/manager/customers/:id/edit', authenticateManager, managerController.editCustomer) //瀏覽變更客戶資料頁
////

// about managerPartNumbers
router.get('/manager/partnumber/create', authenticateManager, managerController.getCreatePartNumber) //瀏覽新增部品頁面
router.post('/manager/partnumber/create', authenticateManager, managerController.postCreatePartNumber) //發出新增部品請求
router.get('/manager/partnumbers', authenticateManager, managerController.getParNumbers) //瀏覽部品清單頁面
router.get('/manager/partnumbers/search', authenticateManager, managerController.getSearchPartNumbers) //關鍵字搜尋部品番
router.delete('/manager/partnumbers/:id', authenticateManager, managerController.deletePartNumber) //刪除一般部品
router.put('/manager/partnumbers/:id', authenticateManager, managerController.putPartNumber) //更新一般部品資料
router.delete('/manager/subpartnumbers/:id', authenticateManager, managerController.deleteSubPartNumber) //刪除子部品
router.put('/manager/subpartnumbers/:id', authenticateManager, managerController.putSubPartNumber) //更新子部品
router.get('/manager/partnumbers/:id/edit', authenticateManager, managerController.getPartNumber) //瀏覽變更一般部品資料頁
router.get('/manager/subpartnumbers/:id/edit', authenticateManager, managerController.getSubPartNumber) //瀏覽變更子部品資料頁
////


// about Warehousing&shipping
router.get('/warehouse', authenticated, (req, res) => { res.redirect('/warehouse/partnumbers') }) //瀏覽在庫查詢頁面
router.get('/warehouse/partnumbers', authenticated, warehouseController.getParNumbers)
router.get('/warehouse/warehousing', authenticated, warehouseController.getWarehousing) //瀏覽部品入庫頁面
router.post('/warehouse/warehousing', authenticated, warehouseController.postWarehousing) //送出部品入庫
router.get('/warehouse/shipping', authenticated, warehouseController.getShipping) //瀏覽部品出貨頁面
router.post('/warehouse/shipping', authenticated, warehouseController.postShipping) //部品出貨
router.get('/warehouse/partnumbers/search', authenticateManager, warehouseController.getSearchPartNumbers) //關鍵字條件搜尋部品番
//

// about WarehousingHistories
router.get('/manager/WarehousingHistories', authenticateManager, managerController.getWarehousingHistories) //瀏覽出入庫歷史紀錄頁
router.get('/manager/WarehousingHistories/search', authenticateManager, managerController.getSearchWarehousingHistories) //關鍵字條件搜尋出入庫歷史紀錄頁
router.delete('/manager/WarehousingHistories/:id', authenticateManager, managerController.deleteWarehousingHistories) //刪除特一出入庫歷史紀錄
//

module.exports = router