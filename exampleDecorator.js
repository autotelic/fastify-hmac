'use strict'

const hmac = require('.')

module.exports = function (fastify, options, next) {
  fastify.register(hmac, {
    sharedSecret: 'topSecret',
    getAlgorithm: () => 'sha512',
    getDigest: () => 'base64'
  })

  fastify.decorate('validateHMAC', function (request, reply, next) {
    try {
      request.HMACValidate(request, reply, next)
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
      preValidation: [fastify.validateHMAC]
    },
    (req, reply) => {
      reply.type('application/json')
      reply.send({ hello: 'validated HMAC' })
    })
  next()
}
