'use strict'

const crypto = require('crypto')
const parseSignatureHeader = require('./parseSignatureHeader')

const constructSignatureString = (req, options) =>
  calculateSignature({
    algorithm: options.getAlgorithm(req, options),
    sharedSecret: options.sharedSecret,
    message: getMessage(req, options),
    encoding: options.getSignatureEncoding(req, options)
  })

const getMessage = (req, options) => {
  const signature = parseSignatureHeader(req)
  const { headers, raw: { method, url } } = req

  return (signature.headers || '')
    .trim()
    .split(' ')
    .map((signatureHeader) => {
      switch (signatureHeader) {
        case '(request-target)':
          return `(request-target): ${method.toLowerCase()} ${url.toLowerCase()}`
        case '(created)':
          return `(created): ${parseInt(signature.created)}`
        case '(expires)':
          return `(expires): ${parseInt(signature.expires)}`
        case 'digest':
          return `${signatureHeader}: ${options.getDigest(req, options)}`
        default:
          return `${signatureHeader}: ${headers[signatureHeader]}`
      }
    }).join('\n')
}

const calculateSignature = ({ algorithm, sharedSecret, message, encoding }) =>
  crypto
    .createHmac(algorithm, sharedSecret)
    .update(message)
    .digest(encoding)
    .toString()

module.exports = constructSignatureString
