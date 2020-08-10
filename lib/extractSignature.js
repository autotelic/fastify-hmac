'use strict'

const parseSignatureHeader = require('./parseSignatureHeader')

// Public Functions
function extractSignature (req) {
  return pipe(parseSignatureHeader, getSignature)(req)
}

// Private Functions
const pipe = (...functions) => (value) =>
  functions.reduce(
    (currentValue, currentFunction) => currentFunction(currentValue),
    value
  )

const getSignature = ({ signature }) => {
  if (!signature) {
    throw new Error('Could not get signature: no signature found.')
  }
  return signature
}

module.exports = extractSignature
