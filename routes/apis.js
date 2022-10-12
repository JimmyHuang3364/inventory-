const express = require('express')
const router = express.Router()
const passport = require('../config/passport')

const userController = require('../controllers/api/userController.js')
const warehouseController = require('../controllers/api/warehouseController.js')

const authenticated = passport.authenticate('jwt', { session: false })

router.post('/signin', passport.authenticate('local', { session: false }), userController.signIn)

router.get('/warehouse/partnumbers', authenticated, warehouseController.getParNumbers)


module.exports = router