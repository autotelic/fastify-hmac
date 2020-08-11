'use strict'

const { test } = require('tap')
const constructSignatureString = require('./constructSignatureString')

test('Extracts a signature from a valid signature header', async ({
  equal
}) => {
  const tests = [
    {
      description: 'Signature extracted from valid signature header',
      input: { headers: { signature: 'signature=1d3g5h7, biff=buzz' } },
      expected: '1d3g5h7'
    }
  ]

  tests.forEach(({ description, input, expected }) => {
    equal(constructSignatureString(input), expected, description)
  })
})

test('Throws an error when signature cannot be extracted', async ({
  throws
}) => {
  const tests = [
    {
      description: 'No signature field in signature header returns an error',
      input: { headers: { signature: 'biff=buzz' } },
      expected: new Error(
        'Could not extract signature: no signature found in Signature Header.'
      )
    }
  ]

  tests.forEach(({ description, input, expected }) => {
    throws(
      function () {
        constructSignatureString(input)
      },
      expected,
      description
    )
  })
})
