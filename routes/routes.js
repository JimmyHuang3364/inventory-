const express = require('express')
const router = express.Router()

router.get('/signin', (req, res) => {
  res.render('signin')
})

router.get('/', (req, res) => {
  res.render('home')
})

router.get('/products', (req, res) => {
  res.send(`OOPS!!  施工中...`)
})

router.get('/customers', (req, res) => {
  res.render('customers')
})

router.get('/warehouse', (req, res) => {
  res.render('warehouse')
})

router.get('/Warehousing', (req, res) => {
  res.render('Warehousing')
})

router.get('/Shipment', (req, res) => {
  res.render('Shipment')
})
module.exports = router