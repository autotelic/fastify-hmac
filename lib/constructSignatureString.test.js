'use strict'

const { test } = require('tap')
const constructSignatureString = require('./constructSignatureString')

const defaultOptions = {
  sharedSecret: null,
  getAlgorithm: () => {
    throw new Error('No getAlgorithm function provided.')
  },
  getDigest: () => {
    throw new Error('No getDigest function provided.')
  }
}
const defaultSignature =
  'Nstb3q49bne90WmkbiZ9eyRtKCUmOWvc/kFyw/ftfLtqAXfRZGBk+hSJkXs0GRRm4Q/58c/pdIKj5DND11/fwQ=='
const defaultRequest = {
  headers: {
    signature: `keyId="key-a", headers="(request-target) (created) (expires) host", signature="${defaultSignature}", created=1402170695, expires=1402170895`,
    host: 'localhost:3000'
  },
  raw: { method: 'POST', url: '/' }
}

test('Constructs a signature string from the incoming request', async ({
  equal
}) => {
  const tests = [
    {
      description:
        'Matching signature constructed when a valid request is provided',
      input: defaultRequest,
      options: {
        ...defaultOptions,
        sharedSecret: 'topSecret',
        getAlgorithm: () => 'sha512',
        getDigest: () => 'base64'
      },
      expected: defaultSignature
    },
    {
      description:
        'Matching signature constructed when a valid request using a digest header is provided',
      input: {
        headers: {
          signature: 'keyId="key-a", headers="(request-target) (created) (expires) host digest content-type", signature="GOVrM5Pez5MHw5EBMbNHXFK00Ra6fsFSAdOlafEEX6YQ85SVALDTQRbEQUdYE8ZOD8eVbRkEzKBjKI4jK2hGWg==", created=1402170695, expires=1402170895',
          host: 'localhost:3000',
          digest: 'sha-256=k6I5cakU5erL8KjSUVTNownDwccvu5kU1Hxg88toFYg=',
          'content-type': 'application/json'
        },
        body: { hello: 'world' },
        raw: { method: 'POST', url: '/' }
      },
      options: {
        ...defaultOptions,
        sharedSecret: 'topSecret',
        getAlgorithm: () => 'sha512',
        getDigest: () => 'base64'
      },
      expected: 'GOVrM5Pez5MHw5EBMbNHXFK00Ra6fsFSAdOlafEEX6YQ85SVALDTQRbEQUdYE8ZOD8eVbRkEzKBjKI4jK2hGWg=='
    }
  ]

  tests.forEach(({ description, input, options, expected }) => {
    equal(constructSignatureString(input, options), expected, description)
  })
})

test('Throws an error when a signature string cannot be constructed', async ({
  throws
}) => {
  const tests = [
    {
      description:
        'Throws an error when no getAlgorithm function is provided to plugin',
      input: defaultRequest,
      options: {
        ...defaultOptions,
        sharedSecret: 'topSecret',
        getDigest: () => 'base64'
      },
      expected: new Error('No getAlgorithm function provided.')
    },
    {
      description:
        'Throws an error when no getDigest function is provided to plugin',
      input: defaultRequest,
      options: {
        ...defaultOptions,
        sharedSecret: 'topSecret',
        getAlgorithm: () => 'sha512'
      },
      expected: new Error('No getDigest function provided.')
    }
  ]

  tests.forEach(({ description, input, options, expected }) => {
    throws(
      function () {
        constructSignatureString(input, options)
      },
      expected,
      description
    )
  })
})
