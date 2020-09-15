'use strict'

const { test } = require('tap')
const fastifyHMAC = require('.')

const defaultOptions = {
  sharedSecret: 'test',
  algorithmMap: {
    hs2019: {
      'test-key-a': 'sha512',
      'test-key-b': 'sha256'
    }
  }
}

test('fastifyHMAC plugin - request decorator, without hook', async ({ is, same, teardown }) => {
  teardown(async () => fastify.close())
  const fastify = require('fastify')()

  fastify.register(fastifyHMAC, { ...defaultOptions, validateRequests: false })

  fastify.get('/test', (request, reply) => {
    reply.send({ hmacVerified: request.validateHMAC() })
  })

  await fastify.ready()

  const response = await fastify.inject({
    method: 'GET',
    url: '/test'
  })

  is(fastify.hasRequestDecorator('validateHMAC'), true)
  is(response.statusCode, 200)
  same(response.json(), { hmacVerified: { message: 'Signature verification failed' } })
})

test('fastifyHMAC plugin - hook enabled, request authorized', async ({ is, same, teardown }) => {
  teardown(async () => fastify.close())
  const fastify = require('fastify')()

  fastify.register(fastifyHMAC, defaultOptions)

  fastify.get('/foo', async (request, reply) => {
    reply.send({ hmacVerified: request.validateHMAC() })
  })

  await fastify.ready()

  const response = await fastify.inject({
    method: 'GET',
    url: '/foo',
    headers: {
      signature: 'keyId="test-key-a", algorithm="hs2019", headers="(request-target)", signature="8zJ7k7Cp4Gqfwfe2SYl6u3uqdUfa6PgZZ7Z0+e5+gV/3/UNUyQowMcbEb9Ni0MfGrDGZ9a04RJrIVcZNa0easA=="'
    }
  })

  is(response.statusCode, 200)
  same(response.json(), { hmacVerified: true })
})

test('fastifyHMAC plugin - hook enabled, request unauthorized', async ({ is, teardown }) => {
  teardown(async () => fastify.close())
  const fastify = require('fastify')()

  fastify.register(fastifyHMAC, defaultOptions)

  fastify.get('/test', async (request, reply) => {
    reply.send({ foo: 'bar' })
  })

  await fastify.ready()

  const response = await fastify.inject({
    method: 'GET',
    url: '/test',
    headers: {
      signature: 'keyId="test-key-a", algorithm="hs2019", signature="hey'
    }
  })

  is(response.statusCode, 401)
  is(response.json().error, 'Unauthorized')
  is(response.json().message, 'Signature verification failed')
})

test('fastifyHMAC plugin - no sharedSecret', async ({ rejects, teardown }) => {
  teardown(async () => fastify.close())
  const fastify = require('fastify')()

  fastify.register(fastifyHMAC, {})

  await rejects(fastify.ready(), Error('missing shared secret'))
})
