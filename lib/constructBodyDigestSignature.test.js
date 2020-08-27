'use strict'

const { test } = require('tap')
const constructBodyDigestSignature = require('./constructBodyDigestSignature')

test('Constructs a matching Digest header from a valid request Digest header and body', async ({
  equal
}) => {
  const tests = [
    {
      description: 'Matching Digest header constructed from an incoming request',
      input: {
        headers: {
          digest: 'sha-256=4REjxQ4yrqUVicfSKYNO/cF9zNj5ANbzgDZt3/h3Qxo=',
          'content-type': 'application/json'
        },
        body: { hello: 'world' }
      },
      expected: 'sha-256=4REjxQ4yrqUVicfSKYNO/cF9zNj5ANbzgDZt3/h3Qxo='
    }
  ]

  tests.forEach(({ description, input, expected }) => {
    equal(constructBodyDigestSignature(input), expected, description)
  })
})

// test('Throws an error when signature cannot be extracted', async ({
//   throws
// }) => {
//   const tests = [
//     {
//       description: 'No signature field in signature header returns an error',
//       input: { headers: { signature: 'biff=buzz' } },
//       expected: new Error(
//         'Could not extract signature: no signature found in Signature Header.'
//       )
//     }
//   ]

//   tests.forEach(({ description, input, expected }) => {
//     throws(
//       function () {
//         constructBodyDigestSignature(input)
//       },
//       expected,
//       description
//     )
//   })
// })
