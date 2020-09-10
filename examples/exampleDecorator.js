'use strict'

const hmac = require('../')

module.exports = function (fastify, options, next) {
  fastify.register(hmac, {
    sharedSecret: 'topSecret',
    algorithmMap: {
      hs2019: {
        'test-key-a': 'sha512',
        'test-key-b': 'sha256'
      }
    }
  })

  fastify.decorate('verifyHMAC', function (request, reply, next) {
    try {
      request.validateHMAC(request, reply, next)
    } catch (err) {
      reply.send(err)
    }
  })

  fastify.post('/', (req, reply) => {
    reply.type('application/json')
    reply.send({ hello: 'no validation needed' })
  })

  fastify.post('/foo',
    {
      preValidation: [fastify.verifyHMAC]
    },
    (req, reply) => {
      reply.type('application/json')
      reply.send({ hello: 'validated HMAC' })
    })
  next()
}
