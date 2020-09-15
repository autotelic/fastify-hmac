'use strict'

const hmac = require('..')

async function app (fastify, options) {
  fastify.register(hmac, {
    sharedSecret: 'topSecret',
    algorithmMap: {
      hs2019: {
        'test-key-a': 'sha512',
        'test-key-b': 'sha256'
      }
    }
  })

  fastify.post('/foo', async (request, reply) => {
    reply.send({ foo: 'bar' })
  })
}

module.exports = app
