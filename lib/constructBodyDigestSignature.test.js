'use strict'

const { test } = require('tap')
const constructBodyDigestSignature = require('./constructBodyDigestSignature')

test('Constructs a matching Digest header from a valid request Digest header and body', async ({
  equal
}) => {
  const tests = [
    {
      description: 'Matching Digest header constructed from an incoming request - using self generated values',
      input: {
        headers: {
          digest: 'sha-256=k6I5cakU5erL8KjSUVTNownDwccvu5kU1Hxg88toFYg=',
          'content-type': 'application/json'
        },
        body: { hello: 'world' }
      },
      expected: 'sha-256=k6I5cakU5erL8KjSUVTNownDwccvu5kU1Hxg88toFYg='
    },
    {
      description: 'Matching Digest header constructed from an incoming request - using self generated values',
      input: {
        headers: {
          digest: 'sha-512=+PtokCNHosgo04ww4cNhd4yJxhMjLzWjDAKtKwQZDT4Ef9v/PrS/+BQLX4IX5dZkUMK/tQo7Uyc68RkhNyCZVg==',
          'content-type': 'application/json'
        },
        body: { hello: 'world' }
      },
      expected: 'sha-512=+PtokCNHosgo04ww4cNhd4yJxhMjLzWjDAKtKwQZDT4Ef9v/PrS/+BQLX4IX5dZkUMK/tQo7Uyc68RkhNyCZVg=='
    },
    {
      description: 'Matching Digest header constructed from an incoming request - Digest constructed from Jenkins',
      input: {
        headers: {
          digest: 'SHA-512=sLhuceAzAMbd17PdLQUQ7lY50I4PJ1XmZF37Mt3L1GmAKfYYx/GbqevL9A1bT3D+AbQd1D3/EVQtGjGorVcIvA==',
          'content-type': 'application/json'
        },
        body: {
          project: null,
          owner: 'telus',
          branch: null,
          risk_inputs: [{ input_name: 'embargo', input_args: {} }],
          webhooks: { chatops: '<test-url>' }
        }
      },
      expected: 'SHA-512=sLhuceAzAMbd17PdLQUQ7lY50I4PJ1XmZF37Mt3L1GmAKfYYx/GbqevL9A1bT3D+AbQd1D3/EVQtGjGorVcIvA=='
    }
  ]

  tests.forEach(({ description, input, expected }) => {
    equal(constructBodyDigestSignature(input), expected, description)
  })
})

test('Throws an error when Digest cannot be constructed', async ({
  throws
}) => {
  const tests = [
    {
      description: 'Unrecognized media-type in Content-Type header field returns an error',
      input: {
        headers: {
          digest: 'sha-256=k6I5cakU5erL8KjSUVTNownDwccvu5kU1Hxg88toFYg=',
          'content-type': 'nothing/nothing'
        },
        body: { hello: 'world' }
      },
      expected: new Error(
        'Unrecognized media-type'
      )
    },
    {
      description: 'No Content-Type header field returns an error',
      input: {
        headers: {
          digest: 'sha-256=k6I5cakU5erL8KjSUVTNownDwccvu5kU1Hxg88toFYg='
        },
        body: { hello: 'world' }
      },
      expected: new Error(
        'No Content-Type Header in request'
      )
    },
    {
      description: 'Calculated digest value not matching Request Header digest value field returns an error',
      input: {
        headers: {
          digest: 'sha-256=k6I5cakU5erL8KjSUVTNownThisDigestIsWrongDwccvu5kU1Hxg88toFYg=',
          'content-type': 'application/json'
        },
        body: { hello: 'world' }
      },
      expected: new Error(
        'Calculated Digest does not match Digest from Request Header'
      )
    }
  ]

  tests.forEach(({ description, input, expected }) => {
    throws(
      function () {
        constructBodyDigestSignature(input)
      },
      expected,
      description
    )
  })
})
