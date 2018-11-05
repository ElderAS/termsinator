module.exports = {
  Capitalize(val) {
    return val.substring(0, 1).toUpperCase() + val.substring(1)
  },
  TrailingSlash(val, state = true) {
    let hasTrailing = val.substring(val.length - 1, val.length) === '/'
    if (state) return hasTrailing ? val : val + '/'
    else return hasTrailing ? val.substring(0, val.length - 1) : val
  },
}
