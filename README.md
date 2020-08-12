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

## How it works

Verifies that http messages are signed according to [IETF draft standards](https://datatracker.ietf.org/doc/draft-ietf-httpbis-message-signatures/).

## License

MIT
