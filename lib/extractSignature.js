'use strict'

const parseSignatureHeader = require('./parseSignatureHeader')

function extractSignature (req) {
  return parseSignatureHeader(req).signature
}

module.exports = extractSignature
