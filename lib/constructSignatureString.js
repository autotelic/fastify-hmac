'use strict'

const crypto = require('crypto')
const parseSignatureHeader = require('./parseSignatureHeader')

const constructSignatureString = (req, options) =>
  calculateSignature({
    algorithm: options.getAlgorithm(),
    sharedSecret: options.sharedSecret,
    message: getMessage(req, options),
    encoding: options.getHMACEncoding()
  })

const getMessage = (req, options) => {
  const signature = parseSignatureHeader(req)
  const { headers, raw: { method, url } } = req

  return signature.headers
    .trim()
    .split(' ')
    .reduce((signatureInput, signatureHeader) => {
      if (signatureHeader === '(request-target)') {
        return [
          ...signatureInput,
          `(request-target): ${method.toLowerCase()} ${url.toLowerCase()}`
        ]
      }
      if (signatureHeader === '(created)') {
        return [...signatureInput, `(created): ${parseInt(signature.created)}`]
      }
      if (signatureHeader === '(expires)') {
        return [...signatureInput, `(expires): ${parseInt(signature.expires)}`]
      }
      if (signatureHeader === 'digest') {
        return [
          ...signatureInput,
          `${signatureHeader}: ${options.getDigest(req, options)}`
        ]
      }
      return [
        ...signatureInput,
        `${signatureHeader}: ${headers[signatureHeader]}`
      ]
    }, [])
    .join('\n')
}

const calculateSignature = ({ algorithm, sharedSecret, message, encoding }) =>
  crypto
    .createHmac(algorithm, sharedSecret)
    .update(message)
    .digest(encoding)
    .toString()

module.exports = constructSignatureString
