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
    hs2019: {
      'test-key-a': 'sha512',
      'test-key-b': 'sha256'
    }
  }
}

test('Returns an algorithm string based on Signature header keyId value', async ({
  equal
}) => {
  const tests = [
    {
      description: 'Matching algorithm for test-key-a',
      input: createRequest('keyId="test-key-a", algorithm="hs2019", created=1402170695, headers="(request-target) (created)", signature="someSignature"'),
      options: defaultOptions,
      expected: 'sha512'
    },
    {
      description: 'Matching algorithm for test-key-b',
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
        'No entry for this algorithm in algorithmMap'
      )
    },
    {
      description: 'keyId lookup does not result in an algorithm',
      input: createRequest('keyId="test-key-c", algorithm="hs2019", created=1402170695, headers="(request-target) (created)", signature="someSignature"'),
      options: defaultOptions,
      expected: new Error(
        'No entry for this keyId in algorithmMap'
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
