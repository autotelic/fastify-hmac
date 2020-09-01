const crypto = require('crypto')

const getDigest = (
  {
    headers: {
      digest,
      'content-type': contentType,
      'content-encoding': contentEncoding
    },
    body
  }, options
) => {
  const { formattedAlgorithm, digestAlgorithm, digestValue } = parseBodyDigestHeader(digest)

  const calculatedDigest = calculateDigest({
    algorithm: formattedAlgorithm,
    message: JSON.stringify(body),
    encoding: options.digestEncoding
  })

  if (calculatedDigest !== digestValue) {
    throw new Error('Calculated Digest does not match Digest from Request Header')
  }

  return `${digestAlgorithm}=${calculatedDigest}`
}

const parseBodyDigestHeader = (requestDigestHeader) => {
  const [digestAlgorithm, digestValue] = requestDigestHeader.split(/=(.+)/)
  const formattedAlgorithm = digestAlgorithm.toLowerCase().split('-').join('')

  return { formattedAlgorithm, digestAlgorithm, digestValue }
}

const calculateDigest = ({ algorithm, message, encoding }) =>
  crypto.createHash(algorithm)
    .update(message)
    .digest(encoding)
    .toString()

module.exports = getDigest
