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

router.get('/signin', userContorller.signInPage)
router.post('/signin', passport.authenticate('local', { failureRedirect: '/signin', failureFlash: true }), userContorller.signIn)
router.get('/logout', userContorller.logOut)

router.get('/', authenticated, (req, res) => { res.redirect('/inventory') })
router.get('/inventory', authenticated, inventoryController.getInventory)

router.get('/products', (req, res) => { res.send(`OOPS!!  施工中...`) })

router.get('/customers', (req, res) => { res.render('customers') })

router.get('/warehouse', (req, res) => { res.render('warehouse') })

router.get('/Warehousing', (req, res) => { res.render('Warehousing') })

router.get('/Shipment', (req, res) => { res.render('Shipment') })
module.exports = router