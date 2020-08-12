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
    getAlgorithm: () => 'sha512',
    getDigest: () => 'base64'
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
      const sig0 = extractSignature(req)
      const sig1 = constructSignatureString(req, options)
      console.log({
        sig0,
        sig1,
        equal: sig0 === sig1
      })
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
