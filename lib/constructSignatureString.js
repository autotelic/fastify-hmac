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
    .reduce(
      (messageArray, header) => [
        ...messageArray,
        header === '(request-target)'
          ? `${header}: ${req.method} ${req.url}`
          : header === '(created)'
            ? `${header}: ${parsedSignatureHeader.created}`
            : `${header}: ${req.headers[header]}`
      ],
      []
    )
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
