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

test('request decorator, without hook', async ({ equal, same, teardown }) => {
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

  equal(fastify.hasRequestDecorator('validateHMAC'), true)
  equal(response.statusCode, 200)
  same(response.json(), { hmacVerified: { message: 'Signature verification failed' } })
})

test('hook enabled, request authorized', async ({ equal, same, teardown }) => {
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

  equal(response.statusCode, 200)
  same(response.json(), { hmacVerified: true })
})

test('hook enabled, request unauthorized', async ({ equal, teardown }) => {
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

  equal(response.statusCode, 401)
  equal(response.json().error, 'Unauthorized')
  equal(response.json().message, 'Signature verification failed')
})

test('fastifyHMAC plugin - no sharedSecret, hook enabled', async ({ rejects, teardown }) => {
  teardown(async () => fastify.close())
  const fastify = require('fastify')()

  const options = {
    ...defaultOptions
  }
  delete options.sharedSecret

  fastify.register(fastifyHMAC, options)

  await rejects(fastify.ready())
})

test('no sharedSecret in options, hook not enabled, secret not passed in decorator', async ({ equal, has, teardown }) => {
  teardown(async () => fastify.close())
  const fastify = require('fastify')()

  const options = {
    ...defaultOptions,
    validateRequests: false
  }
  delete options.sharedSecret

  fastify.register(fastifyHMAC, options)

  fastify.get('/test', (request, reply) => {
    const validated = request.validateHMAC()
    reply.send({ hmacVerified: validated })
  })

  await fastify.ready()

  const response = await fastify.inject({
    method: 'GET',
    url: '/test'
  })

  equal(fastify.hasRequestDecorator('validateHMAC'), true)
  equal(response.statusCode, 400)
  has(response.json(), { message: 'No shared secret provided' })
})

test('no sharedSecret in options, hook not enabled, secret passed in decorator, authorized', async ({ equal, same, teardown }) => {
  teardown(async () => fastify.close())
  const fastify = require('fastify')()

  const options = {
    ...defaultOptions,
    validateRequests: false
  }
  delete options.sharedSecret

  fastify.register(fastifyHMAC, options)

  fastify.get('/foo', (request, reply) => {
    const validated = request.validateHMAC('test')
    reply.send({ hmacVerified: validated })
  })

  await fastify.ready()

  const response = await fastify.inject({
    method: 'GET',
    url: '/foo',
    headers: {
      signature: 'keyId="test-key-a", algorithm="hs2019", headers="(request-target)", signature="8zJ7k7Cp4Gqfwfe2SYl6u3uqdUfa6PgZZ7Z0+e5+gV/3/UNUyQowMcbEb9Ni0MfGrDGZ9a04RJrIVcZNa0easA=="'
    }
  })

  equal(fastify.hasRequestDecorator('validateHMAC'), true)
  equal(response.statusCode, 200)
  same(response.json(), { hmacVerified: true })
})

test('no sharedSecret in options, hook not enabled, secret passed in decorator, not authorized', async ({ equal, same, teardown }) => {
  teardown(async () => fastify.close())
  const fastify = require('fastify')()

  const options = {
    ...defaultOptions,
    validateRequests: false
  }
  delete options.sharedSecret

  fastify.register(fastifyHMAC, options)

  fastify.get('/foo', (request, reply) => {
    const validated = request.validateHMAC('test')
    reply.send({ hmacVerified: validated })
  })

  await fastify.ready()

  const response = await fastify.inject({
    method: 'GET',
    url: '/foo',
    headers: {
      signature: 'keyId="test-key-a", algorithm="hs2019", headers="(request-target)", signature="vivwFqXDfZ/SlUImUIyHuA2kMZAdsNoTQZTAZvjCHFEMBk4Gq7LIWL50Dfr3StO0+UUofTc2bFS9R68JDK+UfQ=="'
    }
  })

  equal(fastify.hasRequestDecorator('validateHMAC'), true)
  equal(response.statusCode, 200)
  same(response.json(), {
    hmacVerified: {
      message: 'Signature verification failed'
    }
  })
})
