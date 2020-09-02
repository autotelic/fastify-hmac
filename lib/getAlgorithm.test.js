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

test('Constructs a matching Digest header from a valid request Digest header and body', async ({
  equal
}) => {
  const tests = [
    {
      description: 'Matching Digest header constructed from an incoming request - sha256',
      input: createRequest('keyId="test-key-a", algorithm="hs2019", created=1402170695, headers="(request-target) (created)", signature="KXUj1H3ZOhv3Nk4xlRLTn4bOMlMOmFiud3VXrMa9MaLCxnVmrqOX5BulRvB65YW/wQp0oT/nNQpXgOYeY8ovmHlpkRyz5buNDqoOpRsCpLGxsIJ9cX8XVsM9jy+Q1+RIlD9wfWoPHhqhoXt35ZkasuIDPF/AETuObs9QydlsqONwbK+TdQguDK/8Va1Pocl6wK1uLwqcXlxhPEb55EmdYB9pddDyHTADING7K4qMwof2mC3t8Pb0yoLZoZX5a4Or4FrCCKK/9BHAhq/RsVk0dTENMbTB4i7cHvKQu+o9xuYWuxyvBa0Z6NdOb0di70cdrSDEsL5Gz7LBY5J2N9KdGg=="'),
      options: {
        algorithmMap: {}
      },
      expected: 'sha512'
    }
  ]

  tests.forEach(({ description, input, options, expected }) => {
    equal(getAlgorithm(input, options), expected, description)
  })
})

test('Throws an error when algorithm cannot be returned', async ({
  throws
}) => {
  const tests = [
    {
      description: 'Algorithm from keyId lookup is not compatible with algorithm signature header parameter',
      input: createRequest(''),
      options: {
        algorithmMap: {}
      },
      expected: new Error(
        'Algorithm from keyId is not compatible with algorithm signature header parameter'
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
