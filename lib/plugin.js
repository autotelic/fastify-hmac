'use strict'

const createError = require('http-errors')
const extractSignature = require('./extractSignature')
const constructSignatureString = require('./constructSignatureString')

function plugin (pluginOptions) {
  const defaultOptions = {
    sharedSecret: null,
    verificationError: 'Unauthorized',
    verificationErrorMessage: 'Signature verification failed',
    extractSignature,
    constructSignatureString,
    getAlgorithm: () => {
      throw new Error('No getAlgorithm function provided.')
    },
    getDigest: () => {
      throw new Error('No getDigest function provided.')
    }
  }

  const options = {
    ...defaultOptions,
    ...pluginOptions
  }

  function verificationHook (req, reply, next) {
    if (options.sharedSecret === null) {
      return next(new Error('missing shared secret'))
    }

    try {
      if (options.extractSignature(req) === options.constructSignatureString(req, options)) {
        return next()
      }
    } catch (error) {
      req.log.error(error)
    }

    return next(
      new createError[options.verificationError](
        options.verificationErrorMessage
      )
    )
  }

  return verificationHook
}

module.exports = plugin
