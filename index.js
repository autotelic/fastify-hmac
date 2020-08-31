'use strict'

const fp = require('fastify-plugin')
const { plugin } = require('./lib')

function fastifyHMAC (fastify, options, next) {
  fastify.decorateRequest('HMACValidate', plugin(options))

  next()
}

module.exports = fp(fastifyHMAC, {
  name: 'fastify-hmac'
})
