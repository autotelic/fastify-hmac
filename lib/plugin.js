'use strict'

const createError = require('http-errors')
const extractSignature = require('./extractSignature')
const constructSignatureString = require('./constructSignatureString')
const getDigest = require('./getDigest')

function plugin (pluginOptions) {
  const defaultOptions = {
    sharedSecret: null,
    verificationError: 'Unauthorized',
    verificationErrorMessage: 'Signature verification failed',
    extractSignature,
    constructSignatureString,
    getDigest,
    digestEncoding: 'base64',
    getAlgorithm: () => {
      throw new Error('No getAlgorithm function provided.')
    },
    getHMACEncoding: () => {
      throw new Error('No getHMACEncoding function provided.')
    }
  }

  const options = {
    ...defaultOptions,
    ...pluginOptions
  }

  function verificationHook (req, reply, next) {
    const {
      sharedSecret,
      extractSignature,
      constructSignatureString,
      verificationError,
      verificationErrorMessage
    } = options

    if (sharedSecret === null) {
      return next(new Error('missing shared secret'))
    }

    try {
      if (extractSignature(req) === constructSignatureString(req, options)) {
        return next()
      }
    } catch (error) {
      req.log.error(error)
    }

    return next(new createError[verificationError](verificationErrorMessage))
  }

  return verificationHook
}

module.exports = plugin
