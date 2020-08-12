'use strict'

const crypto = require('crypto')
const parseSignatureHeader = require('./parseSignatureHeader')

const constructSignatureString = (
  req,
  { sharedSecret, getAlgorithm, getDigest }
) =>
  calculateSignature({
    algorithm: getAlgorithm(),
    sharedSecret,
    message: getMessage({ ...req, signature: parseSignatureHeader(req) }),
    digest: getDigest()
  })

const getMessage = ({ headers, signature, raw: { method, url } }) =>
  signature.headers
    .trim()
    .split(' ')
    .reduce((signatureInput, signatureHeader) => {
      if (signatureHeader === '(request-target)') {
        return [...signatureInput, `(request-target): ${method} ${url}`]
      }

      if (signatureHeader === '(created)') {
        return [...signatureInput, `(created): ${signature.created}`]
      }

      return [
        ...signatureInput,
        `${signatureHeader}: ${headers[signatureHeader]}`
      ]
    }, [])
    .join('\n')

const calculateSignature = ({ algorithm, sharedSecret, message, digest }) => {
  return crypto
    .createHmac(algorithm, sharedSecret)
    .update(message)
    .digest(digest)
    .toString()
}

module.exports = constructSignatureString
