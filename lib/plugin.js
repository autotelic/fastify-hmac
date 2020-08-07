'use strict'

const createError = require('http-errors')
const parseSignatureHeader = require('./parseSignatureHeader')
const extractSignature = require('./extractSignature')

function plugin (pluginOptions) {
  const defaultOptions = {
    sharedSecret: null,
    verificationError: 'Unauthorized',
    verificationErrorMessage: 'Signature verification failed',
    parseSignatureHeader,
    extractSignature,
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

    try {
      const parsedSignatureHeader = parseSignatureHeader(req)
      extractSignature(parsedSignatureHeader)
    } catch (error) {
      console.log(error)
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
