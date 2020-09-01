'use strict'

const crypto = require('crypto')

const extractShopifySignature = ({ query }) => {
  if (!query.hmac) {
    throw new Error(
      'Could not extract HMAC parameter: no HMAC parameter found in query.'
    )
  }
  return query.hmac
}

const constructShopifySignature = (req, { getAlgorithm, sharedSecret, getDigest }) =>
  calculateHmacParam({
    algorithm: getAlgorithm(),
    sharedSecret: sharedSecret,
    message: getMessage({ ...req }),
    digest: getDigest()
  })

const getMessage = ({ query }) => {
  const { hmac, ...hash } = query

  // Resolves query "...ids[]=1&ids[]=2..." into 'ids=["1", "2"]' as per Shopify Docs
  // TODO(jeff-sexton): Determine if it is necessary to account for query array formats: "...ids=1&ids=2..." and "...ids=1,2..."
  if (Object.keys(hash).includes('ids[]')) {
    hash.ids = `["${hash['ids[]'].join('", "')}"]`
    delete hash['ids[]']
  }

  const hashKeys = Object.keys(hash)
  hashKeys.sort()

  const message = hashKeys
    .reduce((accumulator, key) => {
      accumulator.push(`${key}=${hash[key]}`)
      return accumulator
    }, [])
    .join('&')

  return message
}

const calculateHmacParam = ({ algorithm, sharedSecret, message, digest }) =>
  crypto
    .createHmac(algorithm, sharedSecret)
    .update(message)
    .digest(digest)
    .toString()

module.exports = {
  extractShopifySignature,
  constructShopifySignature
}
