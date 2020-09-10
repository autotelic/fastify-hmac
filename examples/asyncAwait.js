'use strict'

module.exports = async function (fastify, options) {
  fastify.register(require('../'), {
    sharedSecret: 'topSecret',
    algorithmMap: {
      hs2019: {
        'test-key-a': 'sha512'
      }
    }
  })

  fastify.addHook('preValidation', async (request, reply) => {
    try {
      await request.validateHMAC(request, reply)
    } catch (err) {
      reply.send(err)
    }
  })

  fastify.after(() => {
    fastify.get('/', (req, reply) => {
      reply.send({ hello: 'hmac' })
    })
  })
}
