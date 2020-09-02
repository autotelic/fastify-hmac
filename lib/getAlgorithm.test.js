'use strict'

const { test } = require('tap')
const getAlgorithm = require('./getAlgorithm')

function createRequest (signature) {
  return {
    headers: {
      signature
    }
  }
}

const defaultOptions = {
  algorithmMap: {
    'test-key-a': {
      name: 'hs2019',
      algorithm: 'sha512'
    },
    'test-key-b': {
      name: 'hs2019',
      algorithm: 'sha256'
    }
  }
}

test('Constructs a matching Digest header from a valid request Digest header and body', async ({
  equal
}) => {
  const tests = [
    {
      description: 'Matching Digest header constructed from an incoming request - sha256',
      input: createRequest('keyId="test-key-a", algorithm="hs2019", created=1402170695, headers="(request-target) (created)", signature="someSignature"'),
      options: defaultOptions,
      expected: 'sha512'
    },
    {
      description: 'Matching Digest header constructed from an incoming request - sha256',
      input: createRequest('keyId="test-key-b", algorithm="hs2019", created=1402170695, headers="(request-target) (created)", signature="someSignature"'),
      options: defaultOptions,
      expected: 'sha256'
    }
  ]

  tests.forEach(({ description, input, options, expected }) => {
    equal(getAlgorithm(input, options), expected, description)
  })
})

test('Throws an error when algorithm value cannot be returned', async ({
  throws
}) => {
  const tests = [
    {
      description: 'Algorithm from keyId lookup is not compatible with algorithm signature header parameter',
      input: createRequest('keyId="test-key-a", algorithm="RSA-256", created=1402170695, headers="(request-target) (created)", signature="someSignature"'),
      options: defaultOptions,
      expected: new Error(
        'Algorithm from keyId is not compatible with algorithm signature header parameter'
      )
    },
    {
      description: 'keyId lookup does not result in an algorithm',
      input: createRequest('keyId="test-key-c", algorithm="hs2019", created=1402170695, headers="(request-target) (created)", signature="someSignature"'),
      options: defaultOptions,
      expected: new Error(
        'No algorithm found in algorithmMap for this keyId'
      )
    }
  ]

  tests.forEach(({ description, input, options, expected }) => {
    throws(
      function () {
        getAlgorithm(input, options)
      },
      expected,
      description
    )
  })
})
