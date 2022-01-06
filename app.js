const express = require('express')
const exphbs = require('express-handlebars')
const app = express()
const port = 3000

app.engine('hbs', exphbs({ defaultLayout: 'main', extname: '.hbs' }))
app.set('view engine', 'hbs')

// app.get('/', (req, res) => {
//   res.render('home')
// })

app.listen(port, () => {
  console.log('server is running!!')
})

require('./routes')(app)

module.exports = app