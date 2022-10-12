const express = require('express')
const router = express.Router()
const passport = require('../config/passport')

const userController = require('../controllers/api/userController.js')


router.post('/signin', userController.signIn)

module.exports = router