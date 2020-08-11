'use strict'

function parseSignatureHeader ({ headers: { signature } }) {
  if (!signature) {
    throw new Error(
      'Could not parse signature header: no Signature Header found.'
    )
  }

  return (
    signature
      .trim()
      // Regex replace removes quotes from fieldValues
      .replace(/"/g, '')
      .split(', ')
      .reduce((dict, field) => {
        // Regex split captures only the first instance of '=' delimiter
        // avoids further splitting a b64 signature with valid '=' symbols
        const [fieldKey, fieldValue] = field.split(/=(.+)/)
        return { ...dict, [fieldKey]: fieldValue }
      }, {})
  )
}

module.exports = parseSignatureHeader
