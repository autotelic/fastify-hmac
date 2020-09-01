# fastify-hmac

[![js-standard-style](https://img.shields.io/badge/code%20style-standard-brightgreen.svg?style=flat)](http://standardjs.com/)

Fastify plugin for HMAC signatures.

## How it works

Verifies that http messages are signed according to [IETF draft standards][1].

## Install

```shell
npm i @autotelic/fastify-hmac
```

## Usage

- Register plugin. This will decorate your `fastify` instance with a request method `HMACValidate`.
  - During registration, provide a configuration object that contains the following:
    - A `sharedSecret` string
    - A `getAlgorithm` function that returns an algorithm string
    - A `getDigest` function that returns a digest string
    - Optional configuration properties
      - A `verificationError` string - default: 'Unauthorized'
      - A `verificationErrorMessage` string - default: 'Signature verification failed'
      - A `extractSignature` method - [default](#default_extractSignature_method): A method that extracts properties from a request Signature Header constructed according to [IETF draft standards][1]
      - A `constructSignatureString` method - [default](#default_constructSignatureString_method): A method that constructs a Signature digest string from the key material detailed in the request Signature header according to [IETF draft standards][1]
- Add a [global](#global_hook_example) or [route level](#route_level_hook_example) `preValidation` hook to your application.
  - **Note:** For verification of HMAC signatures that include a body Digest header as HMAC key material, the `validateHMAC` step must take place on the `preValidation` lifecycle step as the fastify request body parsing takes place just prior to `preValidation`. Prior to `preValidation`, `request.body` will always be `null`.

### Global Hook Example

```js
module.exports = function (fastify, options, next) {
  fastify.register(require('fastify-hmac'), {
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

```

#### Run the example:

```
npm run example:hook -- -l info -w
```

### Route Level Hook Example

```js
module.exports = function (fastify, options, next) {
  fastify.register(require('fastify-hmac'), {
    sharedSecret: 'topSecret',
    getAlgorithm: () => 'sha512',
    getDigest: () => 'base64'
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

```

#### Run the example:

```
npm run example:decorator -- -l info -w
```

### Example: Shopify HMAC Query Parameter Verification

The `extractSignature` and `constructSignatureString` methods can also be entirely replaced during registration by passing in new methods. This example shows how this plugin can be modified to verify Shopify Query String HMAC parameters instead of Signature headers. 

```js
const {
  extractShopifySignature,
  constructShopifySignature
} = require('./lib/shopifyHMAC')

module.exports = function (fastify, options, next) {
  fastify.register(require('fastify-hmac'), {
    sharedSecret: 'hush',
    verificationErrorMessage: 'Shopify HMAC parameter verification failed',
    extractSignature: extractShopifySignature,
    constructSignatureString: constructShopifySignature,
    getAlgorithm: () => 'sha256',
    getDigest: () => 'hex'
  })

  fastify.addHook('preValidation', (request, reply, next) => {
    try {
      request.validateHMAC(request, reply, next)
    } catch (err) {
      reply.send(err)
    }
  })

  fastify.post('/foo', (req, reply) => {
    reply.type('application/json')
    reply.send({ hello: 'shopify' })
  })
  next()
}
```

#### Run the example
```sh
npm run example:shopify -- -l info -w
```

## Default extractSignature Method

**TODO**

## Default constructSignatureString Method

**TODO**

## License

MIT


[1]: https://datatracker.ietf.org/doc/draft-ietf-httpbis-message-signatures/