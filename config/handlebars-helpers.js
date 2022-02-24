module.exports = {
  ifCond: function (a, b, options) {
    if (a === b) {
      return options.fn(this)
    }
    return options.inverse(this)
  },

  ifCheckSafety: function (a, b, options) {
    if (Number(a) < Number(b)) {
      return options.fn(this)
    }
    return options.inverse(this)
  }
}