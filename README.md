[![js-standard-style](https://img.shields.io/badge/code%20style-standard-brightgreen.svg?style=flat)](http://standardjs.com/)

<!-- omit in toc -->
# fastify-hmac

Fastify plugin for HMAC signature validation.

### How it works

Verifies that http messages are signed according to [IETF draft standards][1].

## Install

```shell
npm i @autotelic/fastify-hmac
```

## Usage

Registering the plugin, will decorate the `fastify` request with a `validateHMAC` method, and add a pre-validation hook to verify the HMAC signature of requests.

```js
const hmac = require('@autotelic/fastify-hmac')

async function app (fastify, options) {
  fastify.register(hmac, {
    sharedSecret: 'topSecret',
    algorithmMap: {
      hs2019: {
        'my-key-a': 'sha512',
        'my-key-b': 'sha256'
      }
    }
  })

  const hmacLogger = (error) => {
    if (error) {
      fastify.log.info(error.message)
    } else {
      fastify.log.info('HMAC Validated.')
    }
  }

  fastify.get('/foo', async (request, reply) => {
    request.validateHMAC(hmacLogger)
    reply.send({ foo: 'bar' })
  })
}

module.exports = app
```

## API

### `PluginOpts` : `Object`
##### Properties
| Name | Type | Description |
|------|------|-------------|
| `sharedSecret` | `string` | Secret used by client to generate signatures. (*required*) |
| `algorithmMap` | `{ [algorithm]: { [keyId]: string } }` | Maps the Signature header `algorithm` and `keyId` properties to a specific algorithm. (*required, unless providing `getAlgorithm`*) |
| `verificationError` | `(string) => Error` | Receives an error message and returns an error. By default, all errors returned are generic `Unauthenticated` http errors. This is to prevent sending sensitive error data to the client. (*optional*) |
| `digestEncoding` | `string` |Defaults to `'base64'`. (*optional*) |
| `getDigest` | `(FastifyRequest, PluginOpts) => string` | Calculates and verifies a message Digest header to be used as input to the HMAC signature. (*optional*) |
| `extractSignature` | `(FastifyRequest, PluginOpts) => string` | Extracts properties from a request Signature Header constructed according to [IETF draft standards][1]. (*optional*) |
| `constructSignatureString` | `(FastifyRequest, PluginOpts) => string` | Constructs a Signature digest string from the key material detailed in the request Signature header according to [IETF draft standards][1]. (*optional*) |
| `getAlgorithm` | `(FastifyRequest, PluginOpts) => string` | Returns an HMAC algorithm. By default this will use the `keyId` and `algorithm` values from the `Signature` header, to pull the appropriate value from the `algorithmMap`. (*optional*) |
| `getSignatureEncoding` | `(FastifyRequest, PluginOpts) => string` | Returns the encoding to be used during HMAC signature construction. (*optional - defaults to `() => 'base64'`*) |
| `validateRequests` | `boolean` | If `true` will add a `preValidation` hook to validate HMAC signatures. (*optional - defaults to `true`*) |

### `validateHMAC`: `Function`
##### Arguments
| Name | Type | Description |
|------|------|-------------|
| `callback` | `(Error?) => any` | Called with no args when HMAC validation is successful, and called with the error on failure. (*optional*) |

##### Return
If no callback is provided the `validateHMAC` request decorator will return `true` if HMAC validation is successful, and will return an `Error` if HMAC validation fails (*the `Error` wil be returned, not thrown*).

## Examples:

#### [Basic](./examples/basic.js)

```sh
npm run example:basic
```

#### [Shopify](./examples/shopify.js)

```sh
npm run example:shopify
```

### License

MIT

[1]: https://datatracker.ietf.org/doc/draft-ietf-httpbis-message-signatures/
