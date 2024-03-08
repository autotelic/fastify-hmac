'use strict'

const fp = require('fastify-plugin')
const { Unauthorized, BadRequest } = require('http-errors')
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
    validateRequests: true,
    sharedSecret: null,
    verificationError: () => new Unauthorized(DEFAULT_ERROR_MESSAGE),
    ...options
  }

  if (pluginOptions.sharedSecret === null && pluginOptions.validateRequests) {
    next(new Error('Must provide shared secret in plugin options when validateRequests hook enabled'))
  }

  function validateHMAC (argSharedSecret = null, callback) {
    const request = this
    const {
      extractSignature,
      constructSignatureString,
      verificationError,
      sharedSecret: configSharedSecret
    } = pluginOptions

    if (configSharedSecret === null && argSharedSecret === null) {
      throw BadRequest('No shared secret provided')
    }

    // argSharedSecret takes precedence over configSharedSecret
    const options = {
      ...pluginOptions,
      ...(configSharedSecret !== null ? { sharedSecret: configSharedSecret } : {}),
      ...(argSharedSecret !== null ? { sharedSecret: argSharedSecret } : {})
    }

    try {
      if (extractSignature(request, pluginOptions) === constructSignatureString(request, options)) {
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
      request.validateHMAC(pluginOptions.sharedSecret, next)
    })
  }

  next()
}

module.exports = fp(fastifyHMAC, {
  name: 'fastify-hmac'
})
