'use strict'

const parseSignatureHeader = require('./parseSignatureHeader')

const getAlgorithm = (req, { algorithmMap }) => {
  const { keyId, algorithm } = parseSignatureHeader(req)

  if (!algorithmMap[algorithm]) {
    throw new Error('No entry for this algorithm in algorithmMap')
  }

  const algorithmFromMap = algorithmMap[algorithm][keyId]

  if (!algorithmFromMap) {
    throw new Error('No entry for this keyId in algorithmMap')
  }

  return algorithmFromMap
}

module.exports = getAlgorithm
