'use strict'

const fp = require('fastify-plugin')
const { Unauthorized } = require('http-errors')
const {
  constructSignatureString,
  extractSignature,
  getAlgorithm,
  getDigest
} = require('./lib')

const DEFAULT_ENCODING = 'base64'
const DEFAULT_ERROR_MESSAGE = 'Signature verification failed'

function fastifyHMAC (fastify, options, next) {
  const pluginOptions = {
    algorithmMap: {},
    constructSignatureString,
    digestEncoding: DEFAULT_ENCODING,
    extractSignature,
    getAlgorithm,
    getDigest,
    getSignatureEncoding: () => DEFAULT_ENCODING,
    sharedSecret: null,
    validateRequests: true,
    verificationError: () => new Unauthorized(DEFAULT_ERROR_MESSAGE),
    ...options
  }

  if (pluginOptions.sharedSecret === null) {
    next(new Error('missing shared secret'))
  }

  function validateHMAC (callback) {
    const request = this
    const {
      extractSignature,
      constructSignatureString,
      verificationError
    } = pluginOptions

    try {
      if (extractSignature(request, pluginOptions) === constructSignatureString(request, pluginOptions)) {
        return callback ? callback() : true
      }
      throw Error(DEFAULT_ERROR_MESSAGE)
    } catch (e) {
      const error = verificationError(e.message)
      return callback ? callback(error) : error
    }
  }

  fastify.decorateRequest('validateHMAC', validateHMAC)

  if (pluginOptions.validateRequests) {
    fastify.addHook('preValidation', function (request, reply, next) {
      request.validateHMAC(next)
    })
  }

  next()
}

module.exports = fp(fastifyHMAC, {
  name: 'fastify-hmac'
})
