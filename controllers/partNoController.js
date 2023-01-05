const partService = require('../services/partNoService.js')

const partNoController = {
  getParNumbers: (req, res) => {
    partService.getParNumbers(req, res, (data) => {
      return res.render('partnumbers', data)
    })
  }
}

module.exports = partNoController