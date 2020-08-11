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
    constructSignatureString
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
      console.log('##############################')
      const signature = extractSignature(req)
      const constructedSignature = constructSignatureString(
        req,
        options.sharedSecret
      )
      console.log(signature, constructedSignature)
      console.log('##############################')
      console.log({ areTheyEquivalent: signature === constructedSignature })
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
