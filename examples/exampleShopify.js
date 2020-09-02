'use strict'

const hmac = require('../')
const {
  extractShopifySignature,
  constructShopifySignature
} = require('../lib/shopifyHMAC')

module.exports = function (fastify, options, next) {
  fastify.register(hmac, {
    sharedSecret: 'hush',
    verificationErrorMessage: 'Shopify HMAC parameter verification failed',
    extractSignature: extractShopifySignature,
    constructSignatureString: constructShopifySignature,
    getAlgorithm: () => 'sha256',
    getSignatureEncoding: () => 'hex'
  })

  fastify.addHook('preValidation', (request, reply, next) => {
    try {
      request.validateHMAC(request, reply, next)
    } catch (err) {
      reply.send(err)
    }
  })

  fastify.post('/foo', (req, reply) => {
    reply.type('application/json')
    reply.send({ hello: 'shopify' })
  })
  next()
}
