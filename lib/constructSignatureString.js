'use strict'

const crypto = require('crypto')
const parseSignatureHeader = require('./parseSignatureHeader')
const constructBodyDigestSignature = require('./constructBodyDigestSignature')

const constructSignatureString = (req, options) =>
  calculateSignature({
    algorithm: options.getAlgorithm(),
    sharedSecret: options.sharedSecret,
    message: getMessage({ ...req, signature: parseSignatureHeader(req) }),
    digest: options.getDigest()
  })

const getMessage = ({ headers, signature, body, raw: { method, url } }) =>
  signature.headers
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
          `${signatureHeader}: ${constructBodyDigestSignature(headers[signatureHeader], body)}`
        ]
      }
      return [
        ...signatureInput,
        `${signatureHeader}: ${headers[signatureHeader]}`
      ]
    }, [])
    .join('\n')

const calculateSignature = ({ algorithm, sharedSecret, message, digest }) =>
  crypto
    .createHmac(algorithm, sharedSecret)
    .update(message)
    .digest(digest)
    .toString()

module.exports = constructSignatureString
