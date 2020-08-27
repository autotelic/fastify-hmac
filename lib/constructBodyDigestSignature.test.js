'use strict'

const { test } = require('tap')
const constructBodyDigestSignature = require('./constructBodyDigestSignature')

test('Constructs a matching Digest header from a valid request Digest header and body', async ({
  equal
}) => {
  const tests = [
    {
      description: 'Matching Digest header constructed from an incoming request - Draft paper example',
      input: {
        headers: {
          digest: 'sha-256=4REjxQ4yrqUVicfSKYNO/cF9zNj5ANbzgDZt3/h3Qxo=',
          'content-type': 'application/json'
        },
        body: { hello: 'world' }
      },
      expected: 'sha-256=4REjxQ4yrqUVicfSKYNO/cF9zNj5ANbzgDZt3/h3Qxo='
    },
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
      description: 'Matching Digest header constructed from an incoming request - cybersouce baseline', // https://developer.cybersource.com/api/developer-guides/dita-gettingstarted/authentication/GenerateHeader/httpSignatureAuthentication/MessageTesting.html
      input: {
        headers: {
          digest: 'SHA-256=a/goIo1XUCr80rnKFCWp7yRpwVL50E9RaunuEHh11XM='
        },
        body: {
          clientReferenceInformation: {
            code: 'TC50171_3'
          },
          processingInformation: {
            commerceIndicator: 'internet'
          },
          paymentInformation: {
            card: {
              number: '4111111111111111',
              expirationMonth: '12',
              expirationYear: '2031',
              securityCode: '123'
            }
          },
          orderInformation: {
            amountDetails: {
              totalAmount: '102.21',
              currency: 'USD'
            },
            billTo: {
              firstName: 'John',
              lastName: 'Doe',
              company: 'Visa',
              address1: '1 Market St',
              address2: 'Address 2',
              locality: 'san francisco',
              administrativeArea: 'CA',
              postalCode: '94105',
              country: 'US',
              email: 'test@cybs.com',
              phoneNumber: '4158880000'
            }
          }
        }
      },
      expected: 'SHA-256=a/goIo1XUCr80rnKFCWp7yRpwVL50E9RaunuEHh11XM='
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
