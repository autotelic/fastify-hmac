'use strict'

function getSignature ({ signature }) {
  if (!signature) {
    throw new Error('Could not get signature: no signature found.')
  }
  return signature
}

module.exports = getSignature
