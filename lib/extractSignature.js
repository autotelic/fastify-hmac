'use strict'

const extractSignatureHeaderAsDict = require('./extractSignatureHeaderAsDict')

function extractSignature (req) {
  const signatureHeaderDict = extractSignatureHeaderAsDict(req)
  if (signatureHeaderDict instanceof Error) {
    return signatureHeaderDict
  }
  if (!signatureHeaderDict.signature) {
    return new Error('Signature not extracted.')
  }
  return signatureHeaderDict.signature
}

module.exports = extractSignature
