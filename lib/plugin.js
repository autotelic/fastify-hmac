'use strict'

const createError = require('http-errors')

function plugin (pluginOptions) {
  const defaultOptions = {
    sharedSecret: null,
    verificationError: 'Unauthorized',
    verificationErrorMessage: 'Signature verification failed',
    extractSignature: () => {},
    constructSignatureString: () => {}
  }

  const options = {
    ...defaultOptions,
    ...pluginOptions
  }

  function verificationHook (req, reply, next) {
    if (options.sharedSecret === null) {
      return next(new Error('missing shared secret'))
    }

    return next(new createError[options.verificationError](options.verificationErrorMessage))
  }

  return verificationHook
}

module.exports = plugin
