'use strict'

const crypto = require('crypto')
const parseSignatureHeader = require('./parseSignatureHeader')

// Public Functions
function constructSignatureString (req, sharedSecret) {
  const parsedSignatureHeader = parseSignatureHeader(req)

  return calculateSignature({
    algorithm: getAlgorithm(parsedSignatureHeader),
    sharedSecret,
    message: getMessage(req, parsedSignatureHeader),
    // TODO(togmund): Decode encoded digest instead of hardcoded 'hex'
    digest: 'hex'
  })
}

// Private Functions
const getMessage = (req, parsedSignatureHeader) =>
  parsedSignatureHeader.headers
    .trim()
    .split(' ')
    .reduce((messageArray, parsedHeader) => {
      if (parsedHeader === '(request-target)') {
        return [...messageArray, `(request-target): ${req.method} ${req.url}`]
      }

      if (parsedHeader === '(created)') {
        return [...messageArray, `(created): ${parsedSignatureHeader.created}`]
      }

      return [...messageArray, `${parsedHeader}: ${req.headers[parsedHeader]}`]
    }, [])
    // TODO(togmund): Run tests with examples to select correct joiner
    .join('\n')

// TODO(togmund): Placeholder function for testing, see issues #2 && #3 for details
const getAlgorithm = ({ keyId }) => {
  if (!keyId) {
    throw new Error('Could not get keyId: no keyId found in Signature Header.')
  }

  const validAlgos = { 'key-a': 'sha512' }

  if (!validAlgos[keyId]) {
    throw new Error(
      'Could not get Algorithm: no algorithm associated with that key.'
    )
  }

  return validAlgos[keyId]
}

const calculateSignature = ({ algorithm, sharedSecret, message, digest }) =>
  crypto
    .createHmac(algorithm, sharedSecret)
    .update(message)
    .digest(digest)
    .toString()

module.exports = constructSignatureString
