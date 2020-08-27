'use strict'

const fp = require('fastify-plugin')
const { plugin } = require('./lib')

module.exports = fp(function (fastify, options, next) {
  fastify.addHook('preValidation', plugin(options))
  next()
}, {
  name: 'fastify-hmac'
})
