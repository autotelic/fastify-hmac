'use strict';

const hmac = require('.');
const extractSignature = require('./lib/shopifyHmac/extractHmacParameter');
const constructSignatureString = require('./lib/shopifyHmac/constructHmacParameter');

module.exports = function (fastify, options, next) {
  fastify.register(hmac, {
    sharedSecret: 'hush',
    verificationErrorMessage: 'Shopify HMAC parameter verification failed',
    extractSignature,
    constructSignatureString,
    getAlgorithm: () => 'sha256',
    getDigest: () => 'hex',
  });

  fastify.post('/foo', (req, reply) => {
    reply.type('application/json');
    reply.send({ hello: 'shopify' });
  });
  next();
};
