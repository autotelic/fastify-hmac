'use strict'

const fp = require('fastify-plugin')
const { plugin } = require('./lib')

function fastifyHMAC (fastify, options, next) {
  fastify.decorateRequest('validateHMAC', plugin(options))

  next()
}

module.exports = fp(fastifyHMAC, {
  name: 'fastify-hmac'
})
