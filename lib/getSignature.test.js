'use strict'

const { test } = require('tap')
const getSignature = require('./getSignature')

test('Extracts a signature from a valid signature header', async ({
  equal
}) => {
  const tests = [
    {
      description: 'Signature extracted from valid signature header',
      input: { signature: '1d3g5h7' },
      expected: '1d3g5h7'
    },
    {
      description: "Dictionary respects '=' in field values as valid character",
      input: { signature: '2d3g=5h7' },
      expected: '2d3g=5h7'
    }
  ]

  tests.forEach(({ description, input, expected }) => {
    equal(getSignature(input), expected, description)
  })
})

test('Throws an error when signature cannot be extracted', async ({
  throws
}) => {
  const tests = [
    {
      description: 'No signature field in signature header returns an error',
      input: { notSignature: 'buzz' },
      expected: new Error('Could not get signature: no signature found.')
    }
  ]

  tests.forEach(({ description, input, expected }) => {
    throws(
      function () {
        getSignature(input)
      },
      expected,
      description
    )
  })
})
