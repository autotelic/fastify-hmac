'use strict'

const parseSignatureHeader = require('./parseSignatureHeader')

const getAlgorithm = (req, { getKeyIdMap }) => {
  const { keyId, algorithm } = parseSignatureHeader(req)

  const { name, algorithm: algorithmFromMap } = getKeyIdMap()[keyId] || {}

  if (!algorithmFromMap) {
    throw new Error('No algorithm found in algorithmMap for this keyId')
  }

  if (algorithm && algorithm !== name) {
    throw new Error('Algorithm from keyId is not compatible with algorithm signature header parameter')
  }

  return algorithmFromMap
}

module.exports = getAlgorithm
