let routes = require('./routes')

module.exports = (app, passport) => {
  app.use('/', routes)
}