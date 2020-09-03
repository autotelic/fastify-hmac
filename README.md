[![js-standard-style](https://img.shields.io/badge/code%20style-standard-brightgreen.svg?style=flat)](http://standardjs.com/)

<!-- omit in toc -->
# fastify-hmac

Fastify plugin for HMAC signatures.

- [How it works](#how-it-works)
- [Install](#install)
- [Usage](#usage)
  - [Global Hook Example](#global-hook-example)
    - [Run the example:](#run-the-example)
  - [Route Level Hook Example](#route-level-hook-example)
      - [Run the example:](#run-the-example-1)
- [Default Methods](#default-methods)
  - [Default extractSignature Method](#default-extractsignature-method)
  - [Default constructSignatureString Method](#default-constructsignaturestring-method)
  - [Default getDigest Method](#default-getdigest-method)
  - [Default getAlgorithm Method](#default-getalgorithm-method)
  - [Default getSignatureEncoding Method](#default-getsignatureencoding-method)
- [Replacing Default Methods](#replacing-default-methods)
  - [Example: Shopify HMAC Query Parameter Verification](#example-shopify-hmac-query-parameter-verification)
    - [Run the example](#run-the-example-2)
- [License](#license)

# How it works

Verifies that http messages are signed according to [IETF draft standards][1].

# Install

```shell
npm i @autotelic/fastify-hmac
```

# Usage

- Register plugin. This will decorate your `fastify` instance with a request method `HMACValidate`.
  - During registration, provide a configuration object that contains the following:
    - A `sharedSecret` string
    - A `algorithmMap` object that maps Signature header `algorithm` and `keyId` properties to a specific algorithm. See [`getAlgorithm`](#default-getAlgorithm-method) for default structure.
    - Optional configuration properties
      - A `verificationError` string - default: `'Unauthorized'`
      - A `verificationErrorMessage` string - default: `'Signature verification failed'`
      - A `digestEncoding` string - default: `'base64'`
      - A `getDigest` method - [default](#default-getDigest-method): A method that calculates and verifies a message Digest header to be used as input to the HMAC signature.
      - A `extractSignature` method - [default](#default-extractSignature-method): A method that extracts properties from a request Signature Header constructed according to [IETF draft standards][1]
      - A `constructSignatureString` method - [default](#default-constructSignatureString-method): A method that constructs a Signature digest string from the key material detailed in the request Signature header according to [IETF draft standards][1]
      - A `getAlgorithm` method - [default](#default-getAlgorithm-method): A method that returns an algorithm string from the `algorithmMap` configuration object.
      - A `getSignatureEncoding` method - [default](#default-getSignatureEncoding-method): A method that returns a `'base64'` encoding string to be used during HMAC signature construction.
- Add a [global](#global-hook-example) or [route level](#route-level-hook-example) `preValidation` hook to your application.
  - **Note:** For verification of HMAC signatures that include a body Digest header as HMAC key material, the `validateHMAC` step must take place on the `preValidation` lifecycle step as the fastify request body parsing takes place just prior to `preValidation`. Prior to `preValidation`, `request.body` will always be `null`.

## Global Hook Example

```js
module.exports = function (fastify, options, next) {
  fastify.register(require('fastify-hmac'), {
    sharedSecret: 'topSecret',
    algorithmMap: {
      hs2019: {
        'test-key-a': 'sha512',
        'test-key-b': 'sha256'
      }
    }
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

  fastify.post('/foo', (req, reply) => {
    reply.type('application/json')
    reply.send({ hello: 'foo' })
  })

  next()
}
```

### Run the example:

```
npm run example:hook -- -l info -w
```

## Route Level Hook Example

```js
module.exports = function (fastify, options, next) {
  fastify.register(require('fastify-hmac'), {
    sharedSecret: 'topSecret',
    algorithmMap: {
      hs2019: {
        'test-key-a': 'sha512',
        'test-key-b': 'sha256'
      }
    }
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

# Default Methods

## Default extractSignature Method

The `extractSignature` method returns the HMAC signature string found in a request Signature header constructed according to [IETF draft standards][1]. This signature is compared to the calculated HMAC signature from `constructSignatureString` to validate message authenticity. This method is called with one parameter, the fastify `request` object.

The method uses an internal helper method `parseSignatureString` to destructure the Signature header string into an object.

```js
extractSignature = (request) => {
  // ...
  return `<signature-string>`
}
```

## Default constructSignatureString Method

The `constructSignatureString` method returns a calculated HMAC signature string. This signature is compared to the HMAC signature string found in the request Signature header to validate message authenticity. This method is called with two parameters, the fastify `request` object and the plugin `options` object.

The default method:
1. Calls `getAlgorithm` from the plugin options object and uses its return value along with the `sharedSecret` property from the plugin options object to create a new HMAC object
2. Updates the HMAC object with the signature content string obtained from `getMessage`
3. Returns a calculated digest string encoded with the digest encoding string returned from `getSignatureEncoding` from the plugin options object.

The `getMessage` function returns a formatted string according to [IETF draft standards][1] containing the Signature content listed under `headers` in the request Signature header.

`getMessage` also uses an internal helper method `parseSignatureString` to destructure the Signature header string into an object.

```js
constructSignatureString = (request, options) => {
  // ...
  return `<signature-string>`
}
```

## Default getDigest Method

The `getDigest` method returns a Digest header string to be used when assembling the HMAC signature input. This method is called with two parameters, the fastify `request` object and the plugin `options` object. 

The default method:
1. Parses the request Digest header to determine the appropriate hashing algorithm
2. Hashes the request body using the algorithm
3. Applies the digest encoding found in options property `digestEncoding` - default: `'base64'`
3. Compares the new digest value with the value in the request Digest header
   - This will throw an error if the two values do not match
4. Reconstructs the digest header and returns a string in the format `<digest-algorithm>=<digest-value>`

**Note:** The default method assumes:
1. The Digest value is a hash of only the request body
2. The body content is always JSON
3. The request Digest header only contains a single digest value

```js
getDigest = (request, options) => {
  // ...
  return `<digest-algorithm>=<digest-value>`
}
```

## Default getAlgorithm Method

The `getAlgorithm` method returns a HMAC algorithm string to be used when generating a HMAC signature. This method is called with two parameters, the fastify `request` object and the plugin `options` object. The default method uses the `algorithmMap` object provided as an option during plugin registration with the `keyId` and `algorithm` Signature header properties to look up and return the appropriate algorithm string. e.g. `'sha256'` or `'sha512'`

The method uses an internal helper method `parseSignatureString` to destructure the Signature header string into an object.

```js
getAlgorithm = (request, options) => {
  // ...
  return '<valid-algorithm-string>'
}
```

For the default `getAlgorithm` an `algorithmMap` object matching the following format is expected:

```js
{
// const algorithmMap = {
//   [algorithm]: {
//     [keyId]: [algorithmString]
//   } 
// }

const algorithmMap = {
  hs2019: {
    'test-key-a': 'sha512',
    'test-key-b': 'sha256'
  } 
}
```

## Default getSignatureEncoding Method

The `getSignatureEncoding` method returns a digest encoding string to be used when generating a HMAC signature. This method is called with two parameters, the fastify `request` object and the plugin `options` object. The default method simply returns `'base64'`. 

```js
getSignatureEncoding = (request, options) => {
  // ...
  return '<valid-encoding-string>'
}
```

# Replacing Default Methods

## Example: Shopify HMAC Query Parameter Verification

The `extractSignature`, `constructSignatureString`, `getAlgorithm` and `getSignatureEncoding` methods can also be entirely replaced during registration by passing in new methods. This example shows how the plugin can be modified to verify Shopify Query String HMAC parameters instead of Signature headers. 

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
    getSignatureEncoding: () => 'hex'
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

### Run the example
```sh
npm run example:shopify -- -l info -w
```

# License

MIT

[1]: https://datatracker.ietf.org/doc/draft-ietf-httpbis-message-signatures/