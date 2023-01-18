const express = require('express')
const router = express.Router()
const passport = require('../config/passport')
const multer = require('multer')
const upload = multer()
const userController = require('../controllers/api/userController.js')
const warehouseController = require('../controllers/api/warehouseController.js')
const managerController = require('../controllers/api/managerController.js')

const authenticated = passport.authenticate('jwt', { session: false }) //確認登入狀態

const authenticateManager = (req, res, next) => { //確認是否為manager
  if (req.isAuthenticated()) {
    if (req.user.permissionLevel <= 2 & req.user.permissionLevel > 0) { return next() }
    return res.json({
      status: 'error',
      message: '權限不足'
    })
  }
  res.json({
    status: 'error',
    message: '尚未登入'
  })
}

router.post('/signin', passport.authenticate('local', { session: false }), userController.signIn)
router.post('/manager/users/signup', authenticated, authenticateManager, upload.array(), managerController.signUp) //發出新使用者註冊請求
router.get('/warehouse/partnumbers', authenticated, warehouseController.getPartNumbers)
router.get('/warehouse/subpartnumbers', authenticated, warehouseController.getSubPartNumbers) //取得所有子部品資料
router.get('/warehouse/partnumbers/search', authenticated, warehouseController.getSearchPartNumbers) //關鍵字條件搜尋部品番
router.post('/warehouse/warehousing', authenticated, upload.array(), warehouseController.postWarehousing) //部品入庫
router.post('/warehouse/shipping', authenticated, upload.array(), warehouseController.postShipping) //部品出貨

router.get('/manager/users', authenticated, authenticateManager, managerController.getUsers) //取得User清單資料
router.delete('/manager/users/:id', authenticated, authenticateManager, managerController.deleteUser) //刪除User資料
router.get('/manager/partnumbers', authenticated, authenticateManager, managerController.getParNumbers) //取得部品清單資料
router.get('/manager/partnumbers/search', authenticated, authenticateManager, managerController.getSearchPartNumbers) //關鍵字搜尋部品番
router.post('/manager/partnumber/create', authenticated, authenticateManager, upload.array(), managerController.postCreatePartNumber) //發出新增部品請求
router.get('/manager/partnumbers/:id/', authenticated, authenticateManager, managerController.getPartNumber) //取得特一一般部品資料頁
router.put('/manager/partnumbers/:id', authenticated, authenticateManager, upload.array(), managerController.putPartNumber) //更新一般部品資料
router.delete('/manager/partnumbers/:id', authenticated, authenticateManager, managerController.deletePartNumber) //刪除一般部品
router.get('/manager/subpartnumbers/:id', authenticated, authenticateManager, managerController.getSubPartNumber) //取得特一子部品資料頁
router.put('/manager/subpartnumbers/:id', authenticated, authenticateManager, upload.array(), managerController.putSubPartNumber) //更新子部品
router.delete('/manager/subpartnumbers/:id', authenticated, authenticateManager, managerController.deleteSubPartNumber) //刪除子部品
router.get('/manager/customers', authenticated, authenticateManager, managerController.getCustomers) //取得所有客戶資料
router.get('/manager/customers/:id', authenticated, authenticateManager, managerController.getCustomer) //取得其一客戶資料
router.put('/manager/customers/:id', authenticated, authenticateManager, upload.array(), managerController.putCustomer) //發出修改客戶資料請求
router.delete('/manager/customers/:id', authenticated, authenticateManager, managerController.deleteCustomer) //發出刪除客戶資料請求
router.post('/manager/customers/create', authenticated, authenticateManager, upload.array(), managerController.postCustomer) //發出新增客戶請求
router.get('/manager/WarehousingHistories', authenticated, authenticateManager, managerController.getWarehousingHistories) //取得出入庫歷史紀錄資料
router.get('/manager/WarehousingHistories/search', authenticated, authenticateManager, managerController.getSearchWarehousingHistories) //關鍵字條件搜尋出入庫歷史紀錄頁
router.delete('/manager/WarehousingHistories/:id', authenticated, authenticateManager, managerController.deleteWarehousingHistories) //刪除特一出入庫歷史紀錄

router.put('/user/password/:id', authenticated, upload.array(), userController.putPassword) //發出更新密碼請求

router.get('/get_current_user', authenticated, userController.getCurrentUser)

// partner_factories
router.post('/manager/partner_factories/create', authenticated, authenticateManager, upload.array(), managerController.partnerFactories.post) //發出新增協力廠商
router.delete('/manager/partner_factories/:id', authenticated, authenticateManager, managerController.partnerFactories.delete) //刪除特一協力廠商資料
router.put('/manager/partner_factories/:id', authenticated, authenticateManager, upload.array(), managerController.partnerFactories.put) //修改特一協力廠商資料
router.get('/manager/partner_factories/:id', authenticated, authenticateManager, managerController.partnerFactories.get) //取得特一協力廠商資料
router.get('/manager/partner_factories', authenticated, authenticateManager, managerController.partnerFactories.getAll) //取得所有協力廠商資料
router.get('/partner_factories', authenticated, warehouseController.partnerFactories.getAll) //取得所有外包資料

// production_process_items
router.post('/manager/production_process_items/create', authenticated, authenticateManager, upload.array(), managerController.productionprocessitems.post) //發出新增製程項目
router.delete('/manager/production_process_items/:id', authenticated, authenticateManager, managerController.productionprocessitems.delete) //刪除特一製程項目資料
router.put('/manager/production_process_items/:id', authenticated, authenticateManager, upload.array(), managerController.productionprocessitems.put) //修改特一製程項目資料
router.get('/manager/production_process_items', authenticated, authenticateManager, managerController.productionprocessitems.getAll) //取得所有製程項目資料
router.get('/production_process_items', authenticated, warehouseController.productionprocessitems.getAll) //取得所有製程項目資料

// outsourcinglist
router.post('/warehouse/outsourcinglist/create', authenticated, upload.array(), warehouseController.outsourcinglist.post) //發出新增外包
router.post('/warehouse/outsourcinglist/:id/done', authenticated, upload.array(), warehouseController.outsourcinglist.done) //該外包完成回廠
router.delete('/warehouse/outsourcinglist/:id', authenticated, warehouseController.outsourcinglist.delete) //刪除外包資料
router.put('/warehouse/outsourcinglist/:id', authenticated, upload.array(), warehouseController.outsourcinglist.put) //修改外包資料
router.get('/warehouse/outsourcinglist/:id', authenticated, warehouseController.outsourcinglist.get) //取得特一外包資料
router.get('/warehouse/outsourcinglist', authenticated, warehouseController.outsourcinglist.getAll) //取得所有外包資料


module.exports = router