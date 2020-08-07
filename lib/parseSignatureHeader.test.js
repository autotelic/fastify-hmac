'use strict'

const { test } = require('tap')
const parseSignatureHeader = require('./parseSignatureHeader')

test('Signature header is extracted as a dictionary.', async ({ same }) => {
  const tests = [
    {
      description: 'Dictionary created from valid signature header',
      input: { headers: { signature: 'signature=1d3g5h7, biff=buzz' } },
      expected: { signature: '1d3g5h7', biff: 'buzz' }
    },
    {
      description: "Dictionary respects '=' in field values as valid character",
      input: { headers: { signature: 'signature=2d3g=5h7, biff=buzz' } },
      expected: { signature: '2d3g=5h7', biff: 'buzz' }
    }
  ]

  tests.forEach(({ description, input, expected }) => {
    same(parseSignatureHeader(input), expected, description)
  })
})

test('Errors are thrown when input is unparseable', async ({ throws }) => {
  const tests = [
    {
      description: 'No signature header returns an error',
      input: { headers: {} },
      expected: new Error(
        'Could not parse signature header: no Signature found.'
      )
    }
  ]

  tests.forEach(({ description, input, expected }) => {
    throws(
      function () {
        parseSignatureHeader(input)
      },
      expected,
      description
    )
  })
})
