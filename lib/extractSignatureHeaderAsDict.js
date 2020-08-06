'use strict'

function extractSignatureHeaderAsDict ({ headers: { signature } }) {
  if (!signature) {
    return new Error('Request not signed.')
  }

  return signature.split(',').reduce((dict, field) => {
    // Regex split captures only the first instance of '=' delimiter
    // avoids further splitting a b64 signature with valid '=' symbols
    const [fieldKey, fieldValue] = field.split(/=(.+)/)
    return { ...dict, [fieldKey]: fieldValue }
  }, {})
}

module.exports = extractSignatureHeaderAsDict
