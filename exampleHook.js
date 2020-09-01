'use strict'

const hmac = require('.')

module.exports = function (fastify, options, next) {
  fastify.register(hmac, {
    sharedSecret: 'topSecret',
    getAlgorithm: () => 'sha512',
    getDigest: () => 'base64'
  })
  fastify.addHook('preValidation', (request, reply, next) => {
    try {
      request.validateHMAC(request, reply, next)
    } catch (err) {
      reply.send(err)
    }
  })

  fastify.post('/', (req, reply) => {
    reply.type('application/json')
    reply.send({ hello: 'hmac' })
  })
  next()
}
