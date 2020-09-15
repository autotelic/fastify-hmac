'use strict'

const hmac = require('../')
const {
  extractShopifySignature,
  constructShopifySignature
} = require('../lib/shopifyHMAC')

async function app (fastify, options) {
  fastify.register(hmac, {
    sharedSecret: 'hush',
    extractSignature: extractShopifySignature,
    constructSignatureString: constructShopifySignature,
    getAlgorithm: () => 'sha256',
    getSignatureEncoding: () => 'hex'
  })

  fastify.post('/foo', async (req, reply) => {
    reply.send({ hello: 'shopify' })
  })
}

module.exports = app
