const express = require('express')
const router = express.Router()

router.get('/signin', (req, res) => {
  res.render('signin')
})

router.get('/', (req, res) => {
  res.render('index')
})

router.get('/products', (req, res) => {
  res.render('products')
})

router.get('/customers', (req, res) => {
  res.render('customers')
})
module.exports = router