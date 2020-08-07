'use strict'

const pipe = require('./pipe')
const parseSignatureHeader = require('./parseSignatureHeader')
const getSignature = require('./getSignature')

function extractSignature (req) {
  return pipe(parseSignatureHeader, getSignature)(req)
}

module.exports = extractSignature
