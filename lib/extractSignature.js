'use strict'

function extractSignature ({ signature }) {
  if (!signature) {
    throw new Error('Signature not extracted.')
  }
  return signature
}

module.exports = extractSignature
