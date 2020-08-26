'use strict';

const hmac = require('.');
const {
  extractShopifySignature,
  constructShopifySignature,
} = require('./lib/shopifyHMAC');

module.exports = function (fastify, options, next) {
  fastify.register(hmac, {
    sharedSecret: 'hush',
    verificationErrorMessage: 'Shopify HMAC parameter verification failed',
    extractSignature: extractShopifySignature,
    constructSignatureString: constructShopifySignature,
    getAlgorithm: () => 'sha256',
    getDigest: () => 'hex',
  });

  fastify.post('/foo', (req, reply) => {
    reply.type('application/json');
    reply.send({ hello: 'shopify' });
  });
  next();
};
