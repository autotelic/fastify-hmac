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
  '61BBfYChNlz+ropuDa29i7Q15dGR3CMWo0URnvlSZoz6ILbg3Ha4UJ/S7AV0eXTB6Cq1/7Uczfk0B/n4CmAhRg=='
const defaultRequest = {
  headers: {
    signature: `keyId="key-a", headers="(request-target) (created) (expires) host", signature="${defaultSignature}", created=1402170695, expires=1402170895`
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
