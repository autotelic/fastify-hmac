'use strict'

const { test } = require('tap')
const getDigest = require('./getDigest')

function createRequest (digest) {
  return {
    headers: {
      digest
    },
    body: { hello: 'world' }
  }
}

test('Constructs a matching Digest header from a valid request Digest header and body', async ({
  equal
}) => {
  const tests = [
    {
      description: 'Matching Digest header constructed from an incoming request - sha256',
      input: createRequest('sha-256=k6I5cakU5erL8KjSUVTNownDwccvu5kU1Hxg88toFYg='),
      options: {
        digestEncoding: 'base64'
      },
      expected: 'sha-256=k6I5cakU5erL8KjSUVTNownDwccvu5kU1Hxg88toFYg='
    },
    {
      description: 'Matching Digest header constructed from an incoming request - sha512',
      input: createRequest('sha-512=+PtokCNHosgo04ww4cNhd4yJxhMjLzWjDAKtKwQZDT4Ef9v/PrS/+BQLX4IX5dZkUMK/tQo7Uyc68RkhNyCZVg=='),
      options: {
        digestEncoding: 'base64'
      },
      expected: 'sha-512=+PtokCNHosgo04ww4cNhd4yJxhMjLzWjDAKtKwQZDT4Ef9v/PrS/+BQLX4IX5dZkUMK/tQo7Uyc68RkhNyCZVg=='
    }
  ]

  tests.forEach(({ description, input, options, expected }) => {
    equal(getDigest(input, options), expected, description)
  })
})

test('Throws an error when Digest cannot be constructed', async ({
  throws
}) => {
  const tests = [
    {
      description: 'Calculated digest value not matching Request Header digest value field returns an error',
      input: createRequest('sha-256=k6I5cakU5erL8KjSUVTNownThisDigestIsWrongDwccvu5kU1Hxg88toFYg='),
      options: {
        digestEncoding: 'base64'
      },
      expected: new Error(
        'Calculated Digest does not match Digest from Request Header'
      )
    }
  ]

  tests.forEach(({ description, input, options, expected }) => {
    throws(
      function () {
        getDigest(input, options)
      },
      expected,
      description
    )
  })
})
