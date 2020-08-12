'use strict'

const { test } = require('tap')
const constructSignatureString = require('./constructSignatureString')

const defaultOptions = {
  sharedSecret: 'topSecret',
  getAlgorithm: () => 'sha512',
  getDigest: () => 'base64'
}

test('Constructs a signature string from the incoming request', async ({
  equal
}) => {
  const tests = [
    {
      description: 'Signature extracted from valid signature header',
      input: {
        headers: {
          signature:
            'keyId="key-a", headers="(request-target) (created) host", signature="MvgMxP1kAYkBWJ6WA9tbqka1gQRgCj14W4U2Wz9Ei780tr385Dd6/6RmXuUK+qE6Hk1D8lqowksfrvwy5nrh2g==", created=1402170695'
        },
        raw: { method: 'POST', url: '/' }
      },
      options: defaultOptions,
      expected:
        'MvgMxP1kAYkBWJ6WA9tbqka1gQRgCj14W4U2Wz9Ei780tr385Dd6/6RmXuUK+qE6Hk1D8lqowksfrvwy5nrh2g=='
    }
  ]

  tests.forEach(({ description, input, options, expected }) => {
    equal(constructSignatureString(input, options), expected, description)
  })
})
