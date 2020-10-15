module.exports.getStoreUrl = function () {
  if (process.env.NODE_ENV === 'development') {
    return 'http://localhost:1337';
  }

  if (process.env.NODE_ENV === 'staging') {
    return 'https://staging.fustic.store';
  }

  return 'https://fustic.store';
}
