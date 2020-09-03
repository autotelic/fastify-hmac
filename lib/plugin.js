'use strict'

const createError = require('http-errors')
const extractSignature = require('./extractSignature')
const constructSignatureString = require('./constructSignatureString')
const getDigest = require('./getDigest')
const getAlgorithm = require('./getAlgorithm')

function plugin (pluginOptions) {
  const defaultOptions = {
    sharedSecret: null,
    verificationError: 'Unauthorized',
    verificationErrorMessage: 'Signature verification failed',
    extractSignature,
    constructSignatureString,
    getDigest,
    digestEncoding: 'base64',
    getAlgorithm,
    algorithmMap: {},
    getSignatureEncoding: () => {
      throw new Error('No getSignatureEncoding function provided.')
    }
  }

  const options = {
    ...defaultOptions,
    ...pluginOptions
  }

  const optionsTypeValidations = {
    sharedSecret: 'string',
    verificationError: 'string',
    verificationErrorMessage: 'string',
    extractSignature: () => {},
    constructSignatureString: () => {},
    getDigest: () => {},
    digestEncoding: 'string',
    getAlgorithm: () => {},
    algorithmMap: {},
    getSignatureEncoding: () => {}
  }

  for (const [key, value] of Object.entries(optionsTypeValidations)) {
    if (!options[key] || typeof options[key] !== typeof value) {
      throw new Error(`${key} option does not exist or is not of type ${typeof value}`)
    }
  }

  function verificationHook (req, reply, next) {
    const {
      extractSignature,
      constructSignatureString,
      verificationError,
      verificationErrorMessage
    } = options

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
