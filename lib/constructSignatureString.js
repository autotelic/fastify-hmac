'use strict'

const crypto = require('crypto')
const parseSignatureHeader = require('./parseSignatureHeader')

// Public Functions
function constructSignatureString (req, sharedSecret) {
  const parsedSignatureHeader = parseSignatureHeader(req)

  return calculateSignature({
    algorithm: getAlgorithm(parsedSignatureHeader),
    secret: sharedSecret,
    message: getMessage(req, parsedSignatureHeader),
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
    .join('\n')

const getAlgorithm = ({ keyId }) => {
  if (!keyId) {
    throw new Error('Could not get keyId: no keyId found in Signature Header.')
  }

  const validAlgos = { 'key-a': 'sha512' }
  return validAlgos[keyId]
}

const calculateSignature = ({ algorithm, secret, message, digest }) =>
  crypto
    .createHmac(algorithm, secret)
    .update(message)
    .digest(digest)
    .toString()

module.exports = constructSignatureString
