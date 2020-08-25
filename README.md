# fastify-hmac

[![js-standard-style](https://img.shields.io/badge/code%20style-standard-brightgreen.svg?style=flat)](http://standardjs.com/)

Fastify plugin for HMAC signatures.

## Install

```shell
npm i @autotelic/fastify-hmac
```

## Usage

- Require the plugin
- Provide configuration object that contains the following:
  - A `sharedSecret` string
  - A `getAlgorithm` function that returns an algorithm string
  - A `getDigest` function that returns a digest string

### Example:

```js
const hmac = require("fastify-hmac");

module.exports = function (fastify, options, next) {
  fastify.register(hmac, {
    sharedSecret: "topSecret",
    getAlgorithm: () => "sha512",
    getDigest: () => "base64",
  });

  fastify.post("/", (req, reply) => {
    reply.type("application/json");
    reply.send({ hello: "world" });
  });
  next();
};
```

### Run the example:

```
npm run example -- -l info -w
```

Send test messages to running server (running on localhost:3000 by default).

Examples:

HTTPie
```sh
http POST localhost:3000 Signature:'keyId="key-a", headers="(request-target) (created) (expires) host", signature="Nstb3q49bne90WmkbiZ9eyRtKCUmOWvc/kFyw/ftfLtqAXfRZGBk+hSJkXs0GRRm4Q/58c/pdIKj5DND11/fwQ==", created=1402170695, expires=1402170895'
```

cURL
```sh
curl --location --request POST 'localhost:3000' --header 'Signature: keyId="key-a", headers="(request-target) (created) (expires) host", signature="Nstb3q49bne90WmkbiZ9eyRtKCUmOWvc/kFyw/ftfLtqAXfRZGBk+hSJkXs0GRRm4Q/58c/pdIKj5DND11/fwQ==", created=1402170695, expires=1402170895'
```

Expected response:
```json
{
    "hello": "world"
}
```

#### Example: Shopify HMAC Query Parameter Verification

Run the example
```sh
npm run example:shopify -- -l info -w
```

HTTPie
```sh
http POST localhost:3000/foo 'code'=='0907a61c0c8d55e99db179b68161bc00' 'hmac'=='700e2dadb827fcc8609e9d5ce208b2e9cdaab9df07390d2cbca10d7c328fc4bf' 'shop'=='some-shop.myshopify.com' 'state'=='0.6784241404160823' 'timestamp'=='1337178173'
```

cURL
```sh
curl --location --request POST 'localhost:3000/foo?code=0907a61c0c8d55e99db179b68161bc00&hmac=700e2dadb827fcc8609e9d5ce208b2e9cdaab9df07390d2cbca10d7c328fc4bf&shop=some-shop.myshopify.com&state=0.6784241404160823&timestamp=1337178173'
```

Expected response:
```json
{
    "hello": "shopify"
}
```




## How it works

Verifies that http messages are signed according to [IETF draft standards](https://datatracker.ietf.org/doc/draft-ietf-httpbis-message-signatures/).

## License

MIT
