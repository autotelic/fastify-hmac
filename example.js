'use strict'

const hmac = require('.')

module.exports = function (fastify, options, next) {
  fastify.register(hmac, {
    sharedSecret: 'topSecret',
    extractSecret: () => {}
  })

  fastify.post('/', (req, reply) => {
    reply.type('application/json')
    reply.send({ hello: 'world' })
  })
  next()
}
